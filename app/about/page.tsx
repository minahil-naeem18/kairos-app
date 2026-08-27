import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AboutPage() {
  const totalOpportunities = await prisma.opportunity.count({
    where: { verificationStatus: { not: "EXPIRED" } },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1
        className="text-4xl font-bold"
        style={{ color: "var(--foreground)", fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        About Kairos
      </h1>
      <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--muted)" }}>
        Kairos is a global opportunity discovery platform built for students and young professionals.
        We bring together scholarships, internships, and jobs from around the world into one place —
        so you spend less time searching and more time applying.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{totalOpportunities.toLocaleString()}+</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Opportunities listed</p>
        </div>
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--teal)" }}>20+</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Countries covered</p>
        </div>
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--amber)" }}>3</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Categories: Jobs, Internships, Scholarships</p>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-semibold" style={{ color: "var(--foreground)" }}>How it works</h2>
      <div className="mt-4 space-y-4">
        <div className="flex gap-3">
          <span
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--primary)" }}
          >
            1
          </span>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>Browse freely</span> — search
            and explore any opportunity without creating an account, just like browsing any open catalog.
          </p>
        </div>
        <div className="flex gap-3">
  <span
    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
    style={{ background: "var(--primary)" }}
  >
    2
  </span>
  <p className="text-sm" style={{ color: "var(--muted)" }}>
    <span className="font-semibold" style={{ color: "var(--foreground)" }}>Create a free account</span> — required
    to actually apply. Signing up also unlocks saving opportunities, personalized match scores based on your
    field and preferences, an application tracker, and deadline reminders.
  </p>
</div>
        <div className="flex gap-3">
          <span
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--primary)" }}
          >
            3
          </span>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>Apply with confidence</span> — every
            listing links directly to the official application page, and we monitor links to keep the catalog
            accurate.
          </p>
        </div>
      </div>

      <div className="mt-12 flex justify-center gap-3">
        <Link
          href="/signup"
          className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "var(--primary)" }}
        >
          Sign Up Free
        </Link>
        <Link
          href="/"
          className="rounded-full border px-6 py-2.5 text-sm font-semibold transition"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          Browse Opportunities
        </Link>
      </div>
    </div>
  );
}