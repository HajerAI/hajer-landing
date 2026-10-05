import type { LegalDocument } from "../content/legal";

/**
 * Builders for the crawler-facing files: sitemap, structured data and
 * llms.txt. They take their content as arguments instead of importing it, so
 * tests can load this module directly (it has no runtime imports) and assert
 * on exactly what ships.
 *
 * Every string they emit comes from content/*. Nothing here may add a claim
 * the page does not make: no ratings, offers, launch dates or customer names.
 */

type SiteIdentity = {
  name: string;
  url: string;
  description: string;
  tagline: string;
  category: string;
  sameAs: readonly string[];
};

/**
 * Absolute URL for a route, in the form the canonical tag uses. The static
 * export sets `trailingSlash: true` (next.config.ts), so Next renders the
 * canonical for "/privacy" as ".../privacy/". The sitemap must list that same
 * string, or Google sees two URLs for one page.
 */
export function pageUrl(origin: string, path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  return trimmed ? `${origin}/${trimmed}/` : `${origin}/`;
}

export type SitemapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency: "weekly" | "yearly";
  priority: number;
};

/**
 * The landing page plus the legal documents. The home entry carries no
 * lastModified: there is no tracked content date for it, and a build
 * timestamp would claim a change on every deploy, which teaches Google to
 * ignore the field. Legal pages use their effective date.
 */
export function sitemapEntries(
  origin: string,
  legalDocs: readonly LegalDocument[],
): SitemapEntry[] {
  return [
    { url: pageUrl(origin, "/"), changeFrequency: "weekly", priority: 1 },
    ...legalDocs.map((doc) => ({
      url: pageUrl(origin, doc.slug),
      lastModified: new Date(doc.effectiveDate),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}

/**
 * Organization + WebSite graph. Asserts identity and contact only. `logo`
 * points at the 180x180 apple-icon (Google wants at least 112x112); `sameAs`
 * is emitted only once real profiles are listed in content/site.ts, because
 * it is what lets answer engines tell this Hajer apart from the name.
 */
export function structuredData(site: SiteIdentity, contactEmail: string) {
  const organization = {
    "@type": "Organization",
    "@id": `${site.url}/#org`,
    name: site.name,
    url: pageUrl(site.url, "/"),
    logo: `${site.url}/apple-icon`,
    description: site.description,
    slogan: site.tagline,
    contactPoint: {
      "@type": "ContactPoint",
      email: contactEmail,
      contactType: "sales",
    },
    ...(site.sameAs.length > 0 ? { sameAs: [...site.sameAs] } : {}),
  };
  const website = {
    "@type": "WebSite",
    "@id": `${site.url}/#site`,
    url: pageUrl(site.url, "/"),
    name: site.name,
    description: site.description,
    publisher: { "@id": organization["@id"] },
  };
  return {
    "@context": "https://schema.org",
    "@graph": [organization, website] as const,
  };
}

/** /llms.txt in the llmstxt.org shape: H1, blockquote summary, then links. */
export function llmsTxt(
  site: SiteIdentity,
  heroBody: string,
  contact: { email: string; note: string },
  legalDocs: readonly LegalDocument[],
): string {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    heroBody,
    "",
    `${site.name} is an ${site.category.toLowerCase()}. Contact: ${contact.email} (${contact.note})`,
    "",
    "## Pages",
    "",
    `- [${site.name}](${pageUrl(site.url, "/")}): ${site.tagline}`,
    ...legalDocs.map(
      (doc) => `- [${doc.title}](${pageUrl(site.url, doc.slug)}): ${doc.description}`,
    ),
    "",
  ];
  return lines.join("\n");
}
