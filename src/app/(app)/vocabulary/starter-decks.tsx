"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addStarterDeckAction, removeStarterDeckAction } from "./actions";
import { useT } from "@/lib/i18n/client";

export interface DeckInfo { slug: string; name: string; total: number; owned: number }

export function StarterDecks({ decks }: { decks: DeckInfo[] }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const t = useT();
  return (
    <section aria-labelledby="starter-title" className="rounded-2xl border border-line bg-surface p-4">
      <h2 id="starter-title" className="text-sm font-medium">{t("NT2 starter decks")}</h2>
      <p className="mt-1 text-xs text-muted">{t("Common words per level with an example sentence. Adding a deck creates new flashcards for the words you don't have yet; removing it deletes those cards so you can add it again later.")}</p>
      <ul className="mt-3 space-y-2">
        {decks.map((d) => {
          const missing = d.total - d.owned;
          return (
            <li key={d.slug} className="flex items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-medium">{t(d.name)}</span>
                <span className="block text-xs text-muted">{t("{owned} of {total} in your deck", { owned: d.owned, total: d.total })}</span>
              </span>
              <span className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={pending || d.owned === 0}
                onClick={() => {
                  if (!window.confirm(t("Delete all {n} {name} cards from your deck? Their review progress is lost. You can add the deck again later.", { n: d.owned, name: t(d.name) }))) return;
                  start(async () => {
                    const r = await removeStarterDeckAction(d.slug);
                    setMessage(t(r.removed === 1 ? "Removed {n} card from {name}." : "Removed {n} cards from {name}.", { n: r.removed, name: t(d.name) }));
                  });
                }}
              >
                {t("Remove")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pending || missing === 0}
                onClick={() => start(async () => {
                  const r = await addStarterDeckAction(d.slug);
                  setMessage(t(r.added === 1 ? "Added {n} new card from {name}." : "Added {n} new cards from {name}.", { n: r.added, name: t(d.name) }));
                })}
              >
                {missing === 0 ? t("All added") : t("Add {n} words", { n: missing })}
              </Button>
              </span>
            </li>
          );
        })}
      </ul>
      <p role="status" className="mt-2 text-xs text-success">{message}</p>
    </section>
  );
}
