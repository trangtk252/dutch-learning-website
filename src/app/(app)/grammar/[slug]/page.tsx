import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { toClientQuestions } from "@/lib/server/questions";
import type { GradableQuestion } from "@/lib/quiz/grade";
import { LevelBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { SpeakButton } from "@/components/voice/speak-button";
import { buttonClass } from "@/components/ui/button";
import { DeleteTopicButton } from "./delete-button";
import { NoteEditor } from "./note-editor";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata({ params }: PageProps<"/grammar/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const topic = await db.grammarTopic.findUnique({ where: { slug }, select: { title: true } });
  return { title: topic?.title ?? (await getT())("Grammar") };
}

export default async function GrammarTopicPage({ params }: PageProps<"/grammar/[slug]">) {
  const { user } = await requireProfile();
  const t = await getT();
  const { slug } = await params;
  const topic = await db.grammarTopic.findUnique({
    where: { slug },
    include: {
      examples: { orderBy: { order: "asc" } },
      commonMistakes: true,
      questions: {
        where: { set: "QUIZ" },
        orderBy: { order: "asc" },
        select: {
          id: true, type: true, prompt: true, focus: true, explanation: true,
          options: { select: { id: true, text: true, isCorrect: true, order: true } },
        },
      },
      notes: { where: { userId: user.id }, select: { body: true } },
    },
  });
  if (!topic || !topic.published || (topic.ownerId && topic.ownerId !== user.id)) notFound();
  const questions = toClientQuestions(topic.questions as GradableQuestion[]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/grammar" className="text-sm text-primary-strong hover:underline">{t("← Grammar")}</Link>
      <header>
        <LevelBadge level={topic.level} />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{topic.title}</h1>
        <p className="mt-2 text-muted">{topic.summary}</p>
        {topic.ownerId && (
          <div className="mt-3 flex gap-2">
            <Link href={`/grammar/${topic.slug}/edit`} className={buttonClass("secondary", "sm")}>{t("Edit")}</Link>
            <DeleteTopicButton id={topic.id} />
          </div>
        )}
      </header>

      <section aria-labelledby="g-explain" className="space-y-3">
        <h2 id="g-explain" className="text-lg font-semibold">{t("How it works")}</h2>
        <Card><Markdown>{topic.explanation}</Markdown></Card>
      </section>

      {topic.examples.length > 0 && (
        <section aria-labelledby="g-examples" className="space-y-3">
          <h2 id="g-examples" className="text-lg font-semibold">{t("Examples")}</h2>
          <ul className="space-y-2">
            {topic.examples.map((e) => (
              <li key={e.id} className="flex items-start gap-2 rounded-2xl border border-line bg-surface p-4">
                <div className="min-w-0 flex-1">
                  <p lang="nl" className="font-medium">{e.dutch}</p>
                  <p className="text-sm text-muted">{e.english}</p>
                  {e.note && <p className="mt-1 text-xs text-primary-strong">{e.note}</p>}
                </div>
                <SpeakButton text={e.dutch} label={t("Listen")} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {topic.commonMistakes.length > 0 && (
        <section aria-labelledby="g-mistakes" className="space-y-3">
          <h2 id="g-mistakes" className="text-lg font-semibold">{t("Common mistakes")}</h2>
          <ul className="space-y-2">
            {topic.commonMistakes.map((m) => (
              <li key={m.id} className="rounded-2xl border border-line bg-surface p-4 text-sm">
                <p className="flex items-start gap-2 text-danger"><X aria-hidden className="mt-0.5 size-4 shrink-0" /><span lang="nl" className="line-through">{m.wrong}</span></p>
                <p className="mt-1 flex items-start gap-2 text-success"><Check aria-hidden className="mt-0.5 size-4 shrink-0" /><span lang="nl" className="font-medium">{m.correct}</span></p>
                <p className="mt-2 text-muted">{m.explanation}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {questions.length > 0 && (
        <QuizRunner questions={questions} kind="GRAMMAR" refId={topic.id} set="QUIZ" title={t("Quick quiz")} />
      )}

      <section aria-labelledby="g-notes" className="space-y-3">
        <h2 id="g-notes" className="text-lg font-semibold">{t("My notes")}</h2>
        <NoteEditor topicId={topic.id} initial={topic.notes[0]?.body ?? ""} />
      </section>
    </div>
  );
}
