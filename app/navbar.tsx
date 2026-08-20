"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            GOR
          </Link>
          <Link href="/map" className="text-sm text-gray-600 hover:text-gray-900">
            Map
          </Link>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          {status === "loading" ? null : session?.user ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              {(session.user as any).role === "ADMIN" && (
                <Link href="/admin" className="text-red-600 hover:text-red-800">
                  Admin
                </Link>
              )}
              <Link href="/profile" className="text-gray-700 hover:text-gray-900">
                Profile
              </Link>
              <span className="text-gray-500">
                Hi, {session.user.name?.split(" ")[0] || session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-800"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-gray-900">
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}