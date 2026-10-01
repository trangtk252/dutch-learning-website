"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { lookupWordAction, saveWordFromContextAction, type LookupResult } from "@/app/(app)/vocabulary/actions";
import { POS_LABELS, type Pos } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { LevelBadge } from "@/components/ui/badge";
import { SpeakButton } from "@/components/voice/speak-button";

export type SaveContext = "READING" | "LISTENING" | "SPEAKING" | "WRITING" | "BLOG" | "GRAMMAR" | "MANUAL";

export interface PopoverTarget {
  word: string;
  sentence: string;
  rect: DOMRect;
  returnFocus: HTMLElement | null;
}

/** Word lookup popover: meaning, pronunciation, example, save to vocabulary with a note. */
export function WordPopover({
  target,
  context,
  onClose,
  onSaved,
}: {
  target: PopoverTarget;
  context: SaveContext;
  onClose: () => void;
  onSaved?: (form: string) => void;
}) {
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, startSaving] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    lookupWordAction(target.word)
      .then((r) => active && setResult(r))
      .catch(() => active && setError("Lookup failed."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [target.word]);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
      target.returnFocus?.focus();
    };
  }, [onClose, target.returnFocus]);

  function save() {
    setError(null);
    startSaving(async () => {
      const res = await saveWordFromContextAction({ text: target.word, sentence: target.sentence, context, note });
      if (res.ok) {
        setResult(res.result);
        onSaved?.(target.word.toLowerCase());
      } else setError(res.error);
    });
  }

  // Desktop: anchored below the word; mobile: bottom sheet.
  const top = Math.min(target.rect.bottom + 8, (typeof window !== "undefined" ? window.innerHeight : 800) - 320);
  const left = Math.max(12, Math.min(target.rect.left, (typeof window !== "undefined" ? window.innerWidth : 1200) - 352));
  const w = result?.word;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Word: ${target.word}`}
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] font-sans text-base leading-normal overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 shadow-xl outline-none sm:inset-x-auto sm:bottom-auto sm:w-[340px] sm:rounded-2xl"
      style={typeof window !== "undefined" && window.innerWidth >= 640 ? { top, left } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-lg font-semibold" lang="nl">
            {w ? w.display : target.word}
            <SpeakButton text={w ? w.display : target.word} />
          </p>
          {w && (
            <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              {POS_LABELS[w.partOfSpeech as Pos]} {w.ipa && <span lang="nl">/{w.ipa}/</span>} <LevelBadge level={w.cefrLevel} />
            </p>
          )}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-muted hover:bg-surface-2">
          <X aria-hidden className="size-4" />
        </button>
      </div>

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted"><Loader2 aria-hidden className="size-4 animate-spin" /> Looking up…</p>
      ) : w ? (
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-base">{w.english}</p>
          {w.lemma.toLowerCase() !== target.word.toLowerCase() && (
            <p className="text-xs text-muted">“{target.word}” is a form of <span lang="nl">{w.display}</span>{w.participle ? ` (${w.participle})` : ""}.</p>
          )}
          {w.plural && <p className="text-xs text-muted">Plural: <span lang="nl">{w.plural}</span></p>}
          {w.example && (
            <div className="rounded-xl bg-surface-2 p-2.5">
              <p lang="nl">{w.example.dutch}</p>
              {w.example.english && <p className="text-muted">{w.example.english}</p>}
            </div>
          )}
          {!w.verified && <p className="text-xs text-warning">Auto-generated entry — double-check if unsure.</p>}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">This word isn&apos;t in the dictionary yet. Save it and we&apos;ll create an entry with its meaning, forms and examples.</p>
      )}

      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 border-t border-line pt-3">
        {result?.cardId ? (
          <p className="flex items-center justify-between text-sm text-success">
            <span className="flex items-center gap-1"><Check aria-hidden className="size-4" /> In your vocabulary</span>
            <Link href={`/vocabulary/${result.cardId}`} className="text-primary hover:underline">Open</Link>
          </p>
        ) : (
          !loading && (
            <div className="space-y-2">
              <label htmlFor="popover-note" className="sr-only">Personal note (optional)</label>
              <Textarea id="popover-note" rows={2} placeholder="Personal note (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} className="min-h-0 text-sm" />
              <Button size="sm" className="w-full" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save to vocabulary"}
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
