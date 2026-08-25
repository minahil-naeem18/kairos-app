"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "./confirm-modal";

export default function DeleteOpportunityButton({
  opportunityId,
}: {
  opportunityId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch("/api/admin/delete-opportunity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId }),
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
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? "..." : "Delete"}
      </button>

      <ConfirmModal
        open={showConfirm}
        title="Delete opportunity?"
        message="Are you sure you want to delete this opportunity? This action cannot be undone."
        confirmLabel="Delete"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}