import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listExpired() {
  const expired = await prisma.opportunity.findMany({
    where: { verificationStatus: "EXPIRED" },
    include: { category: true },
    orderBy: { title: "asc" },
  });

  console.log(`Total expired: ${expired.length}\n`);

  for (const opp of expired) {
    console.log(`[${opp.category.name}] ${opp.title}`);
    console.log(`  URL: ${opp.applicationUrl}`);
    console.log("");
  }
}

listExpired()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });