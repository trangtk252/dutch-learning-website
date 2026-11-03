"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormError, Textarea } from "@/components/ui/form";
import { addTranscriptAction, deleteMediaAction, retryStudyPackAction, saveSummaryAction } from "./actions";
import { useT } from "@/lib/i18n/client";

export function TranscriptForm({ id }: { id: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(addTranscriptAction.bind(null, id), null);
  return (
    <Card>
      <form action={action} className="space-y-3">
        <h2 className="font-semibold">{t("Add a transcript")}</h2>
        <FormError message={state?.error} />
        <Field id="transcript" label={t("Transcript or subtitles")} hint={t("Plain text, or the contents of an .srt / .vtt file. We'll then write the summary and quiz.")}>
          <Textarea id="transcript" name="transcript" rows={8} required />
        </Field>
        <Button type="submit" disabled={pending}>{pending ? t("Working…") : t("Create summary & quiz")}</Button>
      </form>
    </Card>
  );
}

export function RetryButton({ id }: { id: string }) {
  const t = useT();
  return (
    <form action={retryStudyPackAction.bind(null, id)}>
      <Button type="submit" variant="secondary" size="sm">{t("Create summary & quiz")}</Button>
    </form>
  );
}

export function DeleteButton({ id }: { id: string }) {
  const t = useT();
  return (
    <form
      action={deleteMediaAction.bind(null, id)}
      onSubmit={(e) => { if (!confirm(t("Remove this from your library? Your quiz scores for it are kept in your stats."))) e.preventDefault(); }}
    >
      <Button type="submit" variant="ghost" size="sm" className="text-danger">{t("Remove")}</Button>
    </form>
  );
}

export function SummaryEditor({ id, summary, canGenerate }: { id: string; summary: string | null; canGenerate: boolean }) {
  const t = useT();
  const [state, action, pending] = useActionState(saveSummaryAction.bind(null, id), null);
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{t("Summary")}</h2>
        {!summary && canGenerate && <RetryButton id={id} />}
      </div>
      <form action={action} className="mt-2 space-y-2">
        <FormError message={state?.error} />
        <Textarea name="summary" rows={4} defaultValue={summary ?? ""} placeholder={t("Write your own summary of what you heard…")} aria-label={t("Summary")} />
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" variant="secondary" disabled={pending}>{pending ? t("Saving…") : t("Save summary")}</Button>
          <p className="text-xs text-muted">{t("Transcripts from automatic captions or speech recognition can contain mistakes.")}</p>
        </div>
      </form>
    </Card>
  );
}
