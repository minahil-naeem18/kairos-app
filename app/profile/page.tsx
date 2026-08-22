import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  return (
        <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>Your Profile</h1>
      <p className="mt-2" style={{ color: "var(--muted)" }}>
        This information helps us match you with relevant opportunities.
      </p>

      <ProfileForm profile={profile} />
    </div>
  );
}