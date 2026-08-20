import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Categories
  const scholarships = await prisma.opportunityCategory.upsert({
    where: { slug: "scholarships" },
    update: {},
    create: { name: "Scholarships", slug: "scholarships" },
  });

  const internships = await prisma.opportunityCategory.upsert({
    where: { slug: "internships" },
    update: {},
    create: { name: "Internships", slug: "internships" },
  });

  const jobs = await prisma.opportunityCategory.upsert({
    where: { slug: "jobs" },
    update: {},
    create: { name: "Jobs", slug: "jobs" },
  });

  // Field
  const csField = await prisma.field.upsert({
    where: { name: "Computer Science" },
    update: {},
    create: { name: "Computer Science" },
  });

  // Provider
  const provider = await prisma.provider.upsert({
    where: { name: "DAAD" },
    update: {},
    create: { name: "DAAD", website: "https://www.daad.de" },
  });

  // Sample opportunities
  await prisma.opportunity.createMany({
    data: [
      {
        title: "DAAD Masters Scholarship in Germany",
        description:
          "Fully funded scholarship for international students pursuing a Master's degree in Germany, covering tuition, living costs, and travel.",
        providerId: provider.id,
        categoryId: scholarships.id,
        fieldId: csField.id,
        location: "Germany",
        eligibleCountries: ["Pakistan", "India", "Bangladesh"],
        degreeLevels: ["MASTERS"],
        remoteStatus: "NOT_SPECIFIED",
        fundingType: "FULLY_FUNDED",
        deadline: new Date("2026-10-31"),
        applicationUrl: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
        verificationStatus: "VERIFIED",
        publishedAt: new Date(),
      },
      {
        title: "Google Software Engineering Internship",
        description:
          "Summer internship program for students interested in software engineering, working on real Google products with mentorship.",
        categoryId: internships.id,
        fieldId: csField.id,
        location: "Remote / Multiple Locations",
        eligibleCountries: [],
        degreeLevels: ["UNDERGRADUATE"],
        remoteStatus: "HYBRID",
        fundingType: "PAID",
        deadline: new Date("2026-12-15"),
        applicationUrl: "https://careers.google.com/students/",
        verificationStatus: "VERIFIED",
        publishedAt: new Date(),
      },
      {
        title: "Junior Frontend Developer",
        description:
          "Entry-level role for a frontend developer with knowledge of React and TypeScript, joining a fast-growing startup team.",
        categoryId: jobs.id,
        fieldId: csField.id,
        location: "Remote",
        eligibleCountries: [],
        degreeLevels: ["UNDERGRADUATE"],
        remoteStatus: "REMOTE",
        fundingType: "PAID",
        salary: "$40,000 - $55,000 / year",
        applicationUrl: "https://example.com/careers/frontend-dev",
        verificationStatus: "VERIFIED",
        publishedAt: new Date(),
      },
    ],
  });

  console.log("Seed data created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });