import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  const result = await prisma.opportunity.deleteMany({
    where: {
      applicationUrl: { contains: "educanada.ca" },
    },
  });

  console.log(`Deleted ${result.count} EduCanada news entries.`);
}

cleanup()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });