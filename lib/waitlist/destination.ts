import { createHmac } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import type { WaitlistSubmission } from "./schema";

/**
 * WHERE A WAITLIST SUBMISSION ACTUALLY GOES.
 *
 * SERVER ONLY — this module imports node:crypto and node:fs. Never import it
 * from a client component.
 *
 * The destination is resolved from environment variables at call time (not at
 * module load), so a deploy can change where submissions land without a
 * rebuild, and so tests can drive it directly.
 *
 * Resolution order:
 *   1. WAITLIST_WEBHOOK_URL  → signed HTTPS webhook
 *   2. WAITLIST_FILE_PATH    → append-only JSONL on disk
 *      (defaulted to .data/waitlist.jsonl outside production only)
 *   3. nothing               → null, and the route MUST fail loudly with 503.
 *
 * There is deliberately no "log it and pretend" fallback. A submission that is
 * not stored somewhere durable is a lost submission, and the person who typed
 * their address is entitled to know that.
 */

/** Default local sink. Only used when NODE_ENV !== "production". */
export const DEFAULT_FILE_PATH = ".data/waitlist.jsonl";

const WEBHOOK_TIMEOUT_MS = 10_000;

export interface DeliveryMeta {
  /** Which surface captured it: the hero inline field, or the full form. */
  source?: string;
  /** Referring page, when the browser sent one. Never an IP. */
  referer?: string;
  /** Coarse client string. Never combined with an IP. */
  userAgent?: string;
  /** Server-generated id for this delivery. Also returned to the client. */
  id: string;
  /** ISO-8601 timestamp of receipt. */
  receivedAt: string;
  /**
   * The client's Idempotency-Key, when supplied. A submission and its later
   * "migration details" follow-up share one key, so a downstream system can
   * merge them into a single record.
   */
  idempotencyKey?: string;
}

export interface WaitlistDestination {
  /** Human-readable adapter name. Safe to log; contains no secrets. */
  name: string;
  deliver(submission: WaitlistSubmission, meta: DeliveryMeta): Promise<void>;
}

/**
 * HMAC-SHA256 over `${timestamp}.${body}`, hex encoded.
 * Receivers should recompute this and compare in constant time, and should
 * reject timestamps outside a few minutes of now to blunt replay.
 */
export function signWebhookPayload(
  secret: string,
  timestamp: string,
  body: string,
): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

function buildEnvelope(submission: WaitlistSubmission, meta: DeliveryMeta) {
  return {
    id: meta.id,
    receivedAt: meta.receivedAt,
    idempotencyKey: meta.idempotencyKey,
    source: "hajer.ai/waitlist",
    submission,
  };
}

export function createWebhookDestination(
  url: string,
  secret?: string,
): WaitlistDestination {
  return {
    name: "webhook",
    async deliver(submission, meta) {
      const body = JSON.stringify(buildEnvelope(submission, meta));
      const headers: Record<string, string> = {
        "content-type": "application/json",
        accept: "application/json",
      };

      if (secret) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        headers["x-hajer-timestamp"] = timestamp;
        headers["x-hajer-signature"] = `sha256=${signWebhookPayload(
          secret,
          timestamp,
          body,
        )}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
        cache: "no-store",
      });

      if (!response.ok) {
        // Status only. The response body of a third-party endpoint can contain
        // tokens, internal hostnames, or echoed PII — it never reaches our logs.
        throw new Error(`Waitlist webhook responded with status ${response.status}`);
      }
    },
  };
}

export function createFileDestination(filePath: string): WaitlistDestination {
  return {
    name: "file",
    async deliver(submission, meta) {
      const absolute = path.isAbsolute(filePath)
        ? filePath
        : path.join(/* turbopackIgnore: true */ process.cwd(), filePath);

      await mkdir(path.dirname(absolute), { recursive: true });
      await appendFile(
        absolute,
        `${JSON.stringify(buildEnvelope(submission, meta))}\n`,
        "utf8",
      );
    },
  };
}

/**
 * Supabase, via PostgREST directly. No client library — one fetch to one
 * endpoint does not justify a dependency, and this works unchanged on Node and
 * on the Edge runtime.
 *
 * UPSERT ON EMAIL. `Prefer: resolution=merge-duplicates` against the UNIQUE
 * email column means a repeat signup ENRICHES the existing row rather than
 * creating a duplicate — which is exactly the two-step flow the form uses
 * (email first, migration detail after). Nulls are stripped from the payload so
 * a bare re-submit can never blank out details the person already gave us.
 *
 * The service-role key bypasses RLS. It is server-only and must never be
 * exposed to the browser; the table's RLS is on with no policies precisely so
 * that a leaked anon key is worth nothing.
 */
export function createSupabaseDestination(
  url: string,
  serviceRoleKey: string,
): WaitlistDestination {
  const endpoint =
    `${url.replace(/\/+$/, "")}/rest/v1/waitlist?on_conflict=email`;

  return {
    name: "supabase",
    async deliver(submission, meta) {
      const row: Record<string, unknown> = {
        email: submission.email,
        company: submission.company,
        role: submission.role,
        trace_platform: submission.tracePlatform,
        current_model: submission.currentModel,
        candidate_model: submission.candidateModel,
        deadline: submission.deadline,
        design_partner: submission.designPartner ?? false,
        // No default here on purpose. An undefined source is STRIPPED below,
        // so the column is omitted from the upsert and the existing value
        // survives; the table's own DEFAULT covers a genuine first insert.
        // Defaulting here would re-send the column on every enrichment and
        // overwrite the first-touch surface.
        source: meta.source,
        idempotency_key: meta.idempotencyKey,
        referer: meta.referer,
        user_agent: meta.userAgent,
      };
      // Strip undefined/null so an enrichment PATCH never nulls a prior value.
      for (const k of Object.keys(row)) {
        if (row[k] === undefined || row[k] === null) delete row[k];
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: serviceRoleKey,
          authorization: `Bearer ${serviceRoleKey}`,
          // merge-duplicates = upsert on the UNIQUE email column.
          prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(row),
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
        cache: "no-store",
      });

      if (!response.ok) {
        // Status only. A PostgREST error body can echo the row back, and the
        // row contains the person's email.
        throw new Error(`Supabase responded with status ${response.status}`);
      }
    },
  };
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Resolve the configured destination, or null when nothing is configured.
 * Callers must treat null as a hard failure, never as a silent success.
 */
export function resolveDestination(): WaitlistDestination | null {
  // Supabase first: it is the production destination.
  const supabaseUrl = readEnv("SUPABASE_URL");
  const serviceKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (supabaseUrl && serviceKey) {
    return createSupabaseDestination(supabaseUrl, serviceKey);
  }

  const webhookUrl = readEnv("WAITLIST_WEBHOOK_URL");
  if (webhookUrl) {
    return createWebhookDestination(webhookUrl, readEnv("WAITLIST_WEBHOOK_SECRET"));
  }

  const configuredPath = readEnv("WAITLIST_FILE_PATH");
  if (configuredPath) {
    // Explicitly configured: honoured everywhere, including production, because
    // an append-only file on a self-hosted box is a real durable destination.
    return createFileDestination(configuredPath);
  }

  if (process.env.NODE_ENV !== "production") {
    return createFileDestination(DEFAULT_FILE_PATH);
  }

  return null;
}
