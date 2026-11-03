import type { SpeakingFeedback } from "@prisma/client";
import { jsonList } from "@/lib/json-list";
import { ERROR_CATEGORY_LABELS, type ErrorCategoryKey } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { ClickableText } from "@/components/words/clickable-text";
import { DeleteConversation } from "./delete";
import { getT } from "@/lib/i18n/server";
import { translateOfflineNote } from "@/lib/i18n/translate";

export async function SpeakingReport({
  feedback: f,
  corrections,
  conversationId,
}: {
  feedback: SpeakingFeedback;
  corrections: { id: string; original: string; corrected: string; category: string; explanation: string }[];
  conversationId: string;
}) {
  const t = await getT();
  const note = (s: string) => translateOfflineNote(s, t);
  const rows = [
    [t("Grammar"), f.grammarNote],
    [t("Vocabulary"), f.vocabularyNote],
    [t("Fluency"), f.fluencyNote],
    [t("Accuracy"), f.accuracyNote],
    [t("Naturalness"), f.naturalnessNote],
  ] as const;
  return (
    <Card className="space-y-5 border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t("Your conversation report")}</h2>
          {f.summary && !f.summary.startsWith("Offline report.") && <p className="mt-1">{f.summary}</p>}
        </div>
        <DeleteConversation id={conversationId} />
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {rows.map(([label, n]) => (
          <li key={label}>
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-muted">{note(n)}</p>
          </li>
        ))}
      </ul>
      {corrections.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">{t("Useful corrections")}</h3>
          <ul className="space-y-2 text-sm">
            {corrections.slice(0, 5).map((c) => (
              <li key={c.id} className="rounded-xl bg-surface-2 p-3">
                <span className="text-xs text-muted">{t(ERROR_CATEGORY_LABELS[c.category as ErrorCategoryKey])}</span>
                <p lang="nl"><span className="line-through decoration-1 opacity-70">{c.original}</span> → <span className="font-medium">{c.corrected}</span></p>
                <p className="text-muted">{c.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {jsonList(f.newVocabulary).length > 0 && (
        <div>
          <h3 className="mb-1 font-semibold">{t("New vocabulary")}</h3>
          <p className="mb-2 text-xs text-muted">{t("Tap a word to save it.")}</p>
          <ClickableText as="div" text={jsonList(f.newVocabulary).join(" · ")} context="SPEAKING" />
        </div>
      )}
      <p className="text-xs text-muted">{t("This feedback is a practice aid — not an official CEFR or NT2 assessment.")}</p>
    </Card>
  );
}
