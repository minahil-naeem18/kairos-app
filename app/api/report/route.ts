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

  await prisma.opportunityReport.create({
    data: {
      opportunityId,
      userId: (session?.user as any)?.id || null,
      reason,
    },
  });

  return NextResponse.json({ success: true });
}