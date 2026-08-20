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

function mapToCountry(location: string): string | null {
  const lower = location.toLowerCase();
  for (const [country, keywords] of Object.entries(COUNTRY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return country;
    }
  }
  return null;
}

export async function GET() {
  const opportunities = await prisma.opportunity.findMany({
    where: { verificationStatus: { not: "EXPIRED" } },
    select: { location: true },
  });

  const counts: Record<string, number> = {};

  for (const opp of opportunities) {
    if (!opp.location) continue;
    const country = mapToCountry(opp.location);
    if (country) {
      counts[country] = (counts[country] || 0) + 1;
    }
  }

  return NextResponse.json(counts);
}