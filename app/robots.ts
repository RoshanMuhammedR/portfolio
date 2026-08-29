import type { MetadataRoute } from "next";
import { identityData } from "@/content/portfolioData";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${identityData.liveSiteUrl}/sitemap.xml`,
  };
}
