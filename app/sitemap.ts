import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://the-kairos.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      priority: 0.3,
    },
  ];

  const opportunities = await prisma.opportunity.findMany({
    where: { verificationStatus: { not: "EXPIRED" } },
    select: { id: true, updatedAt: true },
    take: 500,
  });

  const opportunityPages: MetadataRoute.Sitemap = opportunities.map((opp) => ({
    url: `${BASE_URL}/opportunity/${opp.id}`,
    lastModified: opp.updatedAt,
    priority: 0.6,
  }));

  return [...staticPages, ...opportunityPages];
}