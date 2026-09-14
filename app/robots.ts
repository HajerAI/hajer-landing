import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// site.url is the same origin used for metadataBase in app/layout.tsx.
// Only the canonical site is indexable; a preview deploy (develop) disallows everything.
const canonical = site.url === "https://hajer.ai";

// Rendered once at build time: the site is a static export (next.config.ts).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: canonical ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
