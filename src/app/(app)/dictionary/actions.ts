"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import { addCardForUser, getOrCreateWord } from "@/lib/server/vocabulary";
import { checkRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/server/rate-limit";

const Input = z.object({
  word: z.string().trim().min(1).max(80),
  gender: z.enum(["DE", "HET"]).nullable(),
  meaning: z.string().trim().min(1).max(300),
  example: z.string().trim().max(300).nullable(),
});

/** Saves a dictionary result as a flashcard, using the meaning and example shown on the page. */
export async function saveDictionaryWordAction(
  input: z.input<typeof Input>,
): Promise<{ ok: true; cardId: string } | { ok: false; error: string }> {
  const user = await requireUser();
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid word" };
  if (!checkRateLimit(user.id, "vocabulary")) return { ok: false, error: RATE_LIMIT_MESSAGE };
  const { word, gender, meaning, example } = parsed.data;
  try {
    // A typed article tells getOrCreateWord that this is a noun and which article it takes.
    const text = gender ? `${gender === "HET" ? "het" : "de"} ${word}` : word;
    const { word: saved } = await getOrCreateWord(text, { userId: user.id, meaning, example: example ?? undefined });
    const card = await addCardForUser({ userId: user.id, wordId: saved.id });
    revalidatePath("/vocabulary");
    return { ok: true, cardId: card.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Couldn't save this word. Try again." };
  }
}
