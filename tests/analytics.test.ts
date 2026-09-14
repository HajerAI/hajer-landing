import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const legal = (await import(
  new URL("../content/legal.ts", import.meta.url).href
)) as typeof import("../content/legal");
const config = (await import(
  new URL("../lib/posthog-config.ts", import.meta.url).href
)) as typeof import("../lib/posthog-config");

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const instrumentationSource = await read("../instrumentation-client.ts");
const serverSource = await read("../lib/posthog-server.ts");
const layoutSource = await read("../app/layout.tsx");
const footerSource = await read("../components/sections/Footer.tsx");
const sharedSource = await read("../components/waitlist/shared.tsx");
const routeSource = await read("../app/api/waitlist/route.ts");
const packageJson = JSON.parse(await read("../package.json")) as {
  dependencies: Record<string, string>;
};

test("PostHog runs cookieless, without replay, from a pinned project config", () => {
  assert.match(config.POSTHOG_PROJECT_TOKEN, /^phc_[A-Za-z0-9]{20,}$/);
  assert.equal(config.POSTHOG_HOST, "https://eu.i.posthog.com");
  assert.match(instrumentationSource, /cookieless_mode: "always"/);
  assert.match(instrumentationSource, /person_profiles: "identified_only"/);
  assert.doesNotMatch(instrumentationSource, /session_recording|opt_in_capturing|process\.env\.NEXT_PUBLIC_POSTHOG/);
  assert.doesNotMatch(serverSource, /process\.env/);
});

test("no cookie banner, consent gate, or Google Analytics remains", () => {
  assert.doesNotMatch(layoutSource, /CookieBanner|ConsentGate|CONSENT_DEFAULT_SCRIPT|GoogleAnalytics|gtag/);
  assert.doesNotMatch(footerSource, /ManageCookiesButton/);
  assert.equal(packageJson.dependencies["@next/third-parties"], undefined);
});

test("the waitlist never forwards a browser identity to the server", () => {
  assert.doesNotMatch(sharedSource, /posthog|x-posthog/);
  assert.doesNotMatch(routeSource, /x-posthog|captureWaitlistEvent|POSTHOG_COOKIELESS_SENTINEL/);
  assert.match(routeSource, /\$process_person_profile: false/);
});

test("the privacy policy describes cookieless analytics and nothing that was removed", () => {
  const text = JSON.stringify(legal.privacyPolicy);
  assert.match(text, /without cookies/);
  assert.match(text, /hash/);
  assert.match(text, /There is no session replay/);
  assert.doesNotMatch(text, /Google Analytics|Cookie preferences|hajer:consent|“Accept”/);
});
