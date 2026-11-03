import "server-only";
import { db } from "../db";
import { normalizeWord, tokenize } from "../dutch/text";
import { findWordIdsForForms } from "./vocabulary";

/** Which word forms in `texts` are already in the learner's deck (for underlining). */
export async function getKnownForms(userId: string, texts: string[]): Promise<string[]> {
  const forms = [...new Set(texts.flatMap((t) => tokenize(t).filter((x) => x.isWord).map((x) => normalizeWord(x.text))))];
  if (forms.length === 0) return [];
  const map = await findWordIdsForForms(forms);
  if (map.size === 0) return [];
  const cards = await db.vocabularyCard.findMany({
    where: { userId, wordId: { in: [...new Set(map.values())] } },
    select: { wordId: true },
  });
  const inDeck = new Set(cards.map((c) => c.wordId));
  return [...map.entries()].filter(([, id]) => inDeck.has(id)).map(([form]) => form);
}
