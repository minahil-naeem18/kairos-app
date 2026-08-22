import { PrismaClient } from "@prisma/client";
 
const prisma = new PrismaClient();
 
const ADZUNA_APP_ID = "6dc02699";
const ADZUNA_APP_KEY = "d359c95ae1d9ca834862871358b58506";
 
// All 19 Adzuna-supported country codes
const COUNTRIES = [
  "us", "gb", "au", "de", "fr", "in", "ca", "nz", "za",
  "pl", "nl", "it", "es", "at", "be", "br", "mx", "sg", "ch",
];
 
// Different fields/categories to search across (not just tech)
const SEARCH_TERMS = [
  "marketing",
  "sales",
  "teacher",
  "nurse",
  "accountant",
  "engineer",
  "internship",
  "customer service",
  "graphic design",
  "business analyst",
];
 
// Simple sleep helper to avoid hammering Adzuna / job sites
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
 
async function importAdzuna() {
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
 
  let totalImported = 0;
  let totalSkipped = 0;
 
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  };
 
  for (const country of COUNTRIES) {
    for (const term of SEARCH_TERMS) {
      console.log(`Fetching ${term} jobs in ${country.toUpperCase()}...`);
 
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=5&what=${encodeURIComponent(
        term
      )}`;
 
      let data;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.log(`  Failed for ${country}/${term}, skipping.`);
          await sleep(1000); // wait before next request even on failure
          continue;
        }
        data = await res.json();
      } catch {
        console.log(`  Network error for ${country}/${term}, skipping.`);
        await sleep(1000);
        continue;
      }
 
      // Delay after every successful Adzuna API call to avoid rate limiting
      await sleep(1000); // 1 second between search requests
 
      for (const job of data.results || []) {
        if (!job.title || !job.redirect_url || !job.company?.display_name) {
          totalSkipped++;
          continue;
        }
 
        try {
          let linkCheck = await fetch(job.redirect_url, {
            method: "HEAD",
            headers,
          });
          if (!linkCheck.ok) {
            linkCheck = await fetch(job.redirect_url, {
              method: "GET",
              headers,
            });
          }
          if (!linkCheck.ok) {
            totalSkipped++;
            continue;
          }
        } catch {
          totalSkipped++;
          continue;
        }
 
        // Small delay after each link-check to avoid hammering job sites
        await sleep(300);
 
        const existing = await prisma.opportunity.findFirst({
          where: { applicationUrl: job.redirect_url },
        });
 
        if (existing) {
          totalSkipped++;
          continue;
        }
 
        const isInternship = job.title.toLowerCase().includes("intern");
 
        const provider = await prisma.provider.upsert({
          where: { name: job.company.display_name },
          update: {},
          create: { name: job.company.display_name },
        });
 
        await prisma.opportunity.create({
          data: {
            title: job.title,
            description: job.description
              ? job.description.slice(0, 1000)
              : "No description provided.",
            providerId: provider.id,
            categoryId: isInternship ? internshipsCategory.id : jobsCategory.id,
            location: job.location?.display_name || "Not specified",
            fundingType: "PAID",
            salary:
              job.salary_min && job.salary_max
                ? `${Math.round(job.salary_min)} - ${Math.round(job.salary_max)}`
                : undefined,
            applicationUrl: job.redirect_url,
            verificationStatus: "VERIFIED",
            publishedAt: job.created ? new Date(job.created) : new Date(),
          },
        });
 
        totalImported++;
      }
    }
  }
 
  console.log(
    `Import complete. Imported: ${totalImported}, Skipped: ${totalSkipped}`
  );
}
 
importAdzuna()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
 