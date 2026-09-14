import assert from "node:assert/strict";
import test from "node:test";

/**
 * The Lambda adapter in isolation: event → Request, Response → result, and the
 * once-per-container configuration load. The waitlist handler itself is
 * covered by waitlist.test.ts; here `dispatch` is a stub.
 */
const adapter = (await import(
  new URL("../lambda/waitlist/adapter.ts", import.meta.url).href
)) as typeof import("../lambda/waitlist/adapter");

const baseEvent = {
  rawPath: "/api/waitlist",
  requestContext: { http: { method: "POST" } },
};

test("a function-URL event becomes a Request with method, URL, headers and body", async () => {
  const request = adapter.toRequest({
    ...baseEvent,
    rawQueryString: "source=hero",
    headers: {
      host: "abc.lambda-url.us-west-1.on.aws",
      "content-type": "application/json",
      "idempotency-key": "k-1",
      "x-forwarded-for": "203.0.113.9, 203.0.113.9",
    },
    body: JSON.stringify({ email: "a@example.com" }),
  });

  assert.equal(request.method, "POST");
  assert.equal(request.url, "https://abc.lambda-url.us-west-1.on.aws/api/waitlist?source=hero");
  assert.equal(request.headers.get("idempotency-key"), "k-1");
  assert.equal(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(), "203.0.113.9");
  assert.deepEqual(await request.json(), { email: "a@example.com" });
});

test("a base64 body is decoded and GET carries no body", async () => {
  const encoded = adapter.toRequest({
    ...baseEvent,
    headers: { host: "h" },
    body: Buffer.from('{"email":"b@example.com"}').toString("base64"),
    isBase64Encoded: true,
  });
  assert.deepEqual(await encoded.json(), { email: "b@example.com" });

  const get = adapter.toRequest({
    rawPath: "/api/waitlist",
    requestContext: { http: { method: "get" } },
    headers: { host: "h" },
    body: "ignored",
  });
  assert.equal(get.method, "GET");
  assert.equal(get.body, null);
});

test("a Response becomes a buffered function-URL result", async () => {
  const result = await adapter.toResult(
    Response.json({ ok: true, id: "x" }, { status: 200, headers: { "retry-after": "3" } }),
  );
  assert.equal(result.statusCode, 200);
  assert.equal(result.headers["retry-after"], "3");
  assert.match(result.headers["content-type"] ?? "", /application\/json/);
  assert.equal(result.isBase64Encoded, false);
  assert.deepEqual(JSON.parse(result.body), { ok: true, id: "x" });
});

test("configuration loads once per container and never overrides the environment", async () => {
  const name = `WAITLIST_ADAPTER_TEST_${process.pid}`;
  const preset = `${name}_PRESET`;
  process.env[preset] = "from-env";
  let loads = 0;
  const handler = adapter.createHandler({
    loadConfig: async () => {
      loads += 1;
      return { [name]: "from-ssm", [preset]: "from-ssm" };
    },
    dispatch: () => Response.json({ ok: true }),
    unavailableMessage: "unused",
  });

  try {
    await Promise.all([handler(baseEvent), handler(baseEvent)]);
    await handler(baseEvent);
    assert.equal(loads, 1);
    assert.equal(process.env[name], "from-ssm");
    assert.equal(process.env[preset], "from-env");
  } finally {
    delete process.env[name];
    delete process.env[preset];
  }
});

test("a failed configuration load is a 503 the visitor can read, and is retried", async () => {
  let attempts = 0;
  const handler = adapter.createHandler({
    loadConfig: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("ssm down");
      return {};
    },
    dispatch: () => Response.json({ ok: true }),
    unavailableMessage: "The waitlist is temporarily unavailable.",
  });

  const failed = await handler(baseEvent);
  assert.equal(failed.statusCode, 503);
  assert.equal(failed.headers["cache-control"], "no-store");
  assert.deepEqual(JSON.parse(failed.body), {
    ok: false,
    code: "config_unavailable",
    message: "The waitlist is temporarily unavailable.",
  });

  const recovered = await handler(baseEvent);
  assert.equal(recovered.statusCode, 200);
  assert.equal(attempts, 2);
});
