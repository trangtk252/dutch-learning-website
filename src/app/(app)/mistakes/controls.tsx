"use client";

import { useState, useTransition } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERROR_CATEGORY_LABELS, type ErrorCategoryKey } from "@/lib/constants";
import type { MistakeAnalysis } from "@/lib/ai/schemas";
import { analyzeMistakesAction, clearMistakesAction, deleteMistakeAction } from "./actions";
import { useT } from "@/lib/i18n/client";

export function AnalyzeButton() {
  const t = useT();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<MistakeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="w-full sm:w-auto">
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await analyzeMistakesAction();
            if (r.ok) setResult(r.analysis);
            else setError(r.error);
          })
        }
      >
        <Sparkles aria-hidden className="size-4" /> {pending ? t("Analysing…") : t("Find patterns")}
      </Button>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{t(error)}</p>}
      {result && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-xl rounded-2xl border border-line bg-surface p-5 shadow-xl lg:bottom-8">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-semibold">{t("Your mistake patterns")}</h2>
            <button type="button" onClick={() => setResult(null)} className="text-sm text-muted hover:text-ink">{t("Close")}</button>
          </div>
          <p className="mt-2 text-sm">{result.summary}</p>
          <ul className="mt-3 max-h-80 space-y-3 overflow-y-auto text-sm">
            {result.patterns.map((p, i) => (
              <li key={i} className="rounded-xl bg-surface-2 p-3">
                <p className="font-medium">{t(ERROR_CATEGORY_LABELS[p.category as ErrorCategoryKey])}</p>
                <p className="mt-1">{p.insight}</p>
                <p className="mt-1 text-muted"><strong className="text-ink">{t("Tip:")}</strong> {p.tip}</p>
                <p className="mt-1 text-muted" lang="nl">{p.exampleFix}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DeleteMistake({ id }: { id: string }) {
  const t = useT();
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(() => deleteMistakeAction(id))} aria-label={t("Delete this mistake")} className="rounded p-1 text-muted hover:text-danger">
      <Trash2 aria-hidden className="size-4" />
    </button>
  );
}

export function ClearMistakes() {
  const t = useT();
  const [pending, start] = useTransition();
  return (
    <Button variant="ghost" size="sm" className="text-danger!" disabled={pending} onClick={() => confirm(t("Delete your entire mistake history? This cannot be undone.")) && start(() => clearMistakesAction())}>
      {t("Clear mistake history")}
    </Button>
  );
}
