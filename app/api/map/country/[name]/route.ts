import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COUNTRY_KEYWORDS: Record<string, string[]> = {
  Germany: ["germany", "deutschland", "berlin", "münchen", "munich", "hamburg", "frankfurt", "cologne", "köln", "stuttgart", "düsseldorf", "dusseldorf", "leipzig", "dresden", "essen", "hannover", "mainz", "bonn", "freiburg", "augsburg", "wildau", "bielefeld", "offenburg", "riedlingen", "kirchberg", "bauerbach", "geiselbach", "zeitz", "morsbach", "vellberg", "breitenbrunn", "niederlangen"],
  "United Kingdom": ["united kingdom", "uk", "london", "bristol", "england", "paris; prague"],
  "United States of America": ["united states", "us,", ", us", "county", "new york", "chicago", "texas", "california", "colorado", "orlando", "dallas", "houston", "denver", "austin", "philadelphia", "nashville", "boston"],
  Turkey: ["turkey", "türkiye"],
  Canada: ["canada"],
  Hungary: ["hungary"],
  Australia: ["australia"],
  Japan: ["japan"],
};

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

  return NextResponse.json(filtered.slice(0, 30));
}