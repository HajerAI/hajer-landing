import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

/**
 * Pure unit tests for the waitlist library. No Next.js boot, no new deps.
 *
 *   pnpm test
 *
 * Note on the import style below: Node's type stripping requires an explicit
 * ".ts" extension in the specifier, while the repo tsconfig does not enable
 * allowImportingTsExtensions. A URL-based dynamic import satisfies Node, and
 * the `typeof import(...)` cast (a type position, erased at runtime) keeps the
 * modules fully typed for tsc. Both tools stay happy without touching config
 * shared with the rest of the site.
 */
const schema = (await import(
  new URL("../lib/waitlist/schema.ts", import.meta.url).href
)) as typeof import("../lib/waitlist/schema");

const rateLimit = (await import(
  new URL("../lib/waitlist/rate-limit.ts", import.meta.url).href
)) as typeof import("../lib/waitlist/rate-limit");

const destination = (await import(
  new URL("../lib/waitlist/destination.ts", import.meta.url).href
)) as typeof import("../lib/waitlist/destination");

const followup = (await import(
  new URL("../lib/waitlist/founder-followup.ts", import.meta.url).href
)) as typeof import("../lib/waitlist/founder-followup");

/* -------------------------------------------------------------------------- */
/* schema — email                                                             */
/* -------------------------------------------------------------------------- */

test("accepts ordinary company email addresses", () => {
  const valid = [
    "ada@analytical-engines.com",
    "ada.lovelace@research.acme.co.uk",
    "ada+migrations@platform.team",
    "a@startup.co",
    "platform-team@company.engineering",
    "o'neill@acme.com".replace("'", "_"),
  ];

  for (const email of valid) {
    const result = schema.validateSubmission({ email });
    assert.equal(result.ok, true, `expected ${email} to validate`);
  }
});

test("rejects personal email providers, including subdomain bypasses", () => {
  const personal = [
    "someone@gmail.com",
    "someone@googlemail.com",
    "someone@outlook.com",
    "someone@hotmail.com",
    "someone@yahoo.com",
    "someone@icloud.com",
    "someone@proton.me",
    "someone@fastmail.com",
    "someone@inbox.gmail.com",
  ];

  for (const email of personal) {
    const result = schema.validateSubmission({ email });
    assert.equal(result.ok, false, `expected ${email} to require a work address`);
    if (!result.ok) {
      assert.equal(result.errors.email, schema.VALIDATION_MESSAGES.workEmailRequired);
    }
  }
});

test("rejects malformed addresses", () => {
  const invalid = [
    "",
    "   ",
    "ada",
    "ada@",
    "@example.com",
    "ada@example",
    "ada@example.c",
    "ada@@example.com",
    "ada @example.com",
    "ada@exa mple.com",
    "ada@.example.com",
    "ada@example..com",
    ".ada@example.com",
    "ada.@example.com",
    "ada@-example.com",
    "ada@example.com.",
  ];

  for (const email of invalid) {
    const result = schema.validateSubmission({ email });
    assert.equal(result.ok, false, `expected ${JSON.stringify(email)} to fail`);
    if (!result.ok) {
      assert.ok(result.errors.email, "expected an email error message");
    }
  }
});

test("requires an email when the field is missing or the wrong type", () => {
  for (const input of [{}, { email: null }, { email: 42 }, null, "nope", []]) {
    const result = schema.validateSubmission(input);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.errors.email, schema.VALIDATION_MESSAGES.emailRequired);
    }
  }
});

test("normalizes the email: trims and lowercases, nothing else", () => {
  assert.equal(schema.normalizeEmail("  Ada.Lovelace@Example.COM  "), "ada.lovelace@example.com");
  assert.equal(schema.normalizeEmail("ada+Tag@Example.com"), "ada+tag@example.com");

  const result = schema.validateSubmission({ email: "  ADA@Example.COM " });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.email, "ada@example.com");
  }
});

test("rejects an email longer than the RFC path limit", () => {
  const local = "a".repeat(schema.EMAIL_MAX);
  const result = schema.validateSubmission({ email: `${local}@example.com` });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors.email, schema.VALIDATION_MESSAGES.emailTooLong);
  }
});

/* -------------------------------------------------------------------------- */
/* schema — optional fields, unknown keys, honeypot                           */
/* -------------------------------------------------------------------------- */

test("caps oversized optional fields at FIELD_MAX instead of failing the form", () => {
  const result = schema.validateSubmission({
    email: "ada@example.com",
    company: "x".repeat(schema.FIELD_MAX + 500),
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.company?.length, schema.FIELD_MAX);
  }
});

test("trims optional fields and drops empty ones", () => {
  const result = schema.validateSubmission({
    email: "ada@example.com",
    company: "  Acme  ",
    role: "   ",
    tracePlatform: "",
    currentModel: 12345,
    deadline: "Q3",
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.company, "Acme");
    assert.equal("role" in result.value, false);
    assert.equal("tracePlatform" in result.value, false);
    assert.equal("currentModel" in result.value, false);
    assert.equal(result.value.deadline, "Q3");
  }
});

test("keeps designPartner only when it is a real boolean", () => {
  const yes = schema.validateSubmission({ email: "ada@example.com", designPartner: true });
  assert.equal(yes.ok && yes.value.designPartner, true);

  const no = schema.validateSubmission({ email: "ada@example.com", designPartner: false });
  assert.equal(no.ok && no.value.designPartner, false);

  const junk = schema.validateSubmission({ email: "ada@example.com", designPartner: "yes" });
  assert.equal(junk.ok, true);
  if (junk.ok) {
    assert.equal("designPartner" in junk.value, false);
  }
});

test("drops unknown keys silently and never echoes them back", () => {
  const result = schema.validateSubmission({
    email: "ada@example.com",
    company: "Acme",
    __proto__polluted: true,
    isAdmin: true,
    utm_source: "hn",
    notes: "should not survive",
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(Object.keys(result.value).sort(), ["company", "email"]);
  }
});

test("the honeypot is not a submission field and is dropped by validation", () => {
  assert.equal(schema.HONEYPOT_FIELD, "company_website");

  const result = schema.validateSubmission({
    email: "ada@example.com",
    [schema.HONEYPOT_FIELD]: "http://spam.example",
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(schema.HONEYPOT_FIELD in result.value, false);
    assert.deepEqual(Object.keys(result.value), ["email"]);
  }
});

test("hasMigrationDetails distinguishes a bare signup from an enriched one", () => {
  assert.equal(schema.hasMigrationDetails({ email: "ada@example.com" }), false);
  assert.equal(
    schema.hasMigrationDetails({ email: "ada@example.com", company: "Acme" }),
    true,
  );
  assert.equal(
    schema.hasMigrationDetails({ email: "ada@example.com", designPartner: true }),
    true,
  );
});

/* -------------------------------------------------------------------------- */
/* rate limiter                                                               */
/* -------------------------------------------------------------------------- */

test("rate limiter allows the budget, then blocks with a retry hint", () => {
  rateLimit.resetRateLimitForTests();
  const now = 1_700_000_000_000;
  const key = rateLimit.hashIdentifier("203.0.113.7");

  for (let attempt = 1; attempt <= rateLimit.RATE_LIMIT_MAX; attempt += 1) {
    const result = rateLimit.checkRateLimit(key, now);
    assert.equal(result.allowed, true, `attempt ${attempt} should be allowed`);
    assert.equal(result.retryAfterSeconds, 0);
  }

  const blocked = rateLimit.checkRateLimit(key, now);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0);
  assert.ok(
    blocked.retryAfterSeconds <= rateLimit.RATE_LIMIT_WINDOW_MS / 1000,
    "retry hint must not exceed the window",
  );
});

test("rate limiter windows are per key and expire", () => {
  rateLimit.resetRateLimitForTests();
  const now = 1_700_000_000_000;

  for (let attempt = 0; attempt < rateLimit.RATE_LIMIT_MAX; attempt += 1) {
    rateLimit.checkRateLimit("caller-a", now);
  }
  assert.equal(rateLimit.checkRateLimit("caller-a", now).allowed, false);

  // A different caller is unaffected.
  assert.equal(rateLimit.checkRateLimit("caller-b", now).allowed, true);

  // The same caller is allowed again once the window rolls over.
  const later = now + rateLimit.RATE_LIMIT_WINDOW_MS;
  assert.equal(rateLimit.checkRateLimit("caller-a", later).allowed, true);
});

test("hashIdentifier is sha256 hex and never returns the input", () => {
  const hashed = rateLimit.hashIdentifier("203.0.113.7");
  assert.match(hashed, /^[0-9a-f]{64}$/);
  assert.notEqual(hashed, "203.0.113.7");
  assert.equal(hashed, rateLimit.hashIdentifier("203.0.113.7"));
  assert.notEqual(hashed, rateLimit.hashIdentifier("203.0.113.8"));
});

/* -------------------------------------------------------------------------- */
/* destination                                                                */
/* -------------------------------------------------------------------------- */

test("webhook signature is a stable HMAC over `${timestamp}.${body}`", () => {
  // Fixed vector. If this digest ever changes, every receiver breaks.
  const body = JSON.stringify({ hello: "world" });
  assert.equal(body, '{"hello":"world"}');

  assert.equal(
    destination.signWebhookPayload("test-secret", "1700000000", body),
    "f85455a1b55ea86f7a15f5f9923d0abc4b888da84ec485f2ff358f427776beca",
  );

  // Any change to secret, timestamp, or body changes the signature.
  assert.notEqual(
    destination.signWebhookPayload("other-secret", "1700000000", body),
    destination.signWebhookPayload("test-secret", "1700000000", body),
  );
  assert.notEqual(
    destination.signWebhookPayload("test-secret", "1700000001", body),
    destination.signWebhookPayload("test-secret", "1700000000", body),
  );
});

test("webhook adapter signs the exact bytes it posts, and hides the response body", async () => {
  const seen: { headers: Headers; body: string; url: string }[] = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    seen.push({
      url: String(input),
      headers: new Headers(init?.headers),
      body: String(init?.body),
    });
    return new Response("secret-token-leaked-in-body", { status: 500 });
  }) as typeof fetch;

  try {
    const adapter = destination.createWebhookDestination(
      "https://hooks.example/waitlist",
      "test-secret",
    );

    await assert.rejects(
      adapter.deliver(
        { email: "ada@example.com" },
        { id: "id-1", receivedAt: "2026-01-01T00:00:00.000Z" },
      ),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /status 500/);
        assert.doesNotMatch(error.message, /secret-token-leaked-in-body/);
        return true;
      },
    );

    assert.equal(seen.length, 1);
    const call = seen[0]!;
    assert.equal(call.url, "https://hooks.example/waitlist");

    const timestamp = call.headers.get("x-hajer-timestamp");
    assert.ok(timestamp, "timestamp header must be present when a secret is set");
    assert.equal(
      call.headers.get("x-hajer-signature"),
      `sha256=${destination.signWebhookPayload("test-secret", timestamp, call.body)}`,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("webhook adapter omits signature headers when no secret is configured", async () => {
  const originalFetch = globalThis.fetch;
  let headers = new Headers();

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    headers = new Headers(init?.headers);
    return new Response(null, { status: 204 });
  }) as typeof fetch;

  try {
    const adapter = destination.createWebhookDestination("https://hooks.example/waitlist");
    await adapter.deliver(
      { email: "ada@example.com" },
      { id: "id-2", receivedAt: "2026-01-01T00:00:00.000Z" },
    );
    assert.equal(headers.get("x-hajer-signature"), null);
    assert.equal(headers.get("x-hajer-timestamp"), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("file adapter appends one JSON line per submission", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "hajer-waitlist-"));
  const file = path.join(dir, "nested", "waitlist.jsonl");

  try {
    const adapter = destination.createFileDestination(file);
    await adapter.deliver(
      { email: "ada@example.com", company: "Acme" },
      { id: "id-1", receivedAt: "2026-01-01T00:00:00.000Z", idempotencyKey: "k-1" },
    );
    await adapter.deliver(
      { email: "grace@example.com" },
      { id: "id-2", receivedAt: "2026-01-01T00:01:00.000Z" },
    );

    const lines = (await readFile(file, "utf8")).trim().split("\n");
    assert.equal(lines.length, 2);

    const first = JSON.parse(lines[0]!);
    assert.equal(first.id, "id-1");
    assert.equal(first.idempotencyKey, "k-1");
    assert.equal(first.source, "hajer.ai/waitlist");
    assert.deepEqual(first.submission, { email: "ada@example.com", company: "Acme" });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("supabase adapter upserts on email without erasing omitted fields", async () => {
  const originalFetch = globalThis.fetch;
  let call:
    | { url: string; headers: Headers; body: Record<string, unknown> }
    | undefined;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    call = {
      url: String(input),
      headers: new Headers(init?.headers),
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    };
    return new Response(null, { status: 201 });
  }) as typeof fetch;

  try {
    const adapter = destination.createSupabaseDestination(
      "https://project.supabase.co/",
      "server-secret",
    );
    await adapter.deliver(
      { email: "ada@example.com", designPartner: false },
      {
        id: "delivery-1",
        receivedAt: "2026-07-27T00:00:00.000Z",
        source: undefined,
        idempotencyKey: "attempt-1",
      },
    );

    assert.ok(call);
    assert.equal(
      call.url,
      "https://project.supabase.co/rest/v1/waitlist?on_conflict=email",
    );
    assert.equal(call.headers.get("apikey"), "server-secret");
    assert.equal(call.headers.get("authorization"), "Bearer server-secret");
    assert.equal(
      call.headers.get("prefer"),
      "resolution=merge-duplicates,return=minimal",
    );
    assert.deepEqual(call.body, {
      email: "ada@example.com",
      design_partner: false,
      idempotency_key: "attempt-1",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("resolveDestination honours the documented precedence", () => {
  const saved = {
    url: process.env.WAITLIST_WEBHOOK_URL,
    file: process.env.WAITLIST_FILE_PATH,
    env: process.env.NODE_ENV,
  };

  const setNodeEnv = (value: string) => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value,
      configurable: true,
      writable: true,
      enumerable: true,
    });
  };

  try {
    process.env.WAITLIST_WEBHOOK_URL = "https://hooks.example/waitlist";
    process.env.WAITLIST_FILE_PATH = "/tmp/ignored.jsonl";
    assert.equal(destination.resolveDestination()?.name, "webhook");

    delete process.env.WAITLIST_WEBHOOK_URL;
    assert.equal(destination.resolveDestination()?.name, "file");

    // Blank strings count as unset.
    process.env.WAITLIST_WEBHOOK_URL = "   ";
    assert.equal(destination.resolveDestination()?.name, "file");

    delete process.env.WAITLIST_WEBHOOK_URL;
    delete process.env.WAITLIST_FILE_PATH;
    setNodeEnv("development");
    assert.equal(destination.resolveDestination()?.name, "file");

    // The one case that must fail loudly rather than silently drop a signup.
    setNodeEnv("production");
    assert.equal(destination.resolveDestination(), null);
  } finally {
    if (saved.url === undefined) delete process.env.WAITLIST_WEBHOOK_URL;
    else process.env.WAITLIST_WEBHOOK_URL = saved.url;
    if (saved.file === undefined) delete process.env.WAITLIST_FILE_PATH;
    else process.env.WAITLIST_FILE_PATH = saved.file;
    setNodeEnv(saved.env ?? "test");
  }
});

/* -------------------------------------------------------------------------- */
/* founder follow-up                                                          */
/* -------------------------------------------------------------------------- */

test("founder follow-up clearly confirms receipt and next steps", () => {
  const { body, subject } = followup.founderFollowup;

  assert.match(subject, /received your Hajer request/i);
  assert.match(body, /Omar here/);
  assert.match(body, /I received your request/i);
  assert.match(body, /reviewing requests individually/i);
  assert.match(body, /will be in touch/i);
  assert.match(body, /hello@hajer\.ai/i);
  assert.doesNotMatch(`${subject}\n${body}`, /[—–]|waitlist/i);
  assert.doesNotMatch(body, /prelaunch|not as software/i);
  assert.doesNotMatch(body, /pricing|timeline|packet|certif(?:y|ied|ication)/i);
  assert.doesNotMatch(body, /assessment request|production model|customer data/i);
});

test("Gmail message carries the founder identity and a UTF-8 plain-text body", () => {
  const message = followup.buildFounderFollowupMessage(
    "ada@example.com",
    "omar@hajer.ai",
    "hello@hajer.ai",
  );

  assert.match(message, /^From: Omar <omar@hajer\.ai>\r\n/);
  assert.match(message, /\r\nTo: <ada@example\.com>\r\n/);
  assert.match(message, /\r\nReply-To: hello@hajer\.ai\r\n/);
  assert.match(message, /Content-Type: text\/plain; charset="UTF-8"/);

  const encodedBody = message.split("\r\n\r\n")[1]!.replace(/\r\n/g, "");
  const decodedBody = Buffer.from(encodedBody, "base64").toString("utf8");
  assert.equal(decodedBody, followup.founderFollowup.body);
});

test("Gmail sender exchanges the refresh token and sends the exact raw message", async () => {
  const originalFetch = globalThis.fetch;
  const calls: { url: string; init?: RequestInit }[] = [];

  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    calls.push({ url: String(input), init });
    if (calls.length === 1) {
      return Response.json({ access_token: "access-token" });
    }
    return Response.json({ id: "message-id" });
  }) as typeof fetch;

  try {
    const sender = followup.createGmailFollowupSender({
      clientId: "client-id",
      clientSecret: "client-secret",
      refreshToken: "refresh-token",
      from: "omar@hajer.ai",
    });
    await sender.send("ada@example.com");

    assert.equal(calls.length, 2);
    assert.equal(calls[0]!.url, "https://oauth2.googleapis.com/token");
    assert.match(String(calls[0]!.init?.body), /grant_type=refresh_token/);
    assert.equal(
      new Headers(calls[1]!.init?.headers).get("authorization"),
      "Bearer access-token",
    );

    const payload = JSON.parse(String(calls[1]!.init?.body)) as { raw: string };
    const padded = payload.raw.replace(/-/g, "+").replace(/_/g, "/");
    const rawMessage = Buffer.from(padded, "base64").toString("utf8");
    assert.match(rawMessage, /To: <ada@example\.com>/);
    assert.doesNotMatch(rawMessage, /client-secret|refresh-token|access-token/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
