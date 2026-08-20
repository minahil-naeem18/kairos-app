import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResolveReportButton from "./resolve-report-button";
import DeleteOpportunityButton from "./delete-opportunity-button";
import AddOpportunityForm from "./add-opportunity-form";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const reports = await prisma.opportunityReport.findMany({
    where: { resolved: false },
    include: {
      opportunity: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalOpportunities = await prisma.opportunity.count();
  const expiredCount = await prisma.opportunity.count({
    where: { verificationStatus: "EXPIRED" },
  });
  const totalUsers = await prisma.user.count();

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.opportunityCategory.findMany({
    orderBy: { name: "asc" },
  });

  const recentOpportunities = await prisma.opportunity.findMany({
    include: { category: true, provider: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Opportunities</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalOpportunities}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Expired / Hidden</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {expiredCount}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalUsers}
          </p>
        </div>
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold text-gray-900">
        Add New Opportunity
      </h2>
      <AddOpportunityForm categories={categories} />

      <h2 className="mt-10 mb-4 text-lg font-semibold text-gray-900">
        Pending Reports ({reports.length})
      </h2>

      {reports.length === 0 ? (
        <p className="text-gray-500">No pending reports. All clear.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {report.opportunity.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Reason: {report.reason}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Reported by: {report.user?.email || "Anonymous"} on{" "}
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  <a
                    href={report.opportunity.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-indigo-600 underline"
                  >
                    Check link
                  </a>
                </div>
                <div className="flex gap-2">
                  <ResolveReportButton reportId={report.id} />
                  <DeleteOpportunityButton opportunityId={report.opportunity.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 mb-4 text-lg font-semibold text-gray-900">
        Recent Opportunities ({recentOpportunities.length})
      </h2>

      <div className="space-y-2">
        {recentOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{opp.title}</p>
              <p className="text-xs text-gray-500">
                {opp.category.name} · {opp.provider?.name || "Unknown"} ·{" "}
                <span
                  className={
                    opp.verificationStatus === "EXPIRED"
                      ? "text-red-500"
                      : "text-green-600"
                  }
                >
                  {opp.verificationStatus}
                </span>
              </p>
            </div>
            <DeleteOpportunityButton opportunityId={opp.id} />
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold text-gray-900">
        All Users ({allUsers.length})
      </h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allUsers.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 text-gray-900">{u.name || "—"}</td>
                <td className="px-4 py-2 text-gray-700">{u.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.role === "ADMIN"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}