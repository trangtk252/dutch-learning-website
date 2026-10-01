"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { addExistingWordAction } from "@/app/(app)/vocabulary/actions";
import { SpeakButton } from "@/components/voice/speak-button";

export function KeyWordList({
  words,
  context,
}: {
  words: { id: string; display: string; english: string; cardId: string | null }[];
  context: "READING" | "LISTENING" | "GRAMMAR";
}) {
  const [cards, setCards] = useState<Record<string, string | null>>(() => Object.fromEntries(words.map((w) => [w.id, w.cardId])));
  const [pending, start] = useTransition();
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {words.map((w) => (
        <li key={w.id} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
          <SpeakButton text={w.display} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium" lang="nl">{w.display}</p>
            <p className="truncate text-xs text-muted">{w.english}</p>
          </div>
          {cards[w.id] ? (
            <Link href={`/vocabulary/${cards[w.id]}`} className="flex items-center gap-1 text-xs text-success" aria-label={`${w.display} is in your vocabulary`}>
              <Check aria-hidden className="size-4" /> Saved
            </Link>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await addExistingWordAction(w.id, context);
                  if (r.ok) setCards((c) => ({ ...c, [w.id]: r.cardId }));
                })
              }
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary-soft"
              aria-label={`Save ${w.display} to vocabulary`}
            >
              <Plus aria-hidden className="size-4" /> Save
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
