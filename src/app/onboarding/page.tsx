import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { OnboardingWizard } from "./wizard";

export const metadata: Metadata = { title: "Set up your plan" };

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await db.userProfile.findUnique({ where: { userId: user.id } });
  if (profile?.onboardedAt) redirect("/dashboard");
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <p className="text-sm font-medium text-primary">Hallo {user.name}! 👋</p>
      <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Let&apos;s shape your Dutch plan</h1>
      <p className="mt-2 text-muted">
        A few questions so we can recommend the right material and daily routine. You can change everything later in
        Settings.
      </p>
      <OnboardingWizard />
    </main>
  );
}
