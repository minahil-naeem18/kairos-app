import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function importGrants() {
  const scholarshipsCategory = await prisma.opportunityCategory.upsert({
    where: { slug: "scholarships" },
    update: {},
    create: { name: "Scholarships", slug: "scholarships" },
  });

  console.log("Fetching grants from Grants.gov...");

  const res = await fetch("https://api.grants.gov/v1/api/search2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keyword: "student",
      oppStatuses: "forecasted|posted",
      rows: 30,
    }),
  });

  if (!res.ok) {
    console.log("Failed to fetch Grants.gov data.");
    return;
  }

  const data = await res.json();
  const opportunitiesList = data?.data?.oppHits || [];

  console.log(`Found ${opportunitiesList.length} opportunities.`);

  const provider = await prisma.provider.upsert({
    where: { name: "Grants.gov" },
    update: {},
    create: { name: "Grants.gov" },
  });

  let imported = 0;
  let skipped = 0;

  for (const opp of opportunitiesList) {
    const title = opp.title?.toString().trim();
    const oppId = opp.id?.toString().trim();

    if (!title || !oppId) {
      skipped++;
      continue;
    }

    const link = `https://www.grants.gov/search-results-detail/${oppId}`;

    const existing = await prisma.opportunity.findFirst({
      where: { applicationUrl: link },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.opportunity.create({
      data: {
        title: title.slice(0, 250),
        description: opp.description
          ? opp.description.toString().slice(0, 1000)
          : "Federal grant opportunity. See official page for full details.",
        providerId: provider.id,
        categoryId: scholarshipsCategory.id,
        fundingType: "NOT_SPECIFIED",
        applicationUrl: link,
        verificationStatus: "VERIFIED",
        deadline: opp.closeDate ? new Date(opp.closeDate) : null,
        publishedAt: opp.openDate ? new Date(opp.openDate) : new Date(),
      },
    });

    imported++;
  }

  console.log(`Import complete. Imported: ${imported}, Skipped: ${skipped}`);
}

importGrants()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });