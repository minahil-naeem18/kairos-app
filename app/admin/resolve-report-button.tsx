"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResolveReportButton({
  reportId,
}: {
  reportId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleResolve() {
    setLoading(true);
    await fetch("/api/admin/resolve-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleResolve}
      disabled={loading}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:border-gray-900 disabled:opacity-50"
    >
      {loading ? "..." : "Mark Resolved"}
    </button>
  );
}