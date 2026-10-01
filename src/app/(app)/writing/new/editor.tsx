"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Textarea } from "@/components/ui/form";
import { countWords } from "@/lib/dutch/text";
import { cn } from "@/lib/cn";
import { submitWritingAction } from "../actions";

const DRAFT_KEY = (id?: string) => `writing-draft:${id ?? "free"}`;

export function WritingEditor({ promptId, minWords, maxWords }: { promptId?: string; minWords?: number; maxWords?: number }) {
  const [state, action, pending] = useActionState(submitWritingAction, null);
  const [text, setText] = useState("");
  const [startedAt] = useState(() => Date.now());
  const words = countWords(text);

  // Keep an unsent draft in this browser only.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY(promptId));
      if (saved) setText(saved);
    } catch {}
  }, [promptId]);
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY(promptId), text);
    } catch {}
  }, [text, promptId]);

  const outOfRange = minWords !== undefined && maxWords !== undefined && words > 0 && (words < minWords || words > maxWords);

  return (
    <form action={action} className="space-y-4" onSubmit={() => { try { localStorage.removeItem(DRAFT_KEY(promptId)); } catch {} }}>
      <FormError message={state?.error} />
      {promptId && <input type="hidden" name="promptId" value={promptId} />}
      <input type="hidden" name="startedAt" value={startedAt} />
      {!promptId && (
        <Field id="task" label="What are you writing?" hint="e.g. 'A message to my neighbour to invite them for coffee'">
          <Input id="task" name="task" maxLength={500} required />
        </Field>
      )}
      <Field id="text" label="Your text (Dutch)">
        <Textarea
          id="text"
          name="text"
          lang="nl"
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          maxLength={6000}
          className="font-serif text-lg leading-relaxed"
          aria-describedby="word-count"
        />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p id="word-count" className={cn("text-sm", outOfRange ? "text-warning" : "text-muted")} aria-live="polite">
          {words} word{words === 1 ? "" : "s"}{minWords !== undefined && ` · target ${minWords}–${maxWords}`}
        </p>
        <Button type="submit" disabled={pending || words < 3}>
          {pending ? "Checking your text…" : "Get feedback"}
        </Button>
      </div>
      <p className="text-xs text-muted">Your text is sent to the configured AI provider for feedback and stored in your account. You can delete it at any time.</p>
    </form>
  );
}
