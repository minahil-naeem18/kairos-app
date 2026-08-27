"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

        const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Something went wrong.");
      return;
    }

    // Automatically log in after successful signup
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      // Fallback: account created but auto-login failed, send to login page
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }
  const inputStyle = {
    background: "var(--surface-alt)",
    borderColor: "var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="gor-mesh flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="gor-glass w-full max-w-sm space-y-4 rounded-2xl p-8"
      >
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Create your account
        </h1>

        {error && (
          <p className="rounded-md p-2 text-sm" style={{ background: "var(--amber-light)", color: "var(--amber)" }}>
            {error}
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--muted)" }}>Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
        </div>

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

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--muted)" }}>Password</label>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
          Already have an account?{" "}
          <a href="/login" className="font-medium underline" style={{ color: "var(--primary)" }}>
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}