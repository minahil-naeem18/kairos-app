import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const userId = (session.user as any).id;

  const rateCheck = await checkRateLimit(`admin-action:${userId}`, 60, 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  const { opportunityId } = await req.json();

  await prisma.opportunity.delete({
    where: { id: opportunityId },
  });

  return NextResponse.json({ success: true });
}