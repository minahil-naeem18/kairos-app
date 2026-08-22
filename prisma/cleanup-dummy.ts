import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  const result = await prisma.opportunity.deleteMany({
    where: { applicationUrl: { contains: "example.com" } },
  });
  console.log(`Deleted ${result.count} dummy entries.`);
}

cleanup()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });