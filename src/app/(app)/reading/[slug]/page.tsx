import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { READING_GENRE_LABELS } from "@/lib/constants";
import { getKnownForms } from "@/lib/server/known-forms";
import { questionInclude, toClientQuestions } from "@/lib/server/questions";
import { displayLemma } from "@/lib/server/vocabulary";
import type { GradableQuestion } from "@/lib/quiz/grade";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ClickableText } from "@/components/words/clickable-text";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { KeyWordList } from "@/components/words/key-word-list";

export async function generateMetadata({ params }: PageProps<"/reading/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = await db.readingExercise.findUnique({ where: { slug }, select: { title: true } });
  return { title: r?.title ?? "Reading" };
}

export default async function ReadingExercisePage({ params }: PageProps<"/reading/[slug]">) {
  const { user } = await requireProfile();
  const { slug } = await params;
  const r = await db.readingExercise.findUnique({
    where: { slug },
    include: {
      questions: questionInclude,
      words: { include: { word: { include: { cards: { where: { userId: user.id }, select: { id: true } } } } } },
    },
  });
  if (!r || !r.published) notFound();
  const paragraphs = r.body.split(/\n\s*\n/).filter(Boolean);
  const knownForms = await getKnownForms(user.id, [r.body]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/reading" className="text-sm text-primary hover:underline">← Reading</Link>
      <header>
        <div className="flex flex-wrap items-center gap-1.5">
          <LevelBadge level={r.level} />
          <Badge>{READING_GENRE_LABELS[r.genre]}</Badge>
          {r.isNt2 && <Badge tone="accent">NT2-style</Badge>}
          {r.source === "AI" && <Badge tone="warning">AI-generated — not reviewed by a teacher</Badge>}
          <span className="text-xs text-muted">{r.readingMinutes} min · {r.wordCount} words</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight" lang="nl">{r.title}</h1>
        {r.summaryEn && (
          <details className="mt-2 text-sm text-muted">
            <summary className="cursor-pointer">Show English summary</summary>
            <p className="mt-1">{r.summaryEn}</p>
          </details>
        )}
      </header>

      <article className="space-y-4 rounded-2xl border border-line bg-surface p-5 font-serif text-[1.15rem] leading-relaxed sm:p-8">
        <p className="font-sans text-xs text-muted">Tap a word to see its meaning. Dotted words are already in your vocabulary.</p>
        {paragraphs.map((p, i) => (
          <ClickableText key={i} text={p.replace(/\*\*/g, "")} context="READING" knownForms={knownForms} className={p.startsWith("**") ? "font-sans font-semibold" : undefined} />
        ))}
      </article>

      {r.words.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold">Key vocabulary</h2>
          <KeyWordList
            context="READING"
            words={r.words.map(({ word }) => ({ id: word.id, display: displayLemma(word), english: word.english, cardId: word.cards[0]?.id ?? null }))}
          />
        </Card>
      )}

      {r.questions.length > 0 && (
        <QuizRunner kind="READING" refId={r.id} questions={toClientQuestions(r.questions as GradableQuestion[])} title="Comprehension questions" />
      )}
    </div>
  );
}
