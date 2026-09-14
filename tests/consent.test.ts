import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const consent = (await import(
  new URL("../lib/consent.ts", import.meta.url).href
)) as typeof import("../lib/consent");

const layoutSource = await readFile(
  new URL("../app/layout.tsx", import.meta.url),
  "utf8",
);
const instrumentationSource = await readFile(
  new URL("../instrumentation-client.ts", import.meta.url),
  "utf8",
);
const sharedSource = await readFile(
  new URL("../components/waitlist/shared.tsx", import.meta.url),
  "utf8",
);
const routeSource = await readFile(
  new URL("../app/api/waitlist/route.ts", import.meta.url),
  "utf8",
);

function stubStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
  return data;
}

function throwingStorage() {
  Object.defineProperty(globalThis, "localStorage", {
    get() {
      throw new Error("storage disabled");
    },
    configurable: true,
  });
}

test("consent reads granted, denied, and treats anything else as pending", () => {
  stubStorage({ [consent.CONSENT_KEY]: "granted" });
  assert.equal(consent.readConsent(), "granted");
  stubStorage({ [consent.CONSENT_KEY]: "denied" });
  assert.equal(consent.readConsent(), "denied");
  stubStorage({ [consent.CONSENT_KEY]: "yes" });
  assert.equal(consent.readConsent(), "pending");
  stubStorage();
  assert.equal(consent.readConsent(), "pending");
});

test("consent writes and clears the single key", () => {
  const data = stubStorage();
  consent.writeConsent("granted");
  assert.equal(data.get(consent.CONSENT_KEY), "granted");
  consent.writeConsent("denied");
  assert.equal(data.get(consent.CONSENT_KEY), "denied");
  consent.clearConsent();
  assert.equal(data.has(consent.CONSENT_KEY), false);
});

test("consent degrades to pending and never throws when storage is unavailable", () => {
  throwingStorage();
  assert.equal(consent.readConsent(), "pending");
  assert.doesNotThrow(() => consent.writeConsent("granted"));
  assert.doesNotThrow(() => consent.clearConsent());
  stubStorage();
});

test("the inline Consent Mode script defaults to denied and reads the same key", () => {
  assert.match(consent.CONSENT_DEFAULT_SCRIPT, /gtag\("consent","default"/);
  assert.ok(consent.CONSENT_DEFAULT_SCRIPT.includes(JSON.stringify(consent.CONSENT_KEY)));
  assert.match(consent.CONSENT_DEFAULT_SCRIPT, /analytics_storage:c==="granted"\?"granted":"denied"/);
  assert.match(consent.CONSENT_DEFAULT_SCRIPT, /ad_storage:"denied"/);
  assert.doesNotMatch(consent.CONSENT_DEFAULT_SCRIPT, /\n/);
});

test("analytics are gated behind consent in the layout, the SDK config, and the waitlist client", () => {
  assert.match(layoutSource, /CONSENT_DEFAULT_SCRIPT/);
  assert.match(
    layoutSource,
    /<ConsentGate>\s*<GoogleAnalytics gaId="G-PNJNM11W5B" \/>\s*<\/ConsentGate>/,
  );
  assert.match(layoutSource, /<CookieBanner \/>/);
  assert.match(instrumentationSource, /cookieless_mode: "on_reject"/);
  assert.match(instrumentationSource, /maskAllInputs: true/);
  assert.doesNotMatch(instrumentationSource, /opt_out_capturing_by_default/);
  assert.match(sharedSource, /get_explicit_consent_status\(\) === "granted"/);
  assert.match(sharedSource, /POSTHOG_COOKIELESS_SENTINEL/);
  assert.match(routeSource, /POSTHOG_COOKIELESS_SENTINEL/);
});
