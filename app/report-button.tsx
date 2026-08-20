"use client";

import { useState } from "react";

export default function ReportButton({
  opportunityId,
}: {
  opportunityId: string;
}) {
  const [reported, setReported] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReport() {
    setLoading(true);
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunityId,
        reason: "Broken or expired link",
      }),
    });
    setLoading(false);
    setReported(true);
  }

  if (reported) {
    return <p className="mt-1 text-xs text-gray-400">Reported. Thank you.</p>;
  }

  return (
    <button
      onClick={handleReport}
      disabled={loading}
      className="mt-1 text-xs text-gray-400 underline hover:text-gray-600 disabled:opacity-50"
    >
      Report broken link
    </button>
  );
}