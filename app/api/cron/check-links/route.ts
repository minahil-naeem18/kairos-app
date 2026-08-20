import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // Simple security check
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const opportunities = await prisma.opportunity.findMany({
    where: { verificationStatus: { not: "EXPIRED" } },
  });

  let expired = 0;
  let stillGood = 0;

  for (const opp of opportunities) {
    try {
      const headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      };

      let res = await fetch(opp.applicationUrl, { method: "HEAD", headers });

      if (!res.ok) {
        res = await fetch(opp.applicationUrl, { method: "GET", headers });
      }

      if (!res.ok) {
        await prisma.opportunity.update({
          where: { id: opp.id },
          data: { verificationStatus: "EXPIRED" },
        });
        expired++;
      } else {
        stillGood++;
      }
    } catch {
      stillGood++;
    }
  }

  return NextResponse.json({
    message: "Link check complete",
    stillGood,
    expired,
  });
}