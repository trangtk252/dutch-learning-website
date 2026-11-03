"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { saveDictionaryWordAction } from "./actions";
import { useT } from "@/lib/i18n/client";

export function SaveButton({
  word, gender, meaning, example, cardId: initialCardId,
}: {
  word: string;
  gender: "DE" | "HET" | null;
  meaning: string;
  example: string | null;
  cardId: string | null;
}) {
  const [cardId, setCardId] = useState(initialCardId);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const t = useT();

  if (cardId) {
    return <Link href={`/vocabulary/${cardId}`} className="text-sm font-medium text-primary-strong hover:underline">{t("In your deck · open card")}</Link>;
  }
  return (
    <span className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await saveDictionaryWordAction({ word, gender, meaning, example });
            if (r.ok) setCardId(r.cardId);
            else setError(r.error);
          })
        }
      >
        {pending ? t("Saving…") : t("Save to flashcards")}
      </Button>
      {error && <span role="alert" className="text-xs text-danger">{t(error)}</span>}
    </span>
  );
}
