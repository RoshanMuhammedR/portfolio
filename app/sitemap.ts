import type { MetadataRoute } from "next";
import { identityData } from "@/content/portfolioData";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: identityData.liveSiteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
