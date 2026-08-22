import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SCHOLARSHIPS = [
  {
    title: "Rhodes Scholarship (Oxford University)",
    description:
      "The world's oldest international scholarship, fully funding postgraduate study at Oxford in any field — arts, sciences, law, medicine. Covers tuition, living stipend, and travel.",
    provider: "Rhodes Trust",
    location: "United Kingdom",
    degreeLevels: ["MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/",
  },
  {
    title: "Erasmus Mundus Joint Master Degrees",
    description:
      "Fully funded EU-wide scholarship for Master's programs delivered by consortiums of European universities, covering tuition, travel, and monthly stipend, across all academic fields.",
    provider: "European Commission",
    location: "Multiple European Countries",
    degreeLevels: ["MASTERS"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://education.ec.europa.eu/education-levels/higher-education/erasmus-mundus",
  },
  {
    title: "Chinese Government Scholarship (CSC)",
    description:
      "Fully funded scholarship by the Chinese Ministry of Education for undergraduate, Master's, and PhD study in China, covering tuition, accommodation, and monthly stipend.",
    provider: "China Scholarship Council",
    location: "China",
    degreeLevels: ["UNDERGRADUATE", "MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://www.campuschina.org/",
  },
  {
    title: "Korean Government Scholarship Program (KGSP)",
    description:
      "Fully funded scholarship by the South Korean government for undergraduate and graduate study, covering tuition, airfare, monthly stipend, and Korean language training.",
    provider: "NIIED, South Korea",
    location: "South Korea",
    degreeLevels: ["UNDERGRADUATE", "MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do",
  },
  {
    title: "Mastercard Foundation Scholars Program",
    description:
      "Fully funded scholarship for academically talented African students facing financial hardship, covering tuition, accommodation, and mentorship, across many fields.",
    provider: "Mastercard Foundation",
    location: "Multiple Countries",
    degreeLevels: ["UNDERGRADUATE", "MASTERS"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://mastercardfdn.org/all/scholars/",
  },
  {
    title: "Mandela Rhodes Scholarship (South Africa)",
    description:
      "Fully funded postgraduate scholarship for African students, focused on developing leadership skills alongside academic study at South African universities.",
    provider: "Mandela Rhodes Foundation",
    location: "South Africa",
    degreeLevels: ["MASTERS"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://mandelarhodes.org/apply/",
  },
  {
    title: "Holland Scholarship (Netherlands)",
    description:
      "Scholarship for non-EU/EEA students starting a Bachelor's or Master's degree at a Dutch research university, awarded to students across all fields of study.",
    provider: "Nuffic",
    location: "Netherlands",
    degreeLevels: ["UNDERGRADUATE", "MASTERS"],
    fundingType: "PARTIALLY_FUNDED",
    applicationUrl: "https://www.studyinnl.org/finances/holland-scholarship",
  },
  {
    title: "Swedish Institute Scholarships",
    description:
      "Fully funded scholarship for Master's study in Sweden for students from eligible countries, covering tuition, living costs, travel, and insurance.",
    provider: "Swedish Institute",
    location: "Sweden",
    degreeLevels: ["MASTERS"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://si.se/en/apply/scholarships/",
  },
  {
    title: "Eiffel Excellence Scholarship (France)",
    description:
      "Scholarship by the French government for outstanding international students pursuing Master's or PhD study in France, covering monthly allowance and travel.",
    provider: "Campus France",
    location: "France",
    degreeLevels: ["MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence",
  },
  {
    title: "Taiwan MOE Scholarship",
    description:
      "Scholarship by Taiwan's Ministry of Education for international students pursuing undergraduate, Master's, or PhD study across various fields at Taiwanese universities.",
    provider: "Taiwan Ministry of Education",
    location: "Taiwan",
    degreeLevels: ["UNDERGRADUATE", "MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://www.roc-taiwan.org/",
  },
  {
    title: "King Abdullah Scholarship Program (Saudi Arabia)",
    description:
      "Fully funded Saudi government scholarship supporting study abroad and inbound international students across a wide range of academic disciplines.",
    provider: "Saudi Ministry of Education",
    location: "Saudi Arabia",
    degreeLevels: ["UNDERGRADUATE", "MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://www.moe.gov.sa/en/Pages/default.aspx",
  },
  {
    title: "Joint Japan/World Bank Graduate Scholarship Program",
    description:
      "Fully funded scholarship for students from developing countries to pursue development-related Master's degrees, including public policy, economics, and health.",
    provider: "World Bank",
    location: "Multiple Countries",
    degreeLevels: ["MASTERS"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://www.worldbank.org/en/programs/scholarships",
  },
  {
    title: "Rotary Peace Fellowship",
    description:
      "Fully funded fellowship for professionals studying peace and development at partner universities worldwide, covering tuition, travel, and living expenses.",
    provider: "Rotary Foundation",
    location: "Multiple Countries",
    degreeLevels: ["MASTERS"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://www.rotary.org/en/our-programs/peace-fellowships",
  },
  {
    title: "New Zealand Government Scholarships",
    description:
      "Scholarships offered by the New Zealand government for international students to study at New Zealand universities across a broad range of subjects.",
    provider: "New Zealand Government",
    location: "New Zealand",
    degreeLevels: ["UNDERGRADUATE", "MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://www.education.govt.nz/further-education/information-for-international-students/scholarships/",
  },
  {
    title: "Lester B. Pearson International Scholarship (University of Toronto)",
    description:
      "Fully funded undergraduate scholarship at the University of Toronto for international students who demonstrate creativity, leadership, and academic excellence.",
    provider: "University of Toronto",
    location: "Canada",
    degreeLevels: ["UNDERGRADUATE"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://future.utoronto.ca/pearson/",
  },
  {
    title: "Benjamin A. Gilman International Scholarship",
    description:
      "Scholarship for U.S. citizen undergraduates with financial need to study or intern abroad, supporting a wide range of fields and destination countries.",
    provider: "U.S. Department of State",
    location: "Multiple Countries",
    degreeLevels: ["UNDERGRADUATE"],
    fundingType: "PARTIALLY_FUNDED",
    applicationUrl: "https://gilmanscholarship.org/",
  },
  {
    title: "Malaysia International Scholarship (MIS)",
    description:
      "Scholarship offered by the Malaysian government for outstanding international students pursuing postgraduate study at Malaysian public universities.",
    provider: "Malaysian Ministry of Higher Education",
    location: "Malaysia",
    degreeLevels: ["MASTERS", "PHD"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://biasiswa.mohe.gov.my/MIS/",
  },
  {
    title: "Indonesia KNB Scholarship (Developing Countries Partnership)",
    description:
      "Scholarship by the Indonesian government for students from developing countries to pursue undergraduate and graduate study in Indonesia.",
    provider: "Indonesian Ministry of Education",
    location: "Indonesia",
    degreeLevels: ["UNDERGRADUATE", "MASTERS"],
    fundingType: "FULLY_FUNDED",
    applicationUrl: "https://knb.kemdikbud.go.id/",
  },
];

async function seedScholarships2() {
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
        applicationUrl: s.applicationUrl,
        verificationStatus: "VERIFIED",
        publishedAt: new Date(),
      },
    });

    added++;
  }

  console.log(`Seeded ${added} new scholarships. Skipped ${skipped} (already existed).`);
}

seedScholarships2()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });