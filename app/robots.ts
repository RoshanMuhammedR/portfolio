import type { MetadataRoute } from "next";
import { identityData } from "@/content/portfolioData";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The editor and the signing endpoint are not content. Both are guarded
      // server-side; keeping them out of the index is tidiness, not security.
      disallow: ["/studio", "/api/"],
    },
    sitemap: `${identityData.liveSiteUrl}/sitemap.xml`,
  };
}
