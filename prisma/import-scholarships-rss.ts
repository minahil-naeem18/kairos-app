import { PrismaClient } from "@prisma/client";
import { XMLParser } from "fast-xml-parser";

const prisma = new PrismaClient();
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

const RSS_FEEDS = [
  {
    name: "EduCanada",
    url: "https://www.educanada.ca/scholarships-bourses/rss/news-nouvelles_eng.xml",
    format: "atom",
  },
];

async function importScholarshipsRSS() {
  const scholarshipsCategory = await prisma.opportunityCategory.upsert({
    where: { slug: "scholarships" },
    update: {},
    create: { name: "Scholarships", slug: "scholarships" },
  });

  let totalImported = 0;
  let totalSkipped = 0;

  for (const feed of RSS_FEEDS) {
    console.log(`Fetching RSS feed: ${feed.name}...`);

    try {
      const res = await fetch(feed.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        },
      });

      if (!res.ok) {
        console.log(`  Failed to fetch ${feed.name}, skipping.`);
        continue;
      }

      const xml = await res.text();
      const parsed = parser.parse(xml);

      const rawItems =
        feed.format === "atom"
          ? parsed?.feed?.entry
          : parsed?.rss?.channel?.item;

      const itemList = Array.isArray(rawItems)
        ? rawItems
        : rawItems
        ? [rawItems]
        : [];

      console.log(`  Found ${itemList.length} items in ${feed.name}`);

      const provider = await prisma.provider.upsert({
        where: { name: feed.name },
        update: {},
        create: { name: feed.name },
      });

      for (const item of itemList) {
        const title = item.title?.toString().trim();

        let link = "";
        if (feed.format === "atom") {
          const rawLink = item.link?.["@_href"] || item.link || "";
          link = rawLink.startsWith("http")
            ? rawLink
            : `https://www.educanada.ca${rawLink}`;
        } else {
          link = item.link?.toString().trim() || "";
        }

        const description =
          item.content?.toString().trim() ||
          item.description?.toString().trim() ||
          "";

        if (!title || !link) {
          totalSkipped++;
          continue;
        }

        const existing = await prisma.opportunity.findFirst({
          where: { applicationUrl: link },
        });

        if (existing) {
          totalSkipped++;
          continue;
        }

        await prisma.opportunity.create({
          data: {
            title: title.slice(0, 250),
            description: description
              ? description.replace(/<[^>]*>/g, "").slice(0, 1000)
              : "No description provided.",
            providerId: provider.id,
            categoryId: scholarshipsCategory.id,
            fundingType: "NOT_SPECIFIED",
            applicationUrl: link,
            verificationStatus: "VERIFIED",
            publishedAt: item.updated ? new Date(item.updated) : new Date(),
          },
        });

        totalImported++;
      }
    } catch (err) {
      console.log(`  Error fetching ${feed.name}:`, err);
    }
  }

  console.log(
    `Import complete. Imported: ${totalImported}, Skipped: ${totalSkipped}`
  );
}

importScholarshipsRSS()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });