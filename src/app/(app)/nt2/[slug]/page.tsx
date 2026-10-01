import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { NT2_PROGRAM_LABELS, SKILL_LABELS } from "@/lib/constants";
import { questionInclude, toClientQuestions } from "@/lib/server/questions";
import type { GradableQuestion } from "@/lib/quiz/grade";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { ListeningPlayer } from "@/components/listening/audio-player";
import { ClickableText } from "@/components/words/clickable-text";

export const metadata: Metadata = { title: "Practice exam" };

export default async function MockExamPage({ params, searchParams }: PageProps<"/nt2/[slug]">) {
  await requireProfile();
  const { slug } = await params;
  const { mode: modeParam } = await searchParams;
  const exam = await db.mockExam.findUnique({
    where: { slug },
    include: {
      parts: {
        orderBy: { order: "asc" },
        include: {
          questions: questionInclude,
          readingExercise: { select: { title: true, body: true } },
          listeningExercise: { select: { title: true, audioUrl: true, segments: { orderBy: { order: "asc" } } } },
        },
      },
    },
  });
  if (!exam || !exam.published) notFound();

  if (modeParam !== "practice" && modeParam !== "exam") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/nt2" className="text-sm text-primary hover:underline">← NT2</Link>
        <h1 className="text-2xl font-semibold">{exam.title}</h1>
        <p className="text-muted">{exam.description}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h2 className="font-semibold">Practice mode</h2>
            <p className="mt-1 text-sm text-muted">No timer. Check each answer immediately and read the explanation. Tap words to look them up.</p>
            <ButtonLink href={`/nt2/${slug}?mode=practice`} variant="secondary" className="mt-4">Start practice</ButtonLink>
          </Card>
          <Card>
            <h2 className="font-semibold">Exam mode</h2>
            <p className="mt-1 text-sm text-muted">Timed ({exam.durationMinutes} min). No dictionary, answers only at the end, audio max. 2×.</p>
            <ButtonLink href={`/nt2/${slug}?mode=exam`} className="mt-4">Start exam</ButtonLink>
          </Card>
        </div>
      </div>
    );
  }

  const isExam = modeParam === "exam";
  const allQuestions = exam.parts.flatMap((p) => p.questions) as GradableQuestion[];
  const sections = exam.parts.map((p, i) => ({
    key: p.id,
    questionIds: p.questions.map((q) => q.id),
    content: (
      <Card className="space-y-3">
        <h3 className="font-semibold">Part {i + 1}{p.readingExercise ? `: ${p.readingExercise.title}` : p.listeningExercise ? `: ${p.listeningExercise.title}` : ""}</h3>
        <p className="text-sm text-muted">{p.instructions}</p>
        {p.readingExercise &&
          p.readingExercise.body.split(/\n\s*\n/).map((para, j) =>
            isExam ? (
              <p key={j} lang="nl" className="font-serif text-lg leading-relaxed whitespace-pre-line">{para.replace(/\*\*/g, "")}</p>
            ) : (
              <ClickableText key={j} text={para.replace(/\*\*/g, "")} context="READING" className="font-serif text-lg leading-relaxed" />
            ),
          )}
        {p.listeningExercise && (
          <ListeningPlayer
            segments={p.listeningExercise.segments.map((s) => ({ id: s.id, speaker: s.speaker, text: s.text }))}
            audioUrl={p.listeningExercise.audioUrl}
            maxPlays={isExam ? 2 : undefined}
          />
        )}
      </Card>
    ),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/nt2" className="text-sm text-primary hover:underline">← NT2</Link>
      <header>
        <div className="flex flex-wrap gap-1.5">
          <LevelBadge level={exam.level} />
          <Badge tone="accent">{NT2_PROGRAM_LABELS[exam.program]}</Badge>
          <Badge>{SKILL_LABELS[exam.skill]}</Badge>
          <Badge tone={isExam ? "danger" : "primary"}>{isExam ? "Exam mode" : "Practice mode"}</Badge>
        </div>
        <h1 className="mt-3 text-2xl font-semibold">{exam.title}</h1>
        <p className="mt-1 text-sm text-muted">Original practice material modelled on the skills tested — not real exam questions. Your score is not an official result.</p>
      </header>
      <QuizRunner
        kind="MOCK_EXAM"
        refId={exam.id}
        mode={isExam ? "EXAM" : "PRACTICE"}
        timeLimitSec={isExam ? exam.durationMinutes * 60 : undefined}
        questions={toClientQuestions(allQuestions)}
        sections={sections}
        title={isExam ? "Exam" : "Practice"}
      />
    </div>
  );
}
