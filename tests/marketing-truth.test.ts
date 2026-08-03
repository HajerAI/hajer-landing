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
const runwaySource = await readFile(
  new URL("../components/motion/runway-band.tsx", import.meta.url),
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

test("the rendered page keeps the Replit visual system with the bounded assessment story", () => {
  for (const section of [
    "SiteNav",
    "Hero",
    "Problem",
    "ChangeExplorer",
    "Building",
    "Deliverables",
    "Authority",
    "Verdict",
    "Status",
    "FAQ",
    "Waitlist",
    "SiteFooter",
  ]) {
    assert.match(pageSource, new RegExp(section));
  }
  assert.equal(
    copy.hero.headline,
    "Don’t switch AI models blind. See what breaks first.",
  );
  assert.match(copy.hero.microcopy, /founder-led assessments/i);
  assert.equal(copy.runway.zones.current, "GPT-5");
  assert.equal(copy.runway.zones.candidate, "Claude Sonnet 4.5");
  assert.equal(copy.deliverables.items.length, 4);
  assert.match(copy.deliverables.authority, /team retains authority/i);
});

test("contact and assessment-request copy remain the visible authority", () => {
  assert.equal(copy.footer.email, "hello@hajer.ai");
  assert.equal(copy.nav.cta, "Request Assessment");
  assert.match(copy.waitlist.submitLabel, /request an assessment/i);
  assert.match(copy.status.intro, /engineering leaders/i);
  assert.doesNotMatch(JSON.stringify(copy), /prelaunch|what does not exist|not yet available/i);
  assert.equal(copy.authority.hajer.length, copy.authority.customer.length);
  assert.equal(copy.status.focus.length, copy.status.fit.length);
});

test("Claude Sonnet owns the orange lane and concerning changes stop at Hajer", () => {
  assert.match(runwaySource, /bg-vermilion/);
  assert.match(runwaySource, /\{runway\.zones\.candidate\}/);
  assert.match(runwaySource, /rw-packet-blocked/);
  assert.match(runwaySource, /--rw-blocked-bg:#ff5a36/);
  assert.match(runwaySource, /text-white/);
});

test("the illustrative replay is removed from the mobile layout", () => {
  assert.match(heroSource, /className="hidden md:block"[\s\S]*<RunwayBand \/>/);
});

test("Next retains analytics, durable capture, and founder follow-up mechanics", () => {
  assert.match(layoutSource, /<GoogleAnalytics gaId="G-PNJNM11W5B" \/>/);
  assert.match(formsSource, /postWaitlist/);
  assert.match(formsSource, /source: "hero"/);
  assert.match(formsSource, /source: "form"/);
  assert.match(formsSource, /writeCaptureHandoff/);
  assert.match(formsSource, /readCaptureHandoff/);
  assert.match(formsSource, /sendGAEvent\("event", "generate_lead"/);
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
