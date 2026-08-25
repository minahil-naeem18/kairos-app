"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div
      className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6"
      style={{ background: "var(--background)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border p-8 shadow-sm"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h1 className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
          Log in
        </h1>

        {error && (
          <p className="rounded-md p-2 text-sm" style={{ background: "var(--amber-light)", color: "var(--amber)" }}>
            {error}
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--muted)" }}>
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--surface-alt)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "var(--muted)" }}>
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--surface-alt)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        <button
  type="submit"
  disabled={loading}
  className="w-full rounded-lg py-2 text-sm font-medium text-white transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50"
  style={{ background: "var(--primary)" }}
>
  {loading ? "Logging in..." : "Log In"}
</button>

        <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
          Don't have an account?{" "}
          <a href="/signup" className="font-medium underline" style={{ color: "var(--primary)" }}>
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}