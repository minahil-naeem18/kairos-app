import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const { opportunityId, reason } = await req.json();

  if (!opportunityId || !reason) {
    return NextResponse.json(
      { error: "opportunityId and reason are required." },
      { status: 400 }
    );
  }

  const userId = (session?.user as any)?.id || null;

  // Prevent duplicate reports: same user (or same IP if anonymous) + same opportunity within 24h
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const identifier = userId || `ip:${ip}`;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const existing = await prisma.opportunityReport.findFirst({
    where: {
      opportunityId,
      createdAt: { gte: since },
      ...(userId ? { userId } : {}),
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You've already reported this recently." },
      { status: 429 }
    );
  }

  await prisma.opportunityReport.create({
    data: {
      opportunityId,
      userId,
      reason,
    },
  });

  return NextResponse.json({ success: true });
}