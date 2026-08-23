import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResolveReportButton from "./resolve-report-button";
import DeleteOpportunityButton from "./delete-opportunity-button";
import AddOpportunityForm from "./add-opportunity-form";
import RoleToggleButton from "./role-toggle-button";
export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/");

  const reports = await prisma.opportunityReport.findMany({
    where: { resolved: false },
    include: { opportunity: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  const totalOpportunities = await prisma.opportunity.count();
  const expiredCount = await prisma.opportunity.count({ where: { verificationStatus: "EXPIRED" } });
  const totalUsers = await prisma.user.count();

  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.opportunityCategory.findMany({ orderBy: { name: "asc" } });

  const recentOpportunities = await prisma.opportunity.findMany({
    include: { category: true, provider: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <div className="gor-mesh px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>Admin Panel</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Manage opportunities, reports, and users.</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="gor-glass rounded-xl p-5">
              <p className="text-sm" style={{ color: "var(--muted)" }}>Total Opportunities</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: "var(--foreground)" }}>{totalOpportunities}</p>
            </div>
            <div className="gor-glass rounded-xl p-5">
              <p className="text-sm" style={{ color: "var(--muted)" }}>Expired / Hidden</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: "var(--amber)" }}>{expiredCount}</p>
            </div>
            <div className="gor-glass rounded-xl p-5">
              <p className="text-sm" style={{ color: "var(--muted)" }}>Total Users</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: "var(--teal)" }}>{totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>Add New Opportunity</h2>
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <AddOpportunityForm categories={categories} />
        </div>

        <h2 className="mt-10 mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Pending Reports ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No pending reports. All clear.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium" style={{ color: "var(--foreground)" }}>{report.opportunity.title}</h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Reason: {report.reason}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                      Reported by: {report.user?.email || "Anonymous"} on {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    <a
                      href={report.opportunity.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs underline"
                      style={{ color: "var(--primary)" }}
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

        <h2 className="mt-10 mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Recent Opportunities ({recentOpportunities.length})
        </h2>

        <div className="space-y-2">
          {recentOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="flex items-center justify-between rounded-lg border p-3"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{opp.title}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {opp.category.name} · {opp.provider?.name || "Unknown"} ·{" "}
                  <span style={{ color: opp.verificationStatus === "EXPIRED" ? "var(--amber)" : "var(--teal)" }}>
                    {opp.verificationStatus}
                  </span>
                </p>
              </div>
              <DeleteOpportunityButton opportunityId={opp.id} />
            </div>
          ))}
        </div>

        <h2 className="mt-10 mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          All Users ({allUsers.length})
        </h2>

        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
          <table className="min-w-full divide-y text-sm" style={{ background: "var(--surface)" }}>
            <thead>
              <tr className="text-left" style={{ color: "var(--muted)" }}>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
                            <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {allUsers.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2" style={{ color: "var(--foreground)" }}>{u.name || "—"}</td>
                  <td className="px-4 py-2" style={{ color: "var(--muted)" }}>{u.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        background: u.role === "ADMIN" ? "var(--amber-light)" : "var(--surface-alt)",
                        color: u.role === "ADMIN" ? "var(--amber)" : "var(--muted)",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                                   <td className="px-4 py-2" style={{ color: "var(--muted)" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <RoleToggleButton userId={u.id} currentRole={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}