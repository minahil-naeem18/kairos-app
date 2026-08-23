"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoleToggleButton({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleRole() {
    const newRole = currentRole === "ADMIN" ? "STUDENT" : "ADMIN";
    if (!confirm(`Make this user ${newRole}?`)) return;

    setLoading(true);
    await fetch("/api/admin/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggleRole}
      disabled={loading}
      className="rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50"
      style={{
        border: "1px solid var(--border)",
        color: currentRole === "ADMIN" ? "var(--muted)" : "var(--amber)",
      }}
    >
      {loading ? "..." : currentRole === "ADMIN" ? "Remove Admin" : "Make Admin"}
    </button>
  );
}