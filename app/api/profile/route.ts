import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();

  const {
    displayName,
    country,
    degreeLevel,
    degreeProgram,
    university,
    academicYear,
    graduationYear,
    skills,
    researchInterests,
    fundingPreference,
    remotePreference,
  } = body;

  const profile = await prisma.studentProfile.upsert({
    where: { userId },
    update: {
      displayName,
      country,
      degreeLevel: degreeLevel || null,
      degreeProgram,
      university,
      academicYear,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      skills: skills
        ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      researchInterests: researchInterests
        ? researchInterests.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      fundingPreference: fundingPreference || null,
      remotePreference: remotePreference || null,
    },
    create: {
      userId,
      displayName,
      country,
      degreeLevel: degreeLevel || null,
      degreeProgram,
      university,
      academicYear,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      skills: skills
        ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      researchInterests: researchInterests
        ? researchInterests.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      fundingPreference: fundingPreference || null,
      remotePreference: remotePreference || null,
    },
  });

  return NextResponse.json(profile);
}