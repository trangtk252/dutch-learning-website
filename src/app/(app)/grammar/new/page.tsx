import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/session";
import { TopicForm } from "../topic-form";
import { getT, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Add my own grammar");

export default async function NewGrammarPage() {
  await requireProfile();
  const t = await getT();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/grammar" className="text-sm text-primary-strong hover:underline">{t("← Grammar")}</Link>
      <h1 className="text-3xl font-semibold tracking-tight">{t("Add my own grammar")}</h1>
      <TopicForm initial={{ title: "", level: "B1", summary: "", explanation: "", examples: "" }} />
    </div>
  );
}
