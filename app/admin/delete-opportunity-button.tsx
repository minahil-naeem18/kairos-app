"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteOpportunityButton({
  opportunityId,
}: {
  opportunityId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;

    setLoading(true);
    await fetch("/api/admin/delete-opportunity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}