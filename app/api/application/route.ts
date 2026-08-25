import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { opportunityId, status } = await req.json();

  if (!opportunityId || !status) {
    return NextResponse.json(
      { error: "opportunityId and status are required." },
      { status: 400 }
    );
  }

  const userId = (session.user as any).id;

  const rateCheck = await checkRateLimit(`application:${userId}`, 20, 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  const application = await prisma.application.upsert({
    where: {
      userId_opportunityId: {
        userId,
        opportunityId,
      },
    },
    update: {
      status,
      appliedAt: status === "APPLIED" ? new Date() : undefined,
    },
    create: {
      userId,
      opportunityId,
      status,
      appliedAt: status === "APPLIED" ? new Date() : null,
    },
  });

  return NextResponse.json(application);
}