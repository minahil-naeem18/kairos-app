"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-md border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
        saved
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
      }`}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}