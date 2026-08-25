"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./theme-provider";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="sticky top-3 z-50 px-4">
      <header className="gor-glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-2.5 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
                                                <Image src="/logo/kairos-icon.png" alt="Kairos" width={32} height={32} className="h-8 w-8 rounded-md object-contain" />
            <span className="text-lg font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
              Kairos
            </span>
          </Link>
                   <Link href="/map" className="group relative hidden text-sm font-medium sm:block" style={{ color: "var(--muted)" }}>
            Explore Map
            <span
              className="absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-200 group-hover:w-full"
              style={{ background: "var(--primary)" }}
            />
          </Link>
                              <Link href="/about" className="group relative hidden text-sm font-medium sm:block" style={{ color: "var(--muted)" }}>
            About
            <span
              className="absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-200 group-hover:w-full"
              style={{ background: "var(--primary)" }}
            />
          </Link>
        </div>

        <nav className="flex items-center gap-3 text-sm">
                   <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {status === "loading" ? null : session?.user ? (
            <>
              <Link href="/dashboard" className="hidden font-medium sm:block" style={{ color: "var(--muted)" }}>
                Dashboard
              </Link>
              {(session.user as any).role === "ADMIN" && (
                <Link href="/admin" className="hidden font-medium sm:block" style={{ color: "var(--amber)" }}>
                  Admin
                </Link>
              )}
              <Link href="/profile" className="hidden font-medium sm:block" style={{ color: "var(--muted)" }}>
                Profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                                className="rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                style={{ background: "var(--primary)" }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="font-medium" style={{ color: "var(--muted)" }}>
                Log In
              </Link>
              <Link
                href="/signup"
                               className="rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                style={{ background: "var(--primary)" }}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>
    </div>
  );
}