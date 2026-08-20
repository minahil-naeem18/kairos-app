import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SCHOLARSHIPS = [
  {
    title: "Chevening Scholarship (UK)",
    description:
      "Fully-funded UK government scholarship for outstanding emerging leaders to pursue a one-year Master's degree in the UK. Covers tuition, living costs, and travel.",
    provider: "Chevening",
    location: "United Kingdom",
    degreeLevels: ["MASTERS"],
    fundingType: "FULLY_FUNDED",
    deadline: "2026-11-04",
    applicationUrl: "https://www.chevening.org/apply/",
  },
  {
    title: "DAAD Study Scholarships for Foreign Graduates (Germany)",
    description:
      "Germany's DAAD offers fully funded Master's scholarships for international graduates, covering tuition, monthly stipend, health insurance, and travel allowance.",
    provider: "DAAD",
    location: "Germany",
    degreeLevels: ["MASTERS"],
    fundingType: "FULLY_FUNDED",
    deadline: "2026-10-15",
    applicationUrl: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
  },
  {
    title: "Fulbright Foreign Student Program (USA)",
    description:
      "Fully funded scholarship for graduate study, research, or teaching in the United States, covering tuition, living stipend, health insurance, and airfare. Deadlines vary by country.",
    provider: "Fulbright",
    location: "United States",
    degreeLevels: ["MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    deadline: null,
    applicationUrl: "https://foreign.fulbrightonline.org/",
  },
  {
    title: "Commonwealth Scholarship (UK)",
    description:
      "Fully funded Master's and PhD scholarships for citizens of Commonwealth countries to study in the UK, funded by the UK government.",
    provider: "Commonwealth Scholarship Commission",
    location: "United Kingdom",
    degreeLevels: ["MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    deadline: "2026-12-01",
    applicationUrl: "https://cscuk.fcdo.gov.uk/scholarships/",
  },
  {
    title: "Gates Cambridge Scholarship (UK)",
    description:
      "Full-cost scholarship for outstanding applicants from outside the UK to pursue postgraduate study at the University of Cambridge, funded by the Bill & Melinda Gates Foundation.",
    provider: "Gates Cambridge Trust",
    location: "United Kingdom",
    degreeLevels: ["MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    deadline: "2026-12-03",
    applicationUrl: "https://www.gatescambridge.org/apply/",
  },
  {
    title: "Türkiye Bursları (Turkiye Scholarships)",
    description:
      "Fully funded Turkish government scholarship covering tuition, accommodation, monthly stipend, health insurance, and airfare for undergraduate, Master's, and PhD study in Turkey.",
    provider: "Turkiye Burslari",
    location: "Turkey",
    degreeLevels: ["UNDERGRADUATE", "MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    deadline: "2027-02-20",
    applicationUrl: "https://www.turkiyeburslari.gov.tr/",
  },
  {
    title: "Mitacs Globalink Research Award (Canada)",
    description:
      "Funded research internship program for international undergraduate and graduate students to conduct a research project at a Canadian university for 12-24 weeks.",
    provider: "Mitacs",
    location: "Canada",
    degreeLevels: ["UNDERGRADUATE", "MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    deadline: null,
    applicationUrl: "https://www.mitacs.ca/our-programs/globalink-research-award-students/",
  },
  {
    title: "Stipendium Hungaricum (Hungary)",
    description:
      "Fully funded scholarship by the Hungarian government covering tuition, accommodation, and monthly stipend for Bachelor's, Master's, and PhD study in Hungary.",
    provider: "Tempus Public Foundation",
    location: "Hungary",
    degreeLevels: ["UNDERGRADUATE", "MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    deadline: "2027-01-15",
    applicationUrl: "https://stipendiumhungaricum.hu/",
  },
  {
    title: "Australia Awards Scholarship",
    description:
      "Fully funded Australian government scholarship for postgraduate study, covering tuition, living expenses, airfare, and health insurance for students from eligible developing countries.",
    provider: "Australia Awards",
    location: "Australia",
    degreeLevels: ["MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    deadline: null,
    applicationUrl: "https://www.australiaawards.gov.au/",
  },
  {
    title: "MEXT Scholarship (Japan)",
    description:
      "Fully funded Japanese government scholarship covering tuition, monthly stipend, and airfare for undergraduate, Master's, and research study in Japan.",
    provider: "MEXT Japan",
    location: "Japan",
    degreeLevels: ["UNDERGRADUATE", "MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    deadline: null,
    applicationUrl: "https://www.studyinjapan.go.jp/en/planning/scholarship/",
  },
];

async function seedScholarships() {
  const scholarshipsCategory = await prisma.opportunityCategory.upsert({
    where: { slug: "scholarships" },
    update: {},
    create: { name: "Scholarships", slug: "scholarships" },
  });

  let added = 0;
  let skipped = 0;

  for (const s of SCHOLARSHIPS) {
    const existing = await prisma.opportunity.findFirst({
      where: { applicationUrl: s.applicationUrl },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const provider = await prisma.provider.upsert({
      where: { name: s.provider },
      update: {},
      create: { name: s.provider },
    });

    await prisma.opportunity.create({
      data: {
        title: s.title,
        description: s.description,
        providerId: provider.id,
        categoryId: scholarshipsCategory.id,
        location: s.location,
        degreeLevels: s.degreeLevels as any,
        fundingType: s.fundingType as any,
        deadline: s.deadline ? new Date(s.deadline) : null,
        applicationUrl: s.applicationUrl,
        verificationStatus: "VERIFIED",
        publishedAt: new Date(),
      },
    });

    added++;
  }

  console.log(`Seeded ${added} scholarships. Skipped ${skipped} (already existed).`);
}

seedScholarships()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });