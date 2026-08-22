import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COUNTRY_KEYWORDS } from "@/lib/countries";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const countryName = decodeURIComponent(name);
  const keywords = COUNTRY_KEYWORDS[countryName] || [countryName.toLowerCase()];

  const allOpportunities = await prisma.opportunity.findMany({
    where: { verificationStatus: { not: "EXPIRED" } },
    include: { category: true, provider: true },
  });

  const filtered = allOpportunities.filter((opp) => {
    if (!opp.location) return false;
    const lower = opp.location.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  });

  const breakdown: Record<string, number> = {};
  for (const opp of filtered) {
    breakdown[opp.category.name] = (breakdown[opp.category.name] || 0) + 1;
  }

  return NextResponse.json({
    opportunities: filtered.slice(0, 30),
    breakdown,
    total: filtered.length,
  });
}