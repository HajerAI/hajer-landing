import { createHash, randomUUID } from "node:crypto";

import { createPostHogClient } from "@/lib/posthog-server";
import { resolveDestination, type DeliveryMeta } from "@/lib/waitlist/destination";
import { resolveFounderFollowupSender } from "@/lib/waitlist/founder-followup";
import { checkRateLimit, hashIdentifier } from "@/lib/waitlist/rate-limit";
import {
  HONEYPOT_FIELD,
  hasMigrationDetails,
  validateSubmission,
  type WaitlistSubmission,
} from "@/lib/waitlist/schema";

export const runtime = "nodejs";

/**
 * WAITLIST INTAKE.
 *
 * The single rule this route exists to enforce: never tell a person they are
 * on the list unless their address actually reached a durable destination.
 * Every failure path below returns ok:false with a code the client renders as
 * a failure — there is no branch that fakes success.
 *
 * Request order: parse → honeypot → validate → idempotency → rate limit →
 * resolve destination → deliver.
 */

/**
 * Messages are shown verbatim to a human. Plain, honest, no blame, no spin.
 *
 * Each one states the REASON and the REMEDY only — never the outcome. The
 * caller supplies the outcome ("Your email was not recorded."), so these
 * compose after any heading without repeating it.
 */
const MESSAGES = {
  invalidJson: "We could not read that submission. Please try again.",
  invalidSubmission: "Check the highlighted field and try again.",
  rateLimited: "Too many attempts from this connection. Please try again shortly.",
  destinationUnconfigured:
    "The waitlist is temporarily unavailable. Please try again later.",
  destinationFailed: "Something went wrong on our side. Please try again.",
  methodNotAllowed: "This endpoint only accepts POST.",
} as const;

/**
 * IDEMPOTENCY CACHE — same durability caveat as lib/waitlist/rate-limit.ts.
 *
 * In-memory and per-process: it does NOT survive a restart, and a
 * multi-instance deploy has one cache per instance. A duplicate that lands on
 * a cold instance is delivered twice. That is an acceptable failure mode here
 * (a duplicate waitlist row is cheap; a *lost* one is not), and the envelope
 * carries the idempotency key so a downstream system can dedupe for real.
 *
 * The cache key is `${Idempotency-Key}:${payload fingerprint}`, not the raw
 * header, on purpose: the form intentionally re-POSTs with the SAME key once
 * the visitor adds migration details. Identical payloads short-circuit;
 * an enriched payload is a genuinely new delivery.
 *
 * Only 2xx results are cached. Caching a 502/503 would trap a visitor in a
 * failure that configuration may already have fixed.
 */
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;
const MAX_IDEMPOTENCY_ENTRIES = 2_000;

interface CachedResult {
  body: { ok: true; id: string };
  storedAt: number;
}

const recentSubmissions = new Map<string, CachedResult>();

function pruneIdempotency(now: number): void {
  for (const [key, entry] of recentSubmissions) {
    if (now - entry.storedAt >= IDEMPOTENCY_TTL_MS) {
      recentSubmissions.delete(key);
    }
  }
  if (recentSubmissions.size > MAX_IDEMPOTENCY_ENTRIES) {
    const overflow = recentSubmissions.size - MAX_IDEMPOTENCY_ENTRIES;
    for (const key of [...recentSubmissions.keys()].slice(0, overflow)) {
      recentSubmissions.delete(key);
    }
  }
}

/** Stable fingerprint of a validated submission. Hashed so no PII sits in the map key. */
function fingerprint(submission: WaitlistSubmission): string {
  const canonical = Object.keys(submission)
    .sort()
    .map((key) => `${key}=${String(submission[key as keyof WaitlistSubmission])}`)
    .join("&");
  return createHash("sha256").update(canonical).digest("hex").slice(0, 32);
}

function json(body: unknown, init: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: { "cache-control": "no-store", ...init.headers },
  });
}

/**
 * Rate-limit key from the first hop of x-forwarded-for, hashed before use.
 * Falls back to a shared bucket when no forwarding header is present so the
 * limiter degrades to "global" rather than "off".
 */
function rateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstHop = forwarded?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return hashIdentifier(firstHop || realIp || "unknown-client");
}

function posthogContext(request: Request, fallbackDistinctId: string) {
  return {
    distinctId:
      request.headers.get("x-posthog-distinct-id")?.trim() || fallbackDistinctId,
    sessionId: request.headers.get("x-posthog-session-id")?.trim() || undefined,
  };
}

async function captureWaitlistEvent(
  request: Request,
  fallbackDistinctId: string,
  event: "waitlist_joined" | "waitlist_details_submitted",
  properties: Record<string, unknown>,
): Promise<void> {
  const posthog = createPostHogClient();
  if (!posthog) return;
  const { distinctId, sessionId } = posthogContext(request, fallbackDistinctId);
  try {
    posthog.capture({
      distinctId,
      event,
      properties: { ...properties, $session_id: sessionId },
    });
    await posthog.shutdown();
  } catch {
    console.error("[waitlist] PostHog event capture failed");
  }
}

async function captureWaitlistException(
  request: Request,
  fallbackDistinctId: string,
  error: unknown,
): Promise<void> {
  const posthog = createPostHogClient();
  if (!posthog) return;
  const { distinctId, sessionId } = posthogContext(request, fallbackDistinctId);
  try {
    posthog.captureException(error, distinctId, {
      $session_id: sessionId,
      failure_stage: "destination_delivery",
    });
    await posthog.shutdown();
  } catch {
    console.error("[waitlist] PostHog exception capture failed");
  }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = randomUUID();
  const now = Date.now();

  // 1. Parse.
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(
      { ok: false, code: "invalid_json", message: MESSAGES.invalidJson },
      { status: 400 },
    );
  }

  // 2. Honeypot. A filled hidden field means a bot. Return the exact shape of a
  // success so it learns nothing, and deliver absolutely nothing.
  if (
    typeof payload === "object" &&
    payload !== null &&
    !Array.isArray(payload) &&
    typeof (payload as Record<string, unknown>)[HONEYPOT_FIELD] === "string" &&
    ((payload as Record<string, unknown>)[HONEYPOT_FIELD] as string).trim().length > 0
  ) {
    return json({ ok: true, id: randomUUID() }, { status: 200 });
  }

  // 3. Validate.
  const validation = validateSubmission(payload);
  if (!validation.ok) {
    return json(
      {
        ok: false,
        code: "invalid_submission",
        message: MESSAGES.invalidSubmission,
        errors: validation.errors,
      },
      { status: 422 },
    );
  }

  const submission = validation.value;

  // 4. Idempotency — before the limiter, so an honest retry of an identical
  // payload replays the stored result instead of burning a request.
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() || undefined;
  const cacheKey = idempotencyKey
    ? `${idempotencyKey}:${fingerprint(submission)}`
    : undefined;

  if (cacheKey) {
    pruneIdempotency(now);
    const cached = recentSubmissions.get(cacheKey);
    if (cached) {
      return json(cached.body, {
        status: 200,
        headers: { "idempotent-replay": "true" },
      });
    }
  }

  // 5. Rate limit.
  const limit = checkRateLimit(rateLimitKey(request), now);
  if (!limit.allowed) {
    return json(
      { ok: false, code: "rate_limited", message: MESSAGES.rateLimited },
      {
        status: 429,
        headers: { "retry-after": String(limit.retryAfterSeconds) },
      },
    );
  }

  // 6. Destination.
  const destination = resolveDestination();
  if (!destination) {
    console.error(
      `[waitlist] ${requestId} no destination configured; submission not recorded`,
    );
    return json(
      {
        ok: false,
        code: "destination_unconfigured",
        message: MESSAGES.destinationUnconfigured,
      },
      { status: 503 },
    );
  }

  // 7. Deliver.
  const id = randomUUID();
  const meta: DeliveryMeta = {
    id,
    receivedAt: new Date(now).toISOString(),
    idempotencyKey,
    // FIRST-TOUCH ONLY. The destination upserts on email, so sending `source`
    // on the follow-up would overwrite the surface that actually converted
    // this person with whatever surface they enriched from — which is exactly
    // the number we care about. A submission carrying migration detail is by
    // definition an enrichment, so it sends no source at all and the original
    // value survives. Client-supplied and untrusted, hence the clamp.
    source: hasMigrationDetails(submission)
      ? undefined
      : (payload as Record<string, unknown>)?.source === "hero"
        ? "hero"
        : "form",
    referer: request.headers.get("referer")?.slice(0, 300) ?? undefined,
    userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? undefined,
  };

  try {
    await destination.deliver(submission, meta);
  } catch (error) {
    // Error message + request id only. Never the payload, never the address.
    const reason = error instanceof Error ? error.message : "unknown error";
    console.error(
      `[waitlist] ${requestId} delivery via "${destination.name}" failed: ${reason}`,
    );
    await captureWaitlistException(
      request,
      idempotencyKey || requestId,
      error,
    );
    return json(
      {
        ok: false,
        code: "destination_failed",
        message: MESSAGES.destinationFailed,
      },
      { status: 502 },
    );
  }

  // A confirmation must never race ahead of durable storage. Bare captures are
  // the first step of both forms; enriched follow-ups reuse the same email and
  // must not send the founder note a second time. Email delivery is secondary:
  // a Gmail outage cannot turn a successfully stored signup into a false 502.
  if (!hasMigrationDetails(submission)) {
    try {
      const followup = resolveFounderFollowupSender();
      if (followup) await followup.send(submission.email);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown error";
      console.error(
        `[waitlist] ${requestId} founder follow-up failed: ${reason}`,
      );
    }
  }

  const enriched = hasMigrationDetails(submission);
  await captureWaitlistEvent(
    request,
    idempotencyKey || requestId,
    enriched ? "waitlist_details_submitted" : "waitlist_joined",
    enriched
      ? {
          has_company: Boolean(submission.company),
          has_role: Boolean(submission.role),
          has_trace_platform: Boolean(submission.tracePlatform),
          has_current_model: Boolean(submission.currentModel),
          has_candidate_model: Boolean(submission.candidateModel),
          has_deadline: Boolean(submission.deadline),
          design_partner_interest: submission.designPartner === true,
        }
      : { form_location: meta.source ?? "unknown" },
  );

  const body = { ok: true as const, id };
  if (cacheKey) {
    recentSubmissions.set(cacheKey, { body, storedAt: now });
  }

  return json(body, { status: 200 });
}

export function GET(): Response {
  return json(
    { ok: false, code: "method_not_allowed", message: MESSAGES.methodNotAllowed },
    { status: 405, headers: { allow: "POST" } },
  );
}
