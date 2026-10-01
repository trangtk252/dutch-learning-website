import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { getKnownForms } from "@/lib/server/known-forms";
import { questionInclude, toClientQuestions } from "@/lib/server/questions";
import { displayLemma } from "@/lib/server/vocabulary";
import type { GradableQuestion } from "@/lib/quiz/grade";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ListeningPlayer } from "@/components/listening/audio-player";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { KeyWordList } from "@/components/words/key-word-list";

export async function generateMetadata({ params }: PageProps<"/listening/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const l = await db.listeningExercise.findUnique({ where: { slug }, select: { title: true } });
  return { title: l?.title ?? "Listening" };
}

export default async function ListeningExercisePage({ params }: PageProps<"/listening/[slug]">) {
  const { user } = await requireProfile();
  const { slug } = await params;
  const l = await db.listeningExercise.findUnique({
    where: { slug },
    include: {
      segments: { orderBy: { order: "asc" } },
      questions: questionInclude,
      words: { include: { word: { include: { cards: { where: { userId: user.id }, select: { id: true } } } } } },
    },
  });
  if (!l || !l.published) notFound();
  const knownForms = await getKnownForms(user.id, l.segments.map((s) => s.text));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/listening" className="text-sm text-primary hover:underline">← Listening</Link>
      <header>
        <div className="flex flex-wrap items-center gap-1.5">
          <LevelBadge level={l.level} />
          {l.isNt2 && <Badge tone="accent">NT2-style</Badge>}
          <span className="text-xs text-muted">~{Math.max(1, Math.round(l.durationSec / 60))} min</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight" lang="nl">{l.title}</h1>
        {l.description && <p className="mt-1 text-muted">{l.description}</p>}
        <p className="mt-2 text-sm text-muted">Tip: listen once without the transcript and answer what you can. Then listen again with the transcript.</p>
      </header>

      <ListeningPlayer
        segments={l.segments.map((s) => ({ id: s.id, speaker: s.speaker, text: s.text }))}
        audioUrl={l.audioUrl}
        knownForms={knownForms}
      />

      {l.questions.length > 0 && (
        <QuizRunner kind="LISTENING" refId={l.id} questions={toClientQuestions(l.questions as GradableQuestion[])} title="Questions" />
      )}

      {l.words.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold">Key vocabulary</h2>
          <KeyWordList
            context="LISTENING"
            words={l.words.map(({ word }) => ({ id: word.id, display: displayLemma(word), english: word.english, cardId: word.cards[0]?.id ?? null }))}
          />
        </Card>
      )}
    </div>
  );
}
