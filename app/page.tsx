import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import SaveButton from "./save-button";
import ApplyButton from "./apply-button";
import ReportButton from "./report-button";
import { calculateMatchScore } from "@/lib/matching";

const PAGE_SIZE = 20;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    degree?: string;
    remote?: string;
    funding?: string;
  }>;
}) {
  const { q, category, page, degree, remote, funding } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1"));
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const categories = await prisma.opportunityCategory.findMany({
    orderBy: { name: "asc" },
  });

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
      degree ? { degreeLevels: { has: degree as any } } : {},
      remote ? { remoteStatus: remote as any } : {},
      funding ? { fundingType: funding as any } : {},
    ],
  };

  const closingSoon = await prisma.opportunity.findMany({
    where: {
      verificationStatus: { not: "EXPIRED" },
      deadline: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
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
    include: {
      category: true,
      provider: true,
    },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const savedIds = userId
    ? (
        await prisma.savedOpportunity.findMany({
          where: { userId },
          select: { opportunityId: true },
        })
      ).map((s) => s.opportunityId)
    : [];

  let recommendations: any[] = [];
  if (userId) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (profile) {
      const candidates = await prisma.opportunity.findMany({
        where: { verificationStatus: { not: "EXPIRED" } },
        include: { category: true, provider: true },
        take: 100,
        orderBy: { publishedAt: "desc" },
      });

      recommendations = candidates
        .map((opp) => ({
          ...opp,
          matchScore: calculateMatchScore(profile, opp),
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);
    }
  }

  function buildPageLink(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (degree) params.set("degree", degree);
    if (remote) params.set("remote", remote);
    if (funding) params.set("funding", funding);
    params.set("page", targetPage.toString());
    return `/?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Find your next opportunity
        </h1>
        <p className="mt-2 text-gray-600">
          Scholarships, internships, and jobs matched for students like you.
        </p>
      </div>

      <form
        method="GET"
        key={`${q || ""}-${degree || ""}-${remote || ""}-${funding || ""}`}
        className="mb-4 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by title or keyword..."
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400"
        />

        <select
          name="degree"
          defaultValue={degree || ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        >
          <option value="">Any Degree Level</option>
          <option value="HIGH_SCHOOL">High School</option>
          <option value="UNDERGRADUATE">Undergraduate</option>
          <option value="MASTERS">Masters</option>
          <option value="PHD">PhD</option>
          <option value="POSTDOC">Postdoc</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          name="remote"
          defaultValue={remote || ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        >
          <option value="">Any Work Type</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ON_SITE">On-site</option>
        </select>

        <select
          name="funding"
          defaultValue={funding || ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        >
          <option value="">Any Funding</option>
          <option value="FULLY_FUNDED">Fully Funded</option>
          <option value="PARTIALLY_FUNDED">Partially Funded</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
        </select>

        {category && <input type="hidden" name="category" value={category} />}

        <button
          type="submit"
          className="rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Search
        </button>
      </form>

      {(degree || remote || funding) && (
        <div className="mb-6">
          <Link href="/" className="text-xs text-gray-500 underline hover:text-gray-700">
            Clear all filters
          </Link>
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/"
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            !category
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${cat.slug}${q ? `&q=${q}` : ""}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              category === cat.slug
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {closingSoon.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            🔴 Closing Soon
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {closingSoon.map((opp) => (
              <div
                key={opp.id}
                className="min-w-[220px] flex-shrink-0 rounded-lg border border-red-200 bg-red-50 p-4"
              >
                <span className="text-xs font-medium text-red-700">
                  {opp.category.name}
                </span>
                <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">
                  {opp.title}
                </h3>
                <p className="mt-2 text-xs text-red-600">
                  Deadline: {new Date(opp.deadline!).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            ✨ Recommended for You
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((opp) => (
              <div
                key={opp.id}
                className="flex flex-col rounded-xl border border-indigo-200 bg-indigo-50 p-5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-block w-fit rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {opp.category.name}
                  </span>
                  <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {opp.matchScore}% Match
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {opp.title}
                </h3>
                {opp.provider && (
                  <p className="text-xs text-gray-500">{opp.provider.name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mb-4 text-sm text-gray-500">
        {totalCount} opportunities found
      </p>

      {opportunities.length === 0 ? (
        <p className="text-gray-500">No opportunities found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-block w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {opp.category.name}
                  </span>
                  <SaveButton
                    opportunityId={opp.id}
                    initialSaved={savedIds.includes(opp.id)}
                    isLoggedIn={!!userId}
                  />
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                  {opp.title}
                </h2>

                {opp.provider && (
                  <p className="text-sm text-gray-500">{opp.provider.name}</p>
                )}

                <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                  {opp.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                  {opp.location && <span>Location: {opp.location}</span>}
                  {opp.fundingType !== "NOT_SPECIFIED" && (
                    <span>Funding: {opp.fundingType.replace(/_/g, " ")}</span>
                  )}
                  {opp.deadline && (
                    <span>
                      Deadline: {new Date(opp.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <ApplyButton
                  opportunityId={opp.id}
                  applicationUrl={opp.applicationUrl}
                  isLoggedIn={!!userId}
                />
                <ReportButton opportunityId={opp.id} />
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={buildPageLink(currentPage - 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:border-gray-900"
              >
                Previous
              </Link>
            )}

            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages && (
              <Link
                href={buildPageLink(currentPage + 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:border-gray-900"
              >
                Next
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}