"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SaveButton({
  opportunityId,
  initialSaved,
  isLoggedIn,
}: {
  opportunityId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  async function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSaved(data.saved);
      router.refresh();

      if (data.saved) {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 400);
      }
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={loading}
      animate={{ scale: justSaved ? [1, 1.25, 1] : 1 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      whileTap={{ scale: 0.9 }}
      className={`rounded-md border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
        saved
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
      }`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Saving...
        </span>
      ) : saved ? (
        "Saved"
      ) : (
        "Save"
      )}
    </motion.button>
  );
}