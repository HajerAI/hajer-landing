import type { ReactNode } from "react";

import {
  EMAIL_MAX,
  EMAIL_REGEX,
  HONEYPOT_FIELD,
  VALIDATION_MESSAGES,
  isPersonalEmailAddress,
  normalizeEmail,
} from "@/lib/waitlist/schema";

/**
 * SHARED WAITLIST MECHANICS.
 *
 * Two surfaces capture an address — the hero's inline field and the full form
 * at #waitlist — and they must behave identically or the guarantee is a lie in
 * one of them. Everything that decides "did this actually get recorded" lives
 * here exactly once.
 *
 * THE CONTRACT: `postWaitlist` returns ok:true only when the transport
 * succeeded AND the server said ok:true. A 503 (no destination configured), a
 * 502, a 429 and a dropped connection are all ok:false with a reason. Neither
 * caller is allowed to synthesise a success from anything else.
 *
 * Marketing copy comes from content/copy.ts. The strings below are system
 * messages — transport failures and control labels — with no equivalent there.
 * They are deliberately plain and make no product claim.
 *
 * Failure text composes as OUTCOME + REASON: the panel states the outcome
 * ("Your email was not recorded.") and the server supplies only the reason, so
 * the two never repeat each other.
 */
/** Where both forms send a visitor once the server has confirmed the address. */
export const THANK_YOU_PATH = "/thank-you";

export const SYSTEM_COPY = {
  submitting: "Joining…",
  failureHeadline: "Your email was not recorded.",
  offline: "We could not reach the server. Please try again.",
  unknown: "Please try again.",
  retry: "Try again",
  detailsSubmit: "Send details",
  detailsSubmitting: "Sending…",
  detailsFailure: "Your place on the list is safe, but those details were not saved.",
  /** Inline-mode guard on /thank-you: that form exists only to add detail. */
  detailsRequired: "Add at least one detail, or head back to the site.",
  noscript:
    "Enable JavaScript to join the waitlist. Without it, nothing is submitted.",
  /** Off-screen honeypot label. Never read by a person; plausible to a bot. */
  honeypotLabel: "Company website",
} as const;

/**
 * Input chrome minus the fill.
 *
 * The fill is the caller's job because it depends on which plane the input
 * sits on: `bg-panel` when the field sits straight on the ground plane (the
 * hero), `bg-inset` when it sits inside a plane-1 panel (#waitlist). Planes
 * never skip, so this cannot be baked in.
 *
 * The border colour is the caller's job too, for the same reason, and it must
 * be a solid tone rather than a hairline: a 1.3:1 field boundary fails WCAG
 * 1.4.11 and these are the only two controls on the site. `border-muted-dim`
 * is 4.54:1 on panel and 4.03:1 on inset.
 *
 * Placeholder tone is also the caller's: `placeholder:text-muted-dim` on
 * plane 1 (the hero field sits on Ground), `placeholder:text-muted` on plane
 * 2 (Muted Dim is not licensed there). Same string, two planes, two tones —
 * that is the token doctrine, not an inconsistency.
 *
 * Focus is carried by the global `:focus-visible` ring. The field's own focus
 * border is white, not Vermilion: Vermilion has five licensed uses and an
 * input focus state is not one of them.
 */
export const INPUT_BASE =
  "h-12 w-full min-w-0 border px-4 text-white transition-colors duration-150 hover:border-hairline-strong focus:border-white";

/** Client-side mirror of the server's check, so both agree byte-for-byte. */
export function validateEmailValue(raw: string): string | null {
  const value = normalizeEmail(raw);
  if (value.length === 0) return VALIDATION_MESSAGES.emailRequired;
  if (value.length > EMAIL_MAX) return VALIDATION_MESSAGES.emailTooLong;
  if (!EMAIL_REGEX.test(value)) return VALIDATION_MESSAGES.emailInvalid;
  if (isPersonalEmailAddress(value)) return VALIDATION_MESSAGES.workEmailRequired;
  return null;
}

/**
 * One key per capture session. Generated lazily by the caller so it never runs
 * during SSR, and reused across a retry so an honest double-submit dedupes.
 */
export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ------------------------------------------------------------------
   CAPTURE HANDOFF

   The hero confirmation points down to #waitlist so a visitor can add
   migration details. Until this existed, the two surfaces each minted their
   own idempotency key, so the second delivery arrived downstream as an
   unrelated submission — the key that exists precisely to let the two rows be
   merged was the one thing they did not share. Worse, the hero's hottest
   leads landed on a pristine form with an empty field, which reads as "my
   first signup did not take".

   One key per visitor per tab. sessionStorage, not localStorage: this is a
   handoff between two components in one visit, not a profile. It dies with
   the tab, and it holds nothing the visitor did not just type into a field on
   this page.

   The handoff also crosses one route change: both forms push /thank-you on
   success, and the details form there reads the same record to prefill the
   address and skip the bare capture. `detailsSubmitted` records that the
   server accepted an enrichment, so the page can stop offering the form.
   ------------------------------------------------------------------ */

const HANDOFF_KEY = "hajer:capture";

export type CaptureHandoff = {
  /** Set once the SERVER confirmed the address. Never set optimistically. */
  confirmed: boolean;
  email: string;
  idempotencyKey: string;
  /** Set once the SERVER accepted an enrichment payload for this email. */
  detailsSubmitted?: boolean;
};

export function readCaptureHandoff(): CaptureHandoff | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const record = parsed as Partial<CaptureHandoff>;
    if (typeof record.idempotencyKey !== "string") return null;
    return {
      confirmed: record.confirmed === true,
      email: typeof record.email === "string" ? record.email : "",
      idempotencyKey: record.idempotencyKey,
      detailsSubmitted: record.detailsSubmitted === true,
    };
  } catch {
    return null;
  }
}

export function writeCaptureHandoff(handoff: CaptureHandoff): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff));
  } catch {
    // Private mode, quota, storage disabled — the handoff is an improvement,
    // never a dependency. Both surfaces still work without it.
  }
}

export type PostResult =
  | { ok: true }
  | { ok: false; message: string; errors?: Record<string, string> };

export async function postWaitlist(
  payload: Record<string, unknown>,
  idempotencyKey: string,
): Promise<PostResult> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "idempotency-key": idempotencyKey,
  };

  let response: Response;
  try {
    response = await fetch("/api/waitlist", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, message: SYSTEM_COPY.offline };
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  const record =
    typeof data === "object" && data !== null
      ? (data as { ok?: unknown; message?: unknown; errors?: unknown })
      : {};

  // The only success branch in the entire client. Both conditions required.
  if (response.ok && record.ok === true) {
    return { ok: true };
  }

  return {
    ok: false,
    message: typeof record.message === "string" ? record.message : SYSTEM_COPY.unknown,
    errors:
      typeof record.errors === "object" && record.errors !== null
        ? (record.errors as Record<string, string>)
        : undefined,
  };
}

/**
 * Square glyphs — the brand's verification-gate language. Every state that
 * carries colour also carries one of these, so no meaning is colour-only.
 */
export function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1.5" y="1.5" width="21" height="21" stroke="currentColor" strokeWidth="2" />
      {/* pathLength=1 normalises the dash space so `hj-check-draw` can draw
          the check with a unit dasharray inside `.hj-commit` (globals.css).
          The base state is fully drawn (dashoffset 0); the class is inert
          outside a `.hj-commit` scope, and the surrounding rect never draws. */}
      <path
        className="hj-check-draw"
        pathLength={1}
        d="M6.5 12.5 L10.5 16.5 L17.5 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function BlockedGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1.5" y="1.5" width="21" height="21" stroke="currentColor" strokeWidth="2" />
      <path
        d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * Validation error. It reads from `--color-danger`, never from
 * `--color-blocked`: assessment colours mean assessment state, and a typo in
 * an email field is not an assessment outcome. Keeping the two on separate
 * tokens lets the danger red be tuned for contrast on whichever plane the form
 * happens to sit on without moving an assessment colour. The glyph keeps the
 * meaning legible without colour at all.
 */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-2 font-mono text-mono-sm text-danger">
      <BlockedGlyph className="mt-[0.15em] h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/**
 * Honeypot. Positioned off-screen rather than display:none — bots skip fields
 * the CSS hides, and fill fields they can find. A filled value makes the
 * server return the exact shape of a success and store nothing.
 */
export function HoneypotField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden"
    >
      <label htmlFor={id}>{SYSTEM_COPY.honeypotLabel}</label>
      <input
        id={id}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
