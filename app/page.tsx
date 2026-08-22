import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import SaveButton from "./save-button";
import ApplyButton from "./apply-button";
import ReportButton from "./report-button";
import { calculateMatchScore, getMatchReasons } from "@/lib/matching";
import MatchRing from "./match-ring";
import { mapToCountry } from "@/lib/countries";

const PAGE_SIZE = 40;

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  Jobs: { color: "var(--cat-jobs)", bg: "var(--cat-jobs-bg)" },
  Internships: { color: "var(--cat-internships)", bg: "var(--cat-internships-bg)" },
  Scholarships: { color: "var(--cat-scholarships)", bg: "var(--cat-scholarships-bg)" },
};

function catStyle(name: string) {
  return CATEGORY_STYLES[name] || { color: "var(--primary)", bg: "var(--surface-alt)" };
}

function timeAgo(date: Date) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Date(date).toLocaleDateString();
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q, category, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1"));
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const categories = await prisma.opportunityCategory.findMany({ orderBy: { name: "asc" } });
  const totalOpportunities = await prisma.opportunity.count({ where: { verificationStatus: { not: "EXPIRED" } } });

  const whereClause = {
    AND: [
      { verificationStatus: { not: "EXPIRED" as const } },
      q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
      category ? { category: { slug: category } } : {},
    ],
  };

  const closingSoon = await prisma.opportunity.findMany({
    where: {
      verificationStatus: { not: "EXPIRED" },
      deadline: { gte: new Date(), lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { deadline: "asc" },
    include: { category: true },
    take: 6,
  });

  const totalCount = await prisma.opportunity.count({ where: whereClause });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const opportunities = await prisma.opportunity.findMany({
    where: whereClause,
    orderBy: { publishedAt: "desc" },
    include: { category: true, provider: true },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const savedIds = userId
    ? (await prisma.savedOpportunity.findMany({ where: { userId }, select: { opportunityId: true } })).map((s) => s.opportunityId)
    : [];

  let recommendations: any[] = [];
  if (userId) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (profile) {
      const candidates = await prisma.opportunity.findMany({
        where: { verificationStatus: { not: "EXPIRED" } },
        include: { category: true, provider: true, field: true },
        take: 150,
        orderBy: { publishedAt: "desc" },
      });
      recommendations = candidates
        .map((opp) => ({ ...opp, matchScore: calculateMatchScore(profile, opp), matchReasons: getMatchReasons(profile, opp) }))
        .filter((opp) => opp.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);
    }
  }

  const trendingGroups = await prisma.savedOpportunity.groupBy({
    by: ["opportunityId"],
    _count: { opportunityId: true },
    orderBy: { _count: { opportunityId: "desc" } },
    take: 6,
  });
  let trending: any[] = [];
  if (trendingGroups.length > 0) {
    const trendingIds = trendingGroups.map((t) => t.opportunityId);
    const trendingOpps = await prisma.opportunity.findMany({
      where: { id: { in: trendingIds }, verificationStatus: { not: "EXPIRED" } },
      include: { category: true, provider: true },
    });
    trending = trendingIds
      .map((id) => trendingOpps.find((o) => o.id === id))
      .filter(Boolean)
      .map((opp, i) => ({ ...opp, saveCount: trendingGroups[i]?._count.opportunityId || 0 }));
  }

  const recentlyAdded = await prisma.opportunity.findMany({
    where: { verificationStatus: { not: "EXPIRED" } },
    orderBy: { createdAt: "desc" },
    include: { category: true, provider: true },
    take: 6,
  });

  const allLocations = await prisma.opportunity.findMany({
    where: { verificationStatus: { not: "EXPIRED" }, location: { not: null } },
    select: { location: true },
  });
  const countryCounts: Record<string, number> = {};
  for (const o of allLocations) {
    if (!o.location) continue;
    const c = mapToCountry(o.location);
    if (c) countryCounts[c] = (countryCounts[c] || 0) + 1;
  }
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  function buildPageLink(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    params.set("page", targetPage.toString());
    return `/?${params.toString()}`;
  }

  return (
    <div>
      {/* HERO */}
      <div className="gor-mesh px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span
            className="gor-glass mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold"
            style={{ color: "var(--primary)" }}
          >
            🌍 {totalOpportunities.toLocaleString()}+ opportunities · {Object.keys(countryCounts).length}+ countries
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--foreground)" }}>
            Find your next{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--teal))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              global opportunity
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: "var(--muted)" }}>
            Scholarships, internships, and jobs from around the world — matched to your field, funding needs, and goals.
          </p>

          <form method="GET" className="mx-auto mt-8 flex max-w-xl gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by title, field, or keyword..."
              className="gor-glass flex-1 rounded-full px-5 py-3 text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
            {category && <input type="hidden" name="category" value={category} />}
            <button
              type="submit"
              className="rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{ background: "var(--primary)" }}
            >
              Search
            </button>
          </form>

          <Link href="/map" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--teal)" }}>
            🧭 Explore the Opportunity Radar map →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* CATEGORY TILES */}
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Link
            href="/"
            className="rounded-xl border p-4 text-sm font-semibold transition hover:shadow-sm"
            style={{
              borderColor: !category ? "var(--primary)" : "var(--border)",
              background: !category ? "var(--surface-alt)" : "var(--surface)",
              color: "var(--foreground)",
            }}
          >
            All Opportunities
          </Link>
          {categories.map((cat) => {
            const style = catStyle(cat.name);
            return (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className="rounded-xl border p-4 text-sm font-semibold transition hover:shadow-sm"
                style={{
                  borderColor: category === cat.slug ? style.color : "var(--border)",
                  background: category === cat.slug ? style.bg : "var(--surface)",
                  color: category === cat.slug ? style.color : "var(--foreground)",
                }}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* EXPLORE BY COUNTRY */}
        {topCountries.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>Explore by Country</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {topCountries.map(([country, count]) => (
                <Link
                  key={country}
                  href={`/map?country=${encodeURIComponent(country)}`}
                  className="rounded-xl border p-4 transition hover:shadow-sm"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{country}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{count} opportunities</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CLOSING SOON */}
        {closingSoon.length > 0 && (
          <div className="mb-12">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--amber)" }} />
              <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Closing Soon</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {closingSoon.map((opp) => (
                <div
                  key={opp.id}
                  className="min-w-[240px] flex-shrink-0 rounded-xl border p-4"
                  style={{ borderColor: "var(--amber)", background: "var(--amber-light)" }}
                >
                  <span className="text-xs font-medium" style={{ color: "var(--amber)" }}>{opp.category.name}</span>
                  <h3 className="mt-1 text-sm font-semibold line-clamp-2" style={{ color: "var(--foreground)" }}>{opp.title}</h3>
                  <p className="mt-2 text-xs font-medium" style={{ color: "var(--amber)" }}>
                    Deadline: {new Date(opp.deadline!).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECOMMENDED */}
        {recommendations.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>✨ Recommended for You</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((opp) => (
                <div
                  key={opp.id}
                  className="flex gap-4 rounded-xl border p-5"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <MatchRing score={opp.matchScore} />
                  <div className="min-w-0 flex-1">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ background: catStyle(opp.category.name).bg, color: catStyle(opp.category.name).color }}
                    >
                      {opp.category.name}
                    </span>
                    <h3 className="mt-1 text-sm font-semibold line-clamp-2" style={{ color: "var(--foreground)" }}>{opp.title}</h3>
                    {opp.matchReasons.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {opp.matchReasons.slice(0, 3).map((reason: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ background: "var(--surface-alt)", color: "var(--muted)" }}
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRENDING GLOBALLY */}
        {trending.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>🔥 Trending Globally</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {trending.map((opp) => (
                <div
                  key={opp.id}
                  className="min-w-[240px] flex-shrink-0 rounded-xl border p-4"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: catStyle(opp.category.name).bg, color: catStyle(opp.category.name).color }}
                  >
                    {opp.category.name}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold line-clamp-2" style={{ color: "var(--foreground)" }}>{opp.title}</h3>
                  <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>🔥 Saved {opp.saveCount}x by students</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECENTLY ADDED */}
        {recentlyAdded.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>🆕 Recently Added</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentlyAdded.map((opp) => (
                <div
                  key={opp.id}
                  className="min-w-[240px] flex-shrink-0 rounded-xl border p-4"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: catStyle(opp.category.name).bg, color: catStyle(opp.category.name).color }}
                  >
                    {opp.category.name}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold line-clamp-2" style={{ color: "var(--foreground)" }}>{opp.title}</h3>
                  <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>{timeAgo(opp.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>{totalCount} opportunities found</p>

        {opportunities.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No opportunities found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opp) => {
                const style = catStyle(opp.category.name);
                return (
                  <div
                    key={opp.id}
                    className="flex flex-col rounded-xl border-l-4 border-y border-r p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: "var(--border)", borderLeftColor: style.color, background: "var(--surface)" }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: style.bg, color: style.color }}>
                        {opp.category.name}
                      </span>
                      <SaveButton opportunityId={opp.id} initialSaved={savedIds.includes(opp.id)} isLoggedIn={!!userId} />
                    </div>

                    <Link href={`/opportunity/${opp.id}`}>
                      <h2 className="text-lg font-semibold transition hover:opacity-70" style={{ color: "var(--foreground)" }}>{opp.title}</h2>
                    </Link>
                    {opp.provider && <p className="text-sm" style={{ color: "var(--muted)" }}>{opp.provider.name}</p>}
                    <p className="mt-2 line-clamp-3 text-sm" style={{ color: "var(--muted)" }}>{opp.description}</p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs" style={{ color: "var(--muted)" }}>
                      {opp.location && <span>📍 {opp.location}</span>}
                      {opp.fundingType !== "NOT_SPECIFIED" && <span>💰 {opp.fundingType.replace(/_/g, " ")}</span>}
                      {opp.deadline && <span>⏰ {new Date(opp.deadline).toLocaleDateString()}</span>}
                    </div>

                    <ApplyButton opportunityId={opp.id} applicationUrl={opp.applicationUrl} isLoggedIn={!!userId} />
                    <ReportButton opportunityId={opp.id} />
                  </div>
                );
              })}
            </div>

            {currentPage < totalPages && (
              <div className="mt-10 flex justify-center">
                <Link
                  href={buildPageLink(currentPage + 1)}
                  className="rounded-full border px-8 py-2.5 text-sm font-medium transition hover:shadow-sm"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--surface)" }}
                >
                  Load More
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}