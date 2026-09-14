import type { MetadataRoute } from "next";
import { privacyPolicy, termsOfService } from "@/content/legal";
import { site } from "@/content/site";

// The landing page plus the two legal documents. Section links are same-page
// anchors, not routes, and /thank-you is a post-submit page marked noindex.
// Rendered once at build time: the site is a static export (next.config.ts).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/privacy`,
      lastModified: new Date(privacyPolicy.effectiveDate),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${site.url}/terms`,
      lastModified: new Date(termsOfService.effectiveDate),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
