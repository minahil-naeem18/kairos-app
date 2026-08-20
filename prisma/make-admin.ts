import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const YOUR_EMAIL = "minahil123@gmail.com";

async function makeAdmin() {
  const user = await prisma.user.update({
    where: { email: YOUR_EMAIL },
    data: { role: "ADMIN" },
  });

  console.log(`${user.email} is now an ADMIN.`);
}

makeAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });