import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import SaveButton from "@/app/save-button";
import ApplyButton from "@/app/apply-button";
import ReportButton from "@/app/report-button";
import MatchRing from "@/app/match-ring";
import { calculateMatchScore, getMatchReasons } from "@/lib/matching";

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  Jobs: { color: "var(--cat-jobs)", bg: "var(--cat-jobs-bg)" },
  Internships: { color: "var(--cat-internships)", bg: "var(--cat-internships-bg)" },
  Scholarships: { color: "var(--cat-scholarships)", bg: "var(--cat-scholarships-bg)" },
};

function catStyle(name: string) {
  return CATEGORY_STYLES[name] || { color: "var(--primary)", bg: "var(--surface-alt)" };
}

function daysUntil(date: Date) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const opp = await prisma.opportunity.findUnique({
    where: { id },
    include: { category: true, provider: true, field: true, subfield: true },
  });

  if (!opp) notFound();

  const isSaved = userId
    ? !!(await prisma.savedOpportunity.findUnique({
        where: { userId_opportunityId: { userId, opportunityId: opp.id } },
      }))
    : false;

  let matchScore: number | null = null;
  let matchReasons: string[] = [];
  if (userId) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (profile) {
      matchScore = calculateMatchScore(profile, opp);
      matchReasons = getMatchReasons(profile, opp);
    }
  }

  const related = await prisma.opportunity.findMany({
    where: {
      categoryId: opp.categoryId,
      id: { not: opp.id },
      verificationStatus: { not: "EXPIRED" },
    },
    include: { category: true, provider: true },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  const style = catStyle(opp.category.name);
  const daysLeft = opp.deadline ? daysUntil(opp.deadline) : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
           <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition hover:shadow-sm"
        style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--surface)" }}
      >
        ← Back to all opportunities
      </Link>
      {/* HEADER */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: style.bg, color: style.color }}
          >
            {opp.category.name}
          </span>
          <h1 className="mt-3 text-3xl font-bold leading-tight" style={{ color: "var(--foreground)" }}>
            {opp.title}
          </h1>
          {opp.provider && (
            <p className="mt-1 text-base" style={{ color: "var(--muted)" }}>
              {opp.provider.name}
            </p>
          )}
        </div>
        {matchScore !== null && matchScore > 0 && <MatchRing score={matchScore} />}
      </div>

      {matchReasons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {matchReasons.map((reason, i) => (
            <span
              key={i}
              className="rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ background: "var(--surface-alt)", color: "var(--muted)" }}
            >
              ✓ {reason}
            </span>
          ))}
        </div>
      )}

      {/* DEADLINE URGENCY */}
      {daysLeft !== null && daysLeft >= 0 && daysLeft <= 14 && (
        <div
          className="mt-5 rounded-lg border px-4 py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--amber)", background: "var(--amber-light)", color: "var(--amber)" }}
        >
          ⏰ {daysLeft === 0 ? "Closing today" : daysLeft === 1 ? "Closing tomorrow" : `Closing in ${daysLeft} days`}
        </div>
      )}

      {/* KEY FACTS */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {opp.location && (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Location</p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--foreground)" }}>{opp.location}</p>
          </div>
        )}
        {opp.fundingType !== "NOT_SPECIFIED" && (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Funding</p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {opp.fundingType.replace(/_/g, " ")}
            </p>
          </div>
        )}
        {opp.salary && (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Salary</p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--foreground)" }}>{opp.salary}</p>
          </div>
        )}
        {opp.deadline && (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Deadline</p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {new Date(opp.deadline).toLocaleDateString()}
            </p>
          </div>
        )}
        {opp.duration && (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Duration</p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--foreground)" }}>{opp.duration}</p>
          </div>
        )}
        {opp.remoteStatus !== "NOT_SPECIFIED" && (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Work Type</p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {opp.remoteStatus.replace(/_/g, " ")}
            </p>
          </div>
        )}
        {opp.degreeLevels.length > 0 && (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Degree Level</p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {opp.degreeLevels.map((d) => d.replace(/_/g, " ")).join(", ")}
            </p>
          </div>
        )}
        {opp.field && (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Field</p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--foreground)" }}>{opp.field.name}</p>
          </div>
        )}
      </div>

      {/* DESCRIPTION */}
      <div className="mt-8">
        <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--foreground)" }}>About this opportunity</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          {opp.description || "No description provided."}
        </p>
      </div>

      {opp.requirements && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--foreground)" }}>Requirements</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {opp.requirements}
          </p>
        </div>
      )}

      {opp.eligibleCountries.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--foreground)" }}>Eligible Countries</h2>
          <div className="flex flex-wrap gap-1.5">
            {opp.eligibleCountries.map((c) => (
              <span
                key={c}
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: "var(--surface-alt)", color: "var(--foreground)" }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {opp.skills.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--foreground)" }}>Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {opp.skills.map((s) => (
              <span
                key={s}
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: "var(--surface-alt)", color: "var(--foreground)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* APPLY */}
      <div
        className="mt-10 flex flex-col items-start gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "var(--primary)", background: "var(--surface-alt)" }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Ready to apply?</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>You'll be redirected to the official application page.</p>
        </div>
               <div className="flex items-stretch gap-2">
          <div className="flex items-center">
            <SaveButton opportunityId={opp.id} initialSaved={isSaved} isLoggedIn={!!userId} />
          </div>
          <ApplyButton opportunityId={opp.id} applicationUrl={opp.applicationUrl} isLoggedIn={!!userId} />
        </div>
      </div>
      <ReportButton opportunityId={opp.id} />

      {/* RELATED */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>Similar Opportunities</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/opportunity/${r.id}`}
                className="rounded-xl border p-4 transition hover:shadow-sm"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: catStyle(r.category.name).bg, color: catStyle(r.category.name).color }}
                >
                  {r.category.name}
                </span>
                <h3 className="mt-1 text-sm font-semibold line-clamp-2" style={{ color: "var(--foreground)" }}>
                  {r.title}
                </h3>
                {r.provider && <p className="text-xs" style={{ color: "var(--muted)" }}>{r.provider.name}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}