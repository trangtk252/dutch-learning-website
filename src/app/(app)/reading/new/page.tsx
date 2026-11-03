import type { Metadata } from "next";
import Link from "next/link";
import { isAiMock } from "@/lib/ai";
import { requireProfile } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { GenerateReadingForm } from "./form";
import { getT, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Generate a text");

export default async function NewReadingPage() {
  const { profile } = await requireProfile();
  const t = await getT();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/reading" className="text-sm text-primary-strong hover:underline">{t("← Reading")}</Link>
      <PageHeader
        title={t("Generate a reading text")}
        description={t("Create an original practice text on a topic you choose. AI-generated texts are labelled as such; curated texts by teachers take priority in recommendations.")}
      />
      {isAiMock() && (
        <p className="rounded-xl bg-warning-soft px-4 py-2 text-sm text-warning">{t("Offline mode: only a short placeholder text can be created.")}</p>
      )}
      <GenerateReadingForm defaultLevel={profile.currentLevel} />
    </div>
  );
}
