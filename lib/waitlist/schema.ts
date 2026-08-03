/**
 * WAITLIST SUBMISSION SHAPE + VALIDATION
 *
 * Shared by the client form and the API route so both agree byte-for-byte on
 * what is acceptable. Deliberately dependency-free: no zod, no runtime cost,
 * and safe to import into a client component (nothing here touches node:*).
 *
 * Philosophy: validate structural correctness and the one commercial rule the
 * intake promises: assessment requests must use a company-controlled domain.
 * We reject well-known consumer mailbox domains while allowing unfamiliar
 * custom domains, role addresses and international TLDs.
 */

/** Max length for every optional free-text field. Values longer than this are capped. */
export const FIELD_MAX = 200;

/** Max total length of an email address (RFC 5321 path limit). */
export const EMAIL_MAX = 254;

/**
 * Pragmatic RFC-ish address check.
 *
 * Accepts: dot-separated atext local part, dot-separated LDH domain labels,
 * an alphabetic TLD of 2-63 characters.
 * Rejects: no "@", empty local part, spaces, leading/trailing/doubled dots,
 * bare hostnames without a TLD, and single-letter TLDs.
 *
 * Exported so the client can run exactly the same check the server will.
 */
export const EMAIL_REGEX =
  /^[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,63}$/;

/**
 * Consumer mailbox domains that cannot establish a company affiliation.
 * Corporate Google Workspace and Microsoft 365 addresses use the customer's
 * custom domain, so they remain eligible.
 */
export const PERSONAL_EMAIL_DOMAINS = [
  "126.com",
  "163.com",
  "aol.com",
  "bk.ru",
  "comcast.net",
  "disroot.org",
  "duck.com",
  "email.com",
  "fastmail.com",
  "fastmail.fm",
  "freenet.de",
  "gmail.com",
  "gmx.com",
  "gmx.de",
  "gmx.net",
  "googlemail.com",
  "hey.com",
  "hotmail.com",
  "hushmail.com",
  "icloud.com",
  "inbox.ru",
  "keemail.me",
  "list.ru",
  "live.com",
  "mac.com",
  "mail.com",
  "mail.ru",
  "mailbox.org",
  "me.com",
  "msn.com",
  "outlook.com",
  "pm.me",
  "posteo.de",
  "proton.me",
  "protonmail.com",
  "qq.com",
  "rambler.ru",
  "riseup.net",
  "rocketmail.com",
  "tuta.com",
  "tuta.io",
  "tutamail.com",
  "tutanota.com",
  "web.de",
  "ya.ru",
  "yahoo.ca",
  "yahoo.co.uk",
  "yahoo.com",
  "yahoo.com.au",
  "yandex.com",
  "yandex.ru",
  "ymail.com",
  "zoho.com",
  "zohomail.com",
] as const;

const personalEmailDomainSet = new Set<string>(PERSONAL_EMAIL_DOMAINS);

/** Source form of {@link EMAIL_REGEX}, for anything that needs the pattern as a string. */

/**
 * Honeypot field name. Real people never see or fill this; naive bots fill
 * every input they find. Named like a plausible field so it reads as real.
 * It is NEVER part of a WaitlistSubmission — the route inspects the raw body
 * for it and validation drops it as an unknown key.
 */
export const HONEYPOT_FIELD = "company_website";

/** Optional free-text fields, in the order the form presents them. */
export const OPTIONAL_TEXT_FIELDS = [
  "company",
  "role",
  "tracePlatform",
  "currentModel",
  "candidateModel",
  "deadline",
] as const;

export type OptionalTextField = (typeof OPTIONAL_TEXT_FIELDS)[number];

export interface WaitlistSubmission {
  email: string;
  company?: string;
  role?: string;
  tracePlatform?: string;
  currentModel?: string;
  candidateModel?: string;
  deadline?: string;
  designPartner?: boolean;
}

export type ValidationResult =
  | { ok: true; value: WaitlistSubmission }
  | { ok: false; errors: Record<string, string> };

/** Human-readable, non-blaming validation messages. Shown verbatim to users. */
export const VALIDATION_MESSAGES = {
  emailRequired: "Enter your work email.",
  emailTooLong: "That email address is too long.",
  emailInvalid: "That doesn't look like an email address.",
  workEmailRequired: "Use your company email address. Personal email providers are not accepted.",
} as const;

/** Trim and lowercase. The only normalization we apply — we never rewrite the address. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Reject a known consumer provider, including a subdomain used to bypass it. */
export function isPersonalEmailAddress(raw: string): boolean {
  const email = normalizeEmail(raw);
  const separator = email.lastIndexOf("@");
  if (separator < 0) return false;

  const domain = email.slice(separator + 1);
  if (personalEmailDomainSet.has(domain)) return true;
  return PERSONAL_EMAIL_DOMAINS.some((provider) => domain.endsWith(`.${provider}`));
}

/** Trim, drop empties, cap at FIELD_MAX. Returns undefined for anything unusable. */
function normalizeOptionalText(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.length > FIELD_MAX ? trimmed.slice(0, FIELD_MAX) : trimmed;
}

function isPlainObject(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

/**
 * Validate an untrusted payload into a WaitlistSubmission.
 *
 * Unknown/extra keys (including the honeypot) are dropped silently and never
 * echoed back — the returned object only ever contains keys we declared.
 */
export function validateSubmission(input: unknown): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isPlainObject(input)) {
    return { ok: false, errors: { email: VALIDATION_MESSAGES.emailRequired } };
  }

  const rawEmail = input.email;
  const email = typeof rawEmail === "string" ? normalizeEmail(rawEmail) : "";

  if (email.length === 0) {
    errors.email = VALIDATION_MESSAGES.emailRequired;
  } else if (email.length > EMAIL_MAX) {
    errors.email = VALIDATION_MESSAGES.emailTooLong;
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = VALIDATION_MESSAGES.emailInvalid;
  } else if (isPersonalEmailAddress(email)) {
    errors.email = VALIDATION_MESSAGES.workEmailRequired;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const value: WaitlistSubmission = { email };

  for (const field of OPTIONAL_TEXT_FIELDS) {
    const normalized = normalizeOptionalText(input[field]);
    if (normalized !== undefined) {
      value[field] = normalized;
    }
  }

  if (typeof input.designPartner === "boolean") {
    value.designPartner = input.designPartner;
  }

  return { ok: true, value };
}

/** True when a submission carries anything beyond the email address. */
export function hasMigrationDetails(submission: WaitlistSubmission): boolean {
  return (
    OPTIONAL_TEXT_FIELDS.some((field) => Boolean(submission[field])) ||
    submission.designPartner === true
  );
}
