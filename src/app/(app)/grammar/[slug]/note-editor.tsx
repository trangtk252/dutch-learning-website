"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { saveGrammarNoteAction } from "../actions";
import { useT } from "@/lib/i18n/client";

export function NoteEditor({ topicId, initial }: { topicId: string; initial: string }) {
  const t = useT();
  const [body, setBody] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const [error, setError] = useState(false);
  const dirty = body !== saved;

  function save() {
    setError(false);
    start(async () => {
      try {
        const r = await saveGrammarNoteAction({ topicId, body });
        if (r.ok) setSaved(body);
        else setError(true);
      } catch {
        setError(true);
      }
    });
  }

  return (
    <div className="space-y-3">
      <label htmlFor="grammar-note" className="sr-only">{t("My notes")}</label>
      <Textarea
        id="grammar-note"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={10000}
        rows={6}
        placeholder={t("Write your own rules, tricks, exceptions or extra examples here…")}
      />
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={pending || !dirty}>{pending ? t("Saving…") : t("Save note")}</Button>
        <span role="status" className="text-sm text-muted">
          {error ? <span className="text-danger">{t("Couldn't save. Please try again.")}</span> : dirty ? t("Unsaved changes") : saved ? t("Saved") : ""}
        </span>
      </div>
    </div>
  );
}
