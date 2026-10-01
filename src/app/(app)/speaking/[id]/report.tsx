import type { SpeakingFeedback } from "@prisma/client";
import { ERROR_CATEGORY_LABELS, type ErrorCategoryKey } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { ClickableText } from "@/components/words/clickable-text";
import { DeleteConversation } from "./delete";

export function SpeakingReport({
  feedback: f,
  corrections,
  conversationId,
}: {
  feedback: SpeakingFeedback;
  corrections: { id: string; original: string; corrected: string; category: string; explanation: string }[];
  conversationId: string;
}) {
  const rows = [
    ["Grammar", f.grammarScore, f.grammarNote],
    ["Vocabulary", f.vocabularyScore, f.vocabularyNote],
    ["Fluency", f.fluencyScore, f.fluencyNote],
    ["Accuracy", f.accuracyScore, f.accuracyNote],
    ["Naturalness", f.naturalnessScore, f.naturalnessNote],
  ] as const;
  return (
    <Card className="space-y-5 border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Your conversation report</h2>
          <p className="mt-1">{f.summary}</p>
        </div>
        <DeleteConversation id={conversationId} />
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {rows.map(([label, score, note]) => (
          <li key={label}>
            <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{label}</span><span className="tabular-nums text-muted">{score}/5</span></div>
            <ProgressBar value={score} max={5} label={`${label} estimate`} />
            <p className="mt-1 text-sm text-muted">{note}</p>
          </li>
        ))}
      </ul>
      {corrections.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">Useful corrections</h3>
          <ul className="space-y-2 text-sm">
            {corrections.slice(0, 5).map((c) => (
              <li key={c.id} className="rounded-xl bg-surface-2 p-3">
                <span className="text-xs text-muted">{ERROR_CATEGORY_LABELS[c.category as ErrorCategoryKey]}</span>
                <p lang="nl"><span className="line-through decoration-1 opacity-70">{c.original}</span> → <span className="font-medium">{c.corrected}</span></p>
                <p className="text-muted">{c.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {f.newVocabulary.length > 0 && (
        <div>
          <h3 className="mb-1 font-semibold">New vocabulary</h3>
          <p className="mb-2 text-xs text-muted">Tap a word to save it.</p>
          <ClickableText as="div" text={f.newVocabulary.join(" · ")} context="SPEAKING" />
        </div>
      )}
      <p className="text-xs text-muted">Scores are practice estimates relative to your level — not an official CEFR or NT2 assessment.</p>
    </Card>
  );
}
