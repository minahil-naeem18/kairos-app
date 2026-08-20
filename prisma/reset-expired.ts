import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetExpired() {
  const result = await prisma.opportunity.updateMany({
    where: { verificationStatus: "EXPIRED" },
    data: { verificationStatus: "VERIFIED" },
  });

  console.log(`Reset ${result.count} opportunities back to VERIFIED.`);
}

resetExpired()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });