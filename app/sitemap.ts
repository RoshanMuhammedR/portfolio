import type { MetadataRoute } from "next";
import { identityData } from "@/content/portfolioData";
import { navItems } from "@/content/site";
import { getWritings } from "@/lib/content";

/** The studio is deliberately absent - see robots.ts. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = identityData.liveSiteUrl.replace(/\/$/, "");
  const now = new Date();

  const pages: MetadataRoute.Sitemap = navItems.map((item) => ({
    url: item.href === "/" ? base : `${base}${item.href}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));

  const writings = await getWritings();

  return [
    ...pages,
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...writings.map((piece) => ({
      url: `${base}/writings/${piece.slug}`,
      lastModified: piece.published_at ? new Date(piece.published_at) : now,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
