import type { Metadata } from "next";
import Link from "next/link";
import { isAiMock } from "@/lib/ai";
import { requireProfile } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { GenerateReadingForm } from "./form";

export const metadata: Metadata = { title: "Generate a text" };

export default async function NewReadingPage() {
  const { profile } = await requireProfile();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/reading" className="text-sm text-primary hover:underline">← Reading</Link>
      <PageHeader
        title="Generate a reading text"
        description="Create an original practice text on a topic you choose. AI-generated texts are labelled as such; curated texts by teachers take priority in recommendations."
      />
      {isAiMock() && (
        <p className="rounded-xl bg-warning-soft px-4 py-2 text-sm text-warning">Offline mode: only a short placeholder text can be created.</p>
      )}
      <GenerateReadingForm defaultLevel={profile.currentLevel} />
    </div>
  );
}
