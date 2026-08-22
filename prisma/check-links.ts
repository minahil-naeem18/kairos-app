import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkOne(url: string): Promise<boolean> {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  };

  // Try up to 2 times before deciding it's really dead
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      let res = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok || res.status === 403 || res.status === 999) {
        // 403/999 often means bot-blocked, not actually dead
        return true;
      }

      if (res.status === 404 || res.status === 410) {
        return false; // genuinely not found
      }

      // Other status codes - retry once
    } catch {
      // timeout or network error - retry once
    }

    if (attempt === 0) await sleep(2000);
  }

  return false;
}

async function checkLinks() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const opportunities = await prisma.opportunity.findMany({
    where: {
      verificationStatus: { not: "EXPIRED" },
      OR: [{ lastCheckedAt: null }, { lastCheckedAt: { lt: sevenDaysAgo } }],
    },
  });

  console.log(`Checking ${opportunities.length} links...`);

  let expired = 0;
  let stillGood = 0;

  for (const opp of opportunities) {
    const isWorking = await checkOne(opp.applicationUrl);

    if (isWorking) {
      await prisma.opportunity.update({
        where: { id: opp.id },
        data: { lastCheckedAt: new Date() },
      });
      stillGood++;
    } else {
      await prisma.opportunity.update({
        where: { id: opp.id },
        data: { verificationStatus: "EXPIRED", lastCheckedAt: new Date() },
      });
      expired++;
    }

    await sleep(500); // be gentle between different sites
  }

  console.log(`Done. Still working: ${stillGood}, Marked expired: ${expired}`);
}

checkLinks()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });