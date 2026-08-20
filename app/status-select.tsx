"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  PREPARING: "Preparing",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  SELECTED: "Selected",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  SAVED: "bg-gray-100 text-gray-700",
  PREPARING: "bg-blue-100 text-blue-700",
  APPLIED: "bg-amber-100 text-amber-700",
  INTERVIEW: "bg-purple-100 text-purple-700",
  SELECTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function StatusSelect({
  opportunityId,
  currentStatus,
}: {
  opportunityId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [showResultChoice, setShowResultChoice] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch("/api/application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, status: newStatus }),
    });
    setStatus(newStatus);
    setLoading(false);
    setShowResultChoice(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
      >
        {STATUS_LABELS[status]}
      </span>

      {status === "APPLIED" && !showResultChoice && (
        <div className="flex gap-1">
          <button
            onClick={() => updateStatus("INTERVIEW")}
            disabled={loading}
            className="rounded-md border border-gray-300 px-2 py-0.5 text-xs text-gray-700 hover:border-gray-900 disabled:opacity-50"
          >
            Got Interview
          </button>
          <button
            onClick={() => setShowResultChoice(true)}
            disabled={loading}
            className="rounded-md border border-gray-300 px-2 py-0.5 text-xs text-gray-700 hover:border-gray-900 disabled:opacity-50"
          >
            Got Result
          </button>
        </div>
      )}

      {status === "INTERVIEW" && (
        <div className="flex gap-1">
          <button
            onClick={() => updateStatus("SELECTED")}
            disabled={loading}
            className="rounded-md border border-gray-300 px-2 py-0.5 text-xs text-gray-700 hover:border-gray-900 disabled:opacity-50"
          >
            Selected
          </button>
          <button
            onClick={() => updateStatus("REJECTED")}
            disabled={loading}
            className="rounded-md border border-gray-300 px-2 py-0.5 text-xs text-gray-700 hover:border-gray-900 disabled:opacity-50"
          >
            Rejected
          </button>
        </div>
      )}

      {showResultChoice && status === "APPLIED" && (
        <div className="flex gap-1">
          <button
            onClick={() => updateStatus("SELECTED")}
            disabled={loading}
            className="rounded-md border border-gray-300 px-2 py-0.5 text-xs text-gray-700 hover:border-gray-900 disabled:opacity-50"
          >
            Selected
          </button>
          <button
            onClick={() => updateStatus("REJECTED")}
            disabled={loading}
            className="rounded-md border border-gray-300 px-2 py-0.5 text-xs text-gray-700 hover:border-gray-900 disabled:opacity-50"
          >
            Rejected
          </button>
        </div>
      )}
    </div>
  );
}