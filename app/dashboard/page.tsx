import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatusSelect from "../status-select";
import ApplyButton from "../apply-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const saved = await prisma.savedOpportunity.findMany({
    where: { userId },
    include: {
      opportunity: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const applications = await prisma.application.findMany({
    where: { userId },
  });

  const stats = {
    saved: saved.length,
    applied: applications.filter(
      (a) =>
        a.status === "APPLIED" ||
        a.status === "INTERVIEW" ||
        a.status === "SELECTED" ||
        a.status === "REJECTED"
    ).length,
    interviews: applications.filter(
      (a) => a.status === "INTERVIEW" || a.status === "SELECTED"
    ).length,
    selected: applications.filter((a) => a.status === "SELECTED").length,
  };

  const statusMap = new Map(
    applications.map((a) => [a.opportunityId, a.status])
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome, {session.user.name}
      </h1>
      <p className="mt-2 text-gray-600">
        Track the status of opportunities you've saved.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.saved}</p>
          <p className="text-xs text-gray-500">Saved</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{stats.applied}</p>
          <p className="text-xs text-amber-600">Applied</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">
            {stats.interviews}
          </p>
          <p className="text-xs text-purple-600">Interviews</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">
            {stats.selected}
          </p>
          <p className="text-xs text-green-600">Selected</p>
        </div>
      </div>

      {saved.length === 0 ? (
        <p className="mt-6 text-gray-500">
          You haven't saved any opportunities yet. Go back to the homepage and
          click "Save" on ones you like.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((s) => (
            <div
              key={s.id}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-block w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {s.opportunity.category.name}
                </span>
                <StatusSelect
                  opportunityId={s.opportunity.id}
                  currentStatus={statusMap.get(s.opportunity.id) || "SAVED"}
                />
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                {s.opportunity.title}
              </h2>

              <ApplyButton
                opportunityId={s.opportunity.id}
                applicationUrl={s.opportunity.applicationUrl}
                isLoggedIn={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}