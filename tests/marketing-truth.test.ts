import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const copy = (await import(
  new URL("../content/copy.ts", import.meta.url).href
)) as typeof import("../content/copy");

const pageSource = await readFile(
  new URL("../app/page.tsx", import.meta.url),
  "utf8",
);
const layoutSource = await readFile(
  new URL("../app/layout.tsx", import.meta.url),
  "utf8",
);
const heroSource = await readFile(
  new URL("../components/sections/Hero.tsx", import.meta.url),
  "utf8",
);
const formsSource = await readFile(
  new URL("../components/waitlist/WaitlistForms.tsx", import.meta.url),
  "utf8",
);
const routeSource = await readFile(
  new URL("../app/api/waitlist/route.ts", import.meta.url),
  "utf8",
);
const followupSource = await readFile(
  new URL("../lib/waitlist/founder-followup.ts", import.meta.url),
  "utf8",
);

test("the rendered page is the hero and footer with the eval-maintenance story", () => {
  for (const section of ["SiteNav", "Hero", "SiteFooter"]) {
    assert.match(pageSource, new RegExp(section));
  }
  assert.equal(copy.hero.headline, "Nobody maintains their evals. Hajer does.");
  assert.equal(copy.hero.headlineLead, "Nobody maintains their\u00a0evals.");
  assert.equal(copy.hero.headlineAction, "Hajer does.");
  assert.match(heroSource, /headlineLead/);
  assert.match(heroSource, /lg:whitespace-nowrap/);
  assert.match(heroSource, /\{" "\}/);
  assert.match(heroSource, /text-\[clamp\(2\.75rem,12\.3vw,3rem\)\]/);
  assert.match(copy.hero.body, /evals and harnesses/i);
});

test("the hero is the whole page: no illustrative replay, no section anchors", () => {
  assert.doesNotMatch(heroSource, /RunwayBand|runway/);
  assert.doesNotMatch(pageSource, /Problem|ChangeExplorer|Deliverables|FAQ|Waitlist \/>/);
  assert.equal("runway" in copy, false);
});

test("contact and early-access copy remain the visible authority", () => {
  assert.equal(copy.footer.email, "hello@hajer.ai");
  assert.equal(copy.nav.cta, "Get early access");
  assert.match(copy.waitlist.submitLabel, /early access/i);
  assert.doesNotMatch(JSON.stringify(copy), /prelaunch|what does not exist|not yet available/i);
  assert.doesNotMatch(JSON.stringify(copy), /assessment|migration/i);
});

test("Next retains analytics, durable capture, and founder follow-up mechanics", () => {
  assert.doesNotMatch(layoutSource, /third-parties|GoogleAnalytics|CookieBanner|ConsentGate/);
  assert.match(formsSource, /postWaitlist/);
  assert.match(formsSource, /source: "hero"/);
  assert.match(formsSource, /source: "form"/);
  assert.match(formsSource, /writeCaptureHandoff/);
  assert.match(formsSource, /readCaptureHandoff/);
  assert.match(formsSource, /reportSignup\("waitlist_joined", \{ form_location: "hero" \}\)/);
  assert.match(formsSource, /reportSignup\("waitlist_joined", \{ form_location: "form" \}\)/);
  assert.match(formsSource, /reportSignup\("waitlist_details_submitted"/);
  assert.doesNotMatch(formsSource, /sendGAEvent|readConsent/);
  assert.match(routeSource, /resolveFounderFollowupSender/);
  assert.match(followupSource, /omar@hajer\.ai/);
  assert.match(followupSource, /gmail\/v1\/users\/me\/messages\/send/);
});

test("full-form capture is bare-first so Omar's follow-up is not bypassed", () => {
  const captureIndex = formsSource.indexOf("const capture = await postWaitlist");
  const enrichmentIndex = formsSource.indexOf("const enrichment = await postWaitlist");
  assert.ok(captureIndex > 0);
  assert.ok(enrichmentIndex > captureIndex);
});
