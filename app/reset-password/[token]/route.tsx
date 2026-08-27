"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  const inputStyle = {
    background: "var(--surface-alt)",
    borderColor: "var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="gor-mesh flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-12">
      <div className="gor-glass w-full max-w-sm space-y-4 rounded-2xl p-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Reset Password
        </h1>

        {success ? (
          <p className="rounded-md p-3 text-sm" style={{ background: "var(--teal-light)", color: "var(--teal)" }}>
            Password reset successfully! Redirecting you to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-md p-2 text-sm" style={{ background: "var(--amber-light)", color: "var(--amber)" }}>
                {error}
              </p>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--muted)" }}>New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--muted)" }}>Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: "var(--primary)" }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}