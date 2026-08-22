import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatusSelect from "../status-select";
import ApplyButton from "../apply-button";
import Link from "next/link";

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  Jobs: { color: "var(--cat-jobs)", bg: "var(--cat-jobs-bg)" },
  Internships: { color: "var(--cat-internships)", bg: "var(--cat-internships-bg)" },
  Scholarships: { color: "var(--cat-scholarships)", bg: "var(--cat-scholarships-bg)" },
};
function catStyle(name: string) {
  return CATEGORY_STYLES[name] || { color: "var(--primary)", bg: "var(--surface-alt)" };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const saved = await prisma.savedOpportunity.findMany({
    where: { userId },
    include: { opportunity: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  const applications = await prisma.application.findMany({ where: { userId } });
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });

  const stats = {
    saved: saved.length,
    applied: applications.filter((a) => ["APPLIED", "INTERVIEW", "SELECTED", "REJECTED"].includes(a.status)).length,
    interviews: applications.filter((a) => ["INTERVIEW", "SELECTED"].includes(a.status)).length,
    selected: applications.filter((a) => a.status === "SELECTED").length,
  };

  const statusMap = new Map(applications.map((a) => [a.opportunityId, a.status]));

  const upcomingDeadlines = saved
    .filter((s) => s.opportunity.deadline && new Date(s.opportunity.deadline) > new Date())
    .sort((a, b) => new Date(a.opportunity.deadline!).getTime() - new Date(b.opportunity.deadline!).getTime())
    .slice(0, 5);

  const profileFields = [
    profile?.displayName, profile?.country, profile?.degreeLevel, profile?.degreeProgram,
    profile?.university, profile?.fieldId, profile?.skills?.length ? "yes" : null, profile?.fundingPreference,
  ];
  const filledCount = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((filledCount / profileFields.length) * 100);

  return (
    <div>
      <div className="gor-mesh px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>
            Welcome back, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Here's how your opportunity journey is going.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="gor-glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{stats.saved}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Saved</p>
            </div>
            <div className="gor-glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--amber)" }}>{stats.applied}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Applied</p>
            </div>
            <div className="gor-glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--cat-scholarships)" }}>{stats.interviews}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Interviews</p>
            </div>
            <div className="gor-glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--teal)" }}>{stats.selected}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Selected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Profile Completion</h2>
              <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>{profileCompletion}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-alt)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${profileCompletion}%`, background: "linear-gradient(90deg, var(--primary), var(--teal))" }}
              />
            </div>
            {profileCompletion < 100 && (
              <Link href="/profile" className="mt-3 inline-block text-xs underline" style={{ color: "var(--primary)" }}>
                Complete your profile for better matches →
              </Link>
            )}
          </div>

          <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--foreground)" }}>Upcoming Deadlines</h2>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--muted)" }}>No upcoming deadlines among your saved opportunities.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingDeadlines.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-xs">
                    <span className="line-clamp-1" style={{ color: "var(--foreground)" }}>{s.opportunity.title}</span>
                    <span className="ml-2 whitespace-nowrap font-medium" style={{ color: "var(--amber)" }}>
                      {new Date(s.opportunity.deadline!).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <h2 className="mt-10 mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>Your Saved Opportunities</h2>

        {saved.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            You haven't saved any opportunities yet. Go back to the homepage and click "Save" on ones you like.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((s) => {
              const style = catStyle(s.opportunity.category.name);
              return (
                <div
                  key={s.id}
                  className="flex flex-col rounded-xl border-l-4 border-y border-r p-5"
                  style={{ borderColor: "var(--border)", borderLeftColor: style.color, background: "var(--surface)" }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: style.bg, color: style.color }}>
                      {s.opportunity.category.name}
                    </span>
                    <StatusSelect opportunityId={s.opportunity.id} currentStatus={statusMap.get(s.opportunity.id) || "SAVED"} />
                  </div>
                  <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>{s.opportunity.title}</h2>
                  <ApplyButton opportunityId={s.opportunity.id} applicationUrl={s.opportunity.applicationUrl} isLoggedIn={true} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}