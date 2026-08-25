"use client";

import { useState } from "react";

export default function ReportButton({
  opportunityId,
}: {
  opportunityId: string;
}) {
  const [reported, setReported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReport() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunityId,
        reason: "Broken or expired link",
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    setReported(true);
  }

  if (reported) {
    return (
      <p className="mt-2 text-xs font-medium" style={{ color: "var(--teal)" }}>
        ✓ Reported. Thank you.
      </p>
    );
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleReport}
        disabled={loading}
        className="rounded-full border px-3 py-1.5 text-xs font-medium transition hover:shadow-sm disabled:opacity-50"
        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "var(--muted)", borderTopColor: "transparent" }}
            />
            Reporting...
          </span>
        ) : (
          "🚩 Report broken link"
        )}
      </button>
      {error && (
        <p className="mt-1 text-xs" style={{ color: "var(--amber)" }}>{error}</p>
      )}
    </div>
  );
}