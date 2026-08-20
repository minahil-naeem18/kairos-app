import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { opportunityId } = await req.json();

  if (!opportunityId) {
    return NextResponse.json(
      { error: "opportunityId is required." },
      { status: 400 }
    );
  }

  const existing = await prisma.savedOpportunity.findUnique({
    where: {
      userId_opportunityId: {
        userId: (session.user as any).id,
        opportunityId,
      },
    },
  });

  if (existing) {
    // Already saved -> unsave it
    await prisma.savedOpportunity.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.savedOpportunity.create({
      data: {
        userId: (session.user as any).id,
        opportunityId,
      },
    });
    return NextResponse.json({ saved: true });
  }
}