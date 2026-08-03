import { createHash } from "node:crypto";

/**
 * COURTESY RATE LIMITER — read this before trusting it.
 *
 * ┌─ HONEST LIMITATIONS ────────────────────────────────────────────────────┐
 * │ This is an in-memory fixed-window counter living in a single Node       │
 * │ process. It is NOT durable and NOT distributed:                         │
 * │                                                                         │
 * │  • Serverless / multi-instance deploys get one independent counter per  │
 * │    instance, so the effective limit is (instances x RATE_LIMIT_MAX).    │
 * │  • Every cold start, redeploy, or process restart resets all counters.  │
 * │  • A determined attacker with rotating IPs is not slowed down at all.   │
 * │                                                                         │
 * │ What it DOES do: stop an honest double-click, a stuck retry loop, and   │
 * │ an unsophisticated script from filling the waitlist with noise.         │
 * │                                                                         │
 * │ THIS MODULE IS THE INTEGRATION POINT for a real limiter. Swap the body  │
 * │ of checkRateLimit() for Upstash/Redis/edge middleware and every caller  │
 * │ keeps working — the signature is deliberately async-free but trivial to │
 * │ make async at that point.                                               │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Privacy: the raw identifier (an IP address) is hashed with SHA-256 before it
 * is ever used as a map key, so no raw IP is retained in memory.
 */

export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/** Safety valve so a flood of unique keys cannot grow the map without bound. */
const MAX_TRACKED_KEYS = 10_000;

interface Window {
  count: number;
  startedAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may retry. 0 when allowed. */
  retryAfterSeconds: number;
}

/**
 * SHA-256 of an identifier, hex encoded. Use this on the raw IP at the edge of
 * the system so the raw value never travels further in.
 */
export function hashIdentifier(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function prune(now: number): void {
  for (const [key, window] of windows) {
    if (now - window.startedAt >= RATE_LIMIT_WINDOW_MS) {
      windows.delete(key);
    }
  }
  // Still over budget after pruning live windows: drop the oldest entries.
  if (windows.size > MAX_TRACKED_KEYS) {
    const sorted = [...windows.entries()].sort(
      (a, b) => a[1].startedAt - b[1].startedAt,
    );
    for (const [key] of sorted.slice(0, windows.size - MAX_TRACKED_KEYS)) {
      windows.delete(key);
    }
  }
}

/**
 * Count one request against `key`'s fixed window.
 *
 * The key is hashed again internally, so passing a raw IP by mistake still
 * cannot leave a raw IP in memory.
 */
export function checkRateLimit(key: string, now: number = Date.now()): RateLimitResult {
  const bucket = hashIdentifier(key);

  if (windows.size >= MAX_TRACKED_KEYS) {
    prune(now);
  }

  const existing = windows.get(bucket);

  if (!existing || now - existing.startedAt >= RATE_LIMIT_WINDOW_MS) {
    windows.set(bucket, { count: 1, startedAt: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    const elapsed = now - existing.startedAt;
    const remaining = Math.max(RATE_LIMIT_WINDOW_MS - elapsed, 0);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(remaining / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Test-only escape hatch. Never called by application code. */
export function resetRateLimitForTests(): void {
  windows.clear();
}
