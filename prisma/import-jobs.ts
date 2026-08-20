import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function importJobs() {
  console.log("Fetching jobs from Arbeitnow...");

  const res = await fetch("https://www.arbeitnow.com/api/job-board-api");
  const data = await res.json();

  const jobsCategory = await prisma.opportunityCategory.upsert({
    where: { slug: "jobs" },
    update: {},
    create: { name: "Jobs", slug: "jobs" },
  });

  const internshipsCategory = await prisma.opportunityCategory.upsert({
    where: { slug: "internships" },
    update: {},
    create: { name: "Internships", slug: "internships" },
  });

  let imported = 0;
  let skipped = 0;

  for (const job of data.data) {
    // Skip if missing essential info
    if (!job.title || !job.url || !job.company_name) {
      skipped++;
      continue;
    }

    // Verify the link actually works before importing
    try {
      const linkCheck = await fetch(job.url, { method: "HEAD" });
      if (!linkCheck.ok) {
        skipped++;
        continue;
      }
    } catch {
      skipped++;
      continue;
    }

    // Skip if already imported (check by applicationUrl)
    const existing = await prisma.opportunity.findFirst({
      where: { applicationUrl: job.url },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const isInternship = job.title.toLowerCase().includes("intern");

    const provider = await prisma.provider.upsert({
      where: { name: job.company_name },
      update: {},
      create: { name: job.company_name },
    });

    await prisma.opportunity.create({
      data: {
        title: job.title,
        description: job.description
          ? job.description.replace(/<[^>]*>/g, "").slice(0, 1000)
          : "No description provided.",
        providerId: provider.id,
        categoryId: isInternship ? internshipsCategory.id : jobsCategory.id,
        location: job.location || "Not specified",
        remoteStatus: job.remote ? "REMOTE" : "NOT_SPECIFIED",
        fundingType: "PAID",
        applicationUrl: job.url,
        verificationStatus: "VERIFIED",
        publishedAt: new Date(job.created_at * 1000),
      },
    });

    imported++;
  }

  console.log(`Import complete. Imported: ${imported}, Skipped: ${skipped}`);
}

importJobs()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });