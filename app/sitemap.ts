import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { work } from "@/content/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...work.map((item) => ({
      url: `${site.url}/work/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
