"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./theme-provider";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="sticky top-3 z-50 px-4">
      <header className="gor-glass relative mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-2.5 shadow-sm">
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

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-8 w-8 flex-col items-center justify-center gap-1 sm:hidden"
          >
            <span
              className="h-0.5 w-5 rounded-full transition-all duration-200"
              style={{
                background: "var(--foreground)",
                transform: mobileMenuOpen ? "translateY(6px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="h-0.5 w-5 rounded-full transition-all duration-200"
              style={{
                background: "var(--foreground)",
                opacity: mobileMenuOpen ? 0 : 1,
              }}
            />
            <span
              className="h-0.5 w-5 rounded-full transition-all duration-200"
              style={{
                background: "var(--foreground)",
                transform: mobileMenuOpen ? "translateY(-6px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </nav>

        {/* Mobile dropdown panel */}
        {mobileMenuOpen && (
          <div
            className="gor-glass absolute left-0 right-0 top-full mt-2 flex flex-col gap-1 rounded-2xl p-3 shadow-sm sm:hidden"
          >
            <Link
              href="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{ color: "var(--muted)" }}
            >
              Explore Map
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{ color: "var(--muted)" }}
            >
              About
            </Link>
            {session?.user && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium"
                  style={{ color: "var(--muted)" }}
                >
                  Dashboard
                </Link>
                {(session.user as any).role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium"
                    style={{ color: "var(--amber)" }}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium"
                  style={{ color: "var(--muted)" }}
                >
                  Profile
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    </div>
  );
}