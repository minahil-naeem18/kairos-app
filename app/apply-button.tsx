"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

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
  const [applied, setApplied] = useState(false);
function handleClick() {
  if (!isLoggedIn) {
    router.push("/login");
    return;
  }
  window.open(applicationUrl, "_blank", "noopener,noreferrer");
  setShowConfirm(true);
}

  async function markApplied() {
    setLoading(true);
    await fetch("/api/application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, status: "APPLIED" }),
    });
    setLoading(false);
    setApplied(true);

    setTimeout(() => {
      setShowConfirm(false);
      setApplied(false);
      router.refresh();
    }, 900);
  }

  return (
    <div>
      <button
  onClick={handleClick}
  className="rounded-full px-5 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
  style={{ background: "var(--primary)" }}
>
  {isLoggedIn ? "View & Apply" : "🔒 Log In to Apply"}
</button>

      {showConfirm && (
        <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700">
          <p className="mb-2">Did you apply for this opportunity?</p>
          <div className="flex gap-2">
            <button
              onClick={markApplied}
              disabled={loading || applied}
              className="rounded-md bg-gray-900 px-2 py-1 text-white disabled:opacity-50"
            >
              <AnimatePresence mode="wait" initial={false}>
                {applied ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1"
                  >
                    ✓ Applied
                  </motion.span>
                ) : loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1"
                  >
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Applying...
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Yes, mark as Applied
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading || applied}
              className="rounded-md border border-gray-300 px-2 py-1 text-gray-700 disabled:opacity-50"
            >
              Not yet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}