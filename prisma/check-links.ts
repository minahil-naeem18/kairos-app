import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkLinks() {
  const opportunities = await prisma.opportunity.findMany({
    where: { verificationStatus: { not: "EXPIRED" } },
  });

  console.log(`Checking ${opportunities.length} links...`);

  let expired = 0;
  let stillGood = 0;

  for (const opp of opportunities) {
    try {
      const headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      };

      let res = await fetch(opp.applicationUrl, {
        method: "HEAD",
        headers,
      });

      // Some servers don't support HEAD properly, retry with GET
      if (!res.ok) {
        res = await fetch(opp.applicationUrl, {
          method: "GET",
          headers,
        });
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
      // Network error - could be temporary, don't mark expired on first failure
      stillGood++;
    }
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