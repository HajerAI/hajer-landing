import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const seo = (await import(
  new URL("../lib/seo.ts", import.meta.url).href
)) as typeof import("../lib/seo");
const { site } = (await import(
  new URL("../content/site.ts", import.meta.url).href
)) as typeof import("../content/site");
const legal = (await import(
  new URL("../content/legal.ts", import.meta.url).href
)) as typeof import("../content/legal");
const copy = (await import(
  new URL("../content/copy.ts", import.meta.url).href
)) as typeof import("../content/copy");

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const nextConfigSource = await read("../next.config.ts");
const layoutSource = await read("../app/layout.tsx");
const sitemapSource = await read("../app/sitemap.ts");
const robotsSource = await read("../app/robots.ts");
const llmsRouteSource = await read("../app/llms.txt/route.ts");
const legalPageSource = await read("../components/legal/LegalPage.tsx");
const thankYouSource = await read("../app/thank-you/page.tsx");

const ORIGIN = "https://hajer.ai";
const LEGAL_DOCS = [legal.privacyPolicy, legal.termsOfService];
const identity = { ...site, url: ORIGIN };

/** Keys that would assert something the page does not: see content/copy.ts. */
const FORBIDDEN_CLAIM_KEYS = [
  "offers",
  "aggregateRating",
  "review",
  "award",
  "datePublished",
  "foundingDate",
  "numberOfEmployees",
];

function allKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(allKeys);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => [key, ...allKeys(child)]);
  }
  return [];
}

test("pageUrl renders the trailing-slash form the static export canonicalises to", () => {
  // The sitemap's URLs only match the canonical tags while this holds.
  assert.match(nextConfigSource, /output: "export", trailingSlash: true/);

  assert.equal(seo.pageUrl(ORIGIN, "/"), "https://hajer.ai/");
  assert.equal(seo.pageUrl(ORIGIN, ""), "https://hajer.ai/");
  assert.equal(seo.pageUrl(ORIGIN, "privacy"), "https://hajer.ai/privacy/");
  assert.equal(seo.pageUrl(ORIGIN, "/privacy"), "https://hajer.ai/privacy/");
  assert.equal(seo.pageUrl(ORIGIN, "/privacy/"), "https://hajer.ai/privacy/");
  assert.equal(seo.pageUrl(ORIGIN, "//privacy//"), "https://hajer.ai/privacy/");
});

test("the sitemap lists the home and legal pages at their canonical URLs", () => {
  const entries = seo.sitemapEntries(ORIGIN, LEGAL_DOCS);

  assert.deepEqual(
    entries.map((entry) => entry.url),
    ["https://hajer.ai/", "https://hajer.ai/privacy/", "https://hajer.ai/terms/"],
  );
  for (const entry of entries) {
    assert.ok(entry.url.endsWith("/"), `${entry.url} must match its canonical`);
    assert.doesNotMatch(entry.url, /thank-you/, "/thank-you is noindex and stays out");
  }
});

test("sitemap lastmod is a real content date, never the build time", () => {
  const [home, ...legalEntries] = seo.sitemapEntries(ORIGIN, LEGAL_DOCS);

  assert.equal(home.lastModified, undefined);
  assert.deepEqual(
    legalEntries.map((entry) => entry.lastModified?.toISOString().slice(0, 10)),
    LEGAL_DOCS.map((doc) => doc.effectiveDate),
  );
  assert.doesNotMatch(sitemapSource, /new Date\(\)/);
});

test("app/sitemap.ts feeds every legal document to the builder", () => {
  assert.match(sitemapSource, /sitemapEntries\(site\.url, \[privacyPolicy, termsOfService\]\)/);
  assert.deepEqual(
    LEGAL_DOCS.map((doc) => doc.slug).sort(),
    ["privacy", "terms"],
    "a new legal document must be added to the sitemap and llms.txt",
  );
});

test("structured data asserts identity and contact, and nothing else", () => {
  const graph = seo.structuredData(identity, copy.footer.email)["@graph"];
  const [org, website] = graph;

  assert.equal(org["@type"], "Organization");
  assert.equal(org.name, "Hajer");
  assert.equal(org.url, "https://hajer.ai/");
  assert.equal(org.logo, "https://hajer.ai/apple-icon");
  assert.equal(org.contactPoint.email, copy.footer.email);
  assert.equal(org.contactPoint.email, legal.LEGAL_CONTACT);
  assert.equal(website["@type"], "WebSite");
  assert.deepEqual(website.publisher, { "@id": org["@id"] });

  for (const key of allKeys(graph)) {
    assert.ok(!FORBIDDEN_CLAIM_KEYS.includes(key), `structured data must not carry ${key}`);
  }
});

test("sameAs is omitted while no profiles exist and emitted verbatim once they do", () => {
  const empty = seo.structuredData({ ...identity, sameAs: [] }, copy.footer.email);
  assert.ok(!("sameAs" in empty["@graph"][0]));

  const profiles = ["https://www.linkedin.com/company/hajer", "https://github.com/HajerAI"];
  const listed = seo.structuredData({ ...identity, sameAs: profiles }, copy.footer.email);
  assert.deepEqual(listed["@graph"][0].sameAs, profiles);
});

test("every configured sameAs entry is an absolute https URL", () => {
  for (const url of site.sameAs) {
    assert.equal(new URL(url).protocol, "https:", `${url} must be absolute https`);
  }
});

test("the layout renders the shared structured data builder", () => {
  assert.match(layoutSource, /structuredData\(site, footer\.email\)/);
  assert.match(layoutSource, /application\/ld\+json/);
});

test("llms.txt follows the llmstxt.org shape and only repeats page copy", () => {
  const body = seo.llmsTxt(
    identity,
    copy.hero.body,
    { email: copy.footer.email, note: copy.footer.emailNote },
    LEGAL_DOCS,
  );
  const lines = body.split("\n");

  assert.equal(lines[0], "# Hajer");
  assert.equal(lines.filter((line) => line.startsWith("# ")).length, 1, "exactly one H1");
  assert.ok(lines.includes(`> ${site.description}`));
  assert.ok(lines.includes(copy.hero.body));
  assert.ok(body.includes(copy.footer.email));
  assert.ok(body.endsWith("\n"));

  const links = [...body.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
  assert.deepEqual(links, [
    "https://hajer.ai/",
    "https://hajer.ai/privacy/",
    "https://hajer.ai/terms/",
  ]);
  assert.doesNotMatch(body, /thank-you/);
});

test("the llms.txt route is static plain text built from content/*", () => {
  assert.match(llmsRouteSource, /export const dynamic = "force-static"/);
  assert.match(llmsRouteSource, /text\/plain; charset=utf-8/);
  assert.match(llmsRouteSource, /llmsTxt\(/);
});

test("legal pages keep the social card their own openGraph would otherwise drop", () => {
  assert.match(legalPageSource, /url: "\/opengraph-image"/);
  assert.match(legalPageSource, /width: ogSize\.width/);
  assert.match(legalPageSource, /alt: ogAlt/);
});

test("/thank-you is noindex and does not claim the home canonical", () => {
  assert.match(thankYouSource, /robots: \{ index: false, follow: false \}/);
  assert.match(thankYouSource, /alternates: \{ canonical: null \}/);
});

test("only the canonical origin is indexable", () => {
  assert.match(robotsSource, /site\.url === "https:\/\/hajer\.ai"/);
  assert.match(robotsSource, /disallow: "\/"/);
});
