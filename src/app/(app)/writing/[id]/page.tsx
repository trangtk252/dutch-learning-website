import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { ERROR_CATEGORY_LABELS } from "@/lib/constants";
import { getKnownForms } from "@/lib/server/known-forms";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { ClickableText } from "@/components/words/clickable-text";
import { DeleteSubmission } from "./delete-button";

export const metadata: Metadata = { title: "Writing feedback" };

export default async function WritingFeedbackPage({ params }: PageProps<"/writing/[id]">) {
  const { user } = await requireProfile();
  const { id } = await params;
  const s = await db.writingSubmission.findFirst({
    where: { id, userId: user.id },
    include: { prompt: true, feedback: true, corrections: { orderBy: { order: "asc" } } },
  });
  if (!s) notFound();
  const f = s.feedback;
  const knownForms = f ? await getKnownForms(user.id, [f.improvedVersion]) : [];
  const scores = f
    ? [
        ["Grammar", f.grammarScore], ["Vocabulary", f.vocabularyScore], ["Sentence structure", f.structureScore],
        ["Register", f.registerScore], ["Coherence", f.coherenceScore], ["Task completion", f.taskScore],
      ] as const
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/writing" className="text-sm text-primary hover:underline">← Writing</Link>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{s.prompt?.title ?? s.taskDescription ?? "Free writing"}</h1>
          <p className="text-sm text-muted">{s.wordCount} words · {s.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
        <DeleteSubmission id={s.id} />
      </header>

      {f && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <Card>
            <h2 className="mb-3 font-semibold">Feedback</h2>
            <p className="mb-4">{f.summary}</p>
            <ul className="space-y-3">
              {scores.map(([label, score]) => (
                <li key={label}>
                  <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="tabular-nums text-muted">{score}/5</span></div>
                  <ProgressBar value={score} max={5} label={`${label} score`} />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">Practice estimates (1–5), not official exam scores.</p>
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold">Corrections ({s.corrections.length})</h2>
            {s.corrections.length === 0 ? (
              <p className="text-sm text-muted">No errors found. Goed gedaan!</p>
            ) : (
              <ol className="space-y-3">
                {s.corrections.map((c) => (
                  <li key={c.id} className="rounded-xl bg-surface-2 p-3 text-sm">
                    <Badge tone="warning">{ERROR_CATEGORY_LABELS[c.category]}</Badge>
                    <p className="mt-2" lang="nl"><span className="text-danger line-through decoration-1">{c.original}</span></p>
                    <p lang="nl" className="font-medium text-success">{c.corrected}</p>
                    <p className="mt-1 text-muted">{c.explanation}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-semibold">Your text</h2>
          <p className="whitespace-pre-line font-serif text-lg leading-relaxed" lang="nl">{s.text}</p>
        </Card>
        {f && (
          <Card className="border-primary/30">
            <h2 className="mb-2 font-semibold">A more natural version</h2>
            <ClickableText text={f.improvedVersion} context="WRITING" knownForms={knownForms} className="font-serif text-lg leading-relaxed" />
          </Card>
        )}
      </div>

      {f && f.usefulVocabulary.length > 0 && (
        <Card>
          <h2 className="mb-2 font-semibold">Useful vocabulary for this task</h2>
          <p className="mb-3 text-sm text-muted">Tap a word to save it.</p>
          <ClickableText as="div" text={f.usefulVocabulary.join(" · ")} context="WRITING" knownForms={knownForms} />
        </Card>
      )}
    </div>
  );
}
