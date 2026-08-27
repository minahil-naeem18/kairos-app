"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    setSubmitted(true);
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
          Forgot Password
        </h1>

        {submitted ? (
          <p className="rounded-md p-3 text-sm" style={{ background: "var(--teal-light)", color: "var(--teal)" }}>
            If an account exists with that email, we've sent a password reset link. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Enter your email and we'll send you a link to reset your password.
            </p>

            {error && (
              <p className="rounded-md p-2 text-sm" style={{ background: "var(--amber-light)", color: "var(--amber)" }}>
                {error}
              </p>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--muted)" }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
              <a href="/login" className="font-medium underline" style={{ color: "var(--primary)" }}>
                Back to Log In
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}