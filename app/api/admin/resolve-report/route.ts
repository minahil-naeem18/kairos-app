import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { reportId } = await req.json();

  await prisma.opportunityReport.update({
    where: { id: reportId },
    data: { resolved: true },
  });

  return NextResponse.json({ success: true });
}