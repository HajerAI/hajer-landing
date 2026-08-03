import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// site.url is the same origin used for metadataBase in app/layout.tsx.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
