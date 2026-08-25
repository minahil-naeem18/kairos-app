"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "./confirm-modal";

export default function ResolveReportButton({
  reportId,
}: {
  reportId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleResolve() {
    setLoading(true);
    await fetch("/api/admin/resolve-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId }),
    });
    setLoading(false);
    setShowConfirm(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:border-gray-900 disabled:opacity-50"
      >
        {loading ? "..." : "Mark Resolved"}
      </button>

      <ConfirmModal
        open={showConfirm}
        title="Mark report as resolved?"
        message="This will close the report and remove it from the pending list."
        confirmLabel="Mark Resolved"
        loading={loading}
        onConfirm={handleResolve}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}