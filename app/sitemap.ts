import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// One page, one entry. Section links are same-page anchors, not routes.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
