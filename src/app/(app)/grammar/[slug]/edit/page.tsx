import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { TopicForm } from "../../topic-form";
import { getT, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Edit my grammar");

export default async function EditGrammarPage({ params }: PageProps<"/grammar/[slug]/edit">) {
  const { user } = await requireProfile();
  const { slug } = await params;
  const t = await getT();
  const topic = await db.grammarTopic.findFirst({
    where: { slug, ownerId: user.id },
    include: { examples: { orderBy: { order: "asc" } } },
  });
  if (!topic) notFound();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/grammar/${topic.slug}`} className="text-sm text-primary-strong hover:underline">← {topic.title}</Link>
      <h1 className="text-3xl font-semibold tracking-tight">{t("Edit my grammar")}</h1>
      <TopicForm
        initial={{
          id: topic.id, title: topic.title, level: topic.level, summary: topic.summary === topic.title ? "" : topic.summary,
          explanation: topic.explanation, examples: topic.examples.map((e) => `${e.dutch} = ${e.english}`).join("\n"),
        }}
      />
    </div>
  );
}
