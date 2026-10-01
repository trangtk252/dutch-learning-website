import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { questionInclude, toClientQuestions } from "@/lib/server/questions";
import { displayLemma } from "@/lib/server/vocabulary";
import type { GradableQuestion } from "@/lib/quiz/grade";
import { ERROR_CATEGORY_LABELS } from "@/lib/constants";
import { LevelBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { KeyWordList } from "@/components/words/key-word-list";
import { SpeakButton } from "@/components/voice/speak-button";

export async function generateMetadata({ params }: PageProps<"/grammar/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = await db.grammarTopic.findUnique({ where: { slug }, select: { title: true, summary: true } });
  return { title: t?.title ?? "Grammar", description: t?.summary };
}

export default async function GrammarTopicPage({ params }: PageProps<"/grammar/[slug]">) {
  const { user } = await requireProfile();
  const { slug } = await params;
  const t = await db.grammarTopic.findUnique({
    where: { slug },
    include: {
      examples: { orderBy: { order: "asc" } },
      commonMistakes: true,
      questions: { ...questionInclude, select: { ...questionInclude.select, set: true } },
      words: { include: { word: { include: { cards: { where: { userId: user.id }, select: { id: true } } } } } },
    },
  });
  if (!t || !t.published) notFound();
  const myMistakes = await db.userMistake.findMany({
    where: { userId: user.id, category: { in: t.remedies } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  const practice = t.questions.filter((q) => q.set === "PRACTICE");
  const quiz = t.questions.filter((q) => q.set === "QUIZ");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/grammar" className="text-sm text-primary hover:underline">← Grammar</Link>
      <header>
        <LevelBadge level={t.level} />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-lg text-muted">{t.summary}</p>
      </header>

      <section aria-labelledby="explanation">
        <h2 id="explanation" className="sr-only">Explanation</h2>
        <Card><Markdown>{t.explanation}</Markdown></Card>
      </section>

      <section aria-labelledby="examples">
        <h2 id="examples" className="mb-3 text-lg font-semibold">Examples</h2>
        <ul className="space-y-2">
          {t.examples.map((e) => (
            <li key={e.id} className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3">
              <SpeakButton text={e.dutch} />
              <div>
                <p lang="nl" className="font-medium">{e.dutch}</p>
                <p className="text-sm text-muted">{e.english}{e.note && <span className="ml-1 italic">— {e.note}</span>}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="mistakes">
        <h2 id="mistakes" className="mb-3 text-lg font-semibold">Common mistakes</h2>
        <ul className="space-y-2">
          {t.commonMistakes.map((m) => (
            <li key={m.id} className="rounded-xl border border-line bg-surface p-3 text-sm">
              <p><span className="text-danger line-through decoration-1" lang="nl">{m.wrong}</span> <span aria-hidden>→</span><span className="sr-only">should be</span> <span className="font-medium text-success" lang="nl">{m.correct}</span></p>
              <p className="mt-1 text-muted">{m.explanation}</p>
            </li>
          ))}
        </ul>
        {myMistakes.length > 0 && (
          <Card className="mt-4 border-warning/40 bg-warning-soft/40">
            <h3 className="font-semibold">Your own recent mistakes here</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {myMistakes.map((m) => (
                <li key={m.id}>
                  <span className="text-muted">{ERROR_CATEGORY_LABELS[m.category]}:</span> <span lang="nl" className="line-through decoration-1">{m.original}</span> → <span lang="nl" className="font-medium">{m.corrected}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      {practice.length > 0 && (
        <QuizRunner kind="GRAMMAR" set="PRACTICE" refId={t.id} questions={toClientQuestions(practice as GradableQuestion[])} title="Mini exercise" />
      )}
      {quiz.length > 0 && (
        <QuizRunner kind="GRAMMAR" set="QUIZ" refId={t.id} questions={toClientQuestions(quiz as GradableQuestion[])} title="Quiz" />
      )}

      {t.words.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold">Related vocabulary</h2>
          <KeyWordList context="GRAMMAR" words={t.words.map(({ word }) => ({ id: word.id, display: displayLemma(word), english: word.english, cardId: word.cards[0]?.id ?? null }))} />
        </Card>
      )}
    </div>
  );
}
