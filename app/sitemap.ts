import type { MetadataRoute } from "next";
import { privacyPolicy, termsOfService } from "@/content/legal";
import { site } from "@/content/site";
import { sitemapEntries } from "@/lib/seo";

// The landing page plus the two legal documents. Section links are same-page
// anchors, not routes, and /thank-you is a post-submit page marked noindex.
// URLs match the canonical tags exactly; see pageUrl in lib/seo.ts.
// Rendered once at build time: the site is a static export (next.config.ts).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(site.url, [privacyPolicy, termsOfService]);
}
