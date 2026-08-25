"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyButton({
  opportunityId,
  applicationUrl,
  isLoggedIn,
}: {
  opportunityId: string;
  applicationUrl: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleClick() {
    window.open(applicationUrl, "_blank", "noopener,noreferrer");
    if (isLoggedIn) {
      setShowConfirm(true);
    }
  }

  async function markApplied() {
    setLoading(true);
    await fetch("/api/application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, status: "APPLIED" }),
    });
    setLoading(false);
    setShowConfirm(false);
    router.refresh();
  }

  return (
        <div>
      <button
        onClick={handleClick}
        className="rounded-full px-5 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
        style={{ background: "var(--primary)" }}
      >
        View & Apply
      </button>

      {showConfirm && (
        <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700">
          <p className="mb-2">Did you apply for this opportunity?</p>
          <div className="flex gap-2">
            <button
              onClick={markApplied}
              disabled={loading}
              className="rounded-md bg-gray-900 px-2 py-1 text-white disabled:opacity-50"
            >
              Yes, mark as Applied
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="rounded-md border border-gray-300 px-2 py-1 text-gray-700"
            >
              Not yet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}