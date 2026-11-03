"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { LearningContext } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { AIError } from "@/lib/ai";
import { reviewCard, type Rating } from "@/lib/srs/fsrs";
import { logStudy } from "@/lib/server/progress";
import {
  addCardForUser,
  findWordByForm,
  getOrCreateWord,
} from "@/lib/server/vocabulary";
import { toWordSummary, type WordSummary } from "@/lib/server/word-dto";
import { checkRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/server/rate-limit";
import { CEFR_LEVELS, PARTS_OF_SPEECH } from "@/lib/constants";

const WordText = z.string().trim().min(1, "Type a Dutch word").max(80, "That's too long for a single word or phrase");

function aiMessage(e: unknown) {
  if (e instanceof AIError) return e.message;
  console.error(e);
  return "Something went wrong while looking up this word.";
}

/** Quick add from the vocabulary page. */
export async function addWordAction(_prev: { error?: string } | null, formData: FormData) {
  const user = await requireUser();
  const parsed = WordText.safeParse(formData.get("word"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000) || null;
  if (!checkRateLimit(user.id, "vocabulary")) return { error: RATE_LIMIT_MESSAGE };
  let cardId: string;
  const meaning = String(formData.get("meaning") ?? "").trim().slice(0, 300);
  const example = String(formData.get("example") ?? "").trim().slice(0, 300);
  try {
    const { word } = await getOrCreateWord(parsed.data, { userId: user.id, meaning, example });
    const card = await addCardForUser({ userId: user.id, wordId: word.id, personalNote: note });
    cardId = card.id;
  } catch (e) {
    return { error: aiMessage(e) };
  }
  revalidatePath("/vocabulary");
  redirect(`/vocabulary/${cardId}?added=1`);
}

export interface LookupResult {
  word: WordSummary | null;
  cardId: string | null;
}

/** Looks a word up (by lemma or inflected form) without creating anything. */
export async function lookupWordAction(text: string): Promise<LookupResult> {
  const user = await requireUser();
  const parsed = WordText.safeParse(text);
  if (!parsed.success) return { word: null, cardId: null };
  const word = await findWordByForm(parsed.data);
  if (!word) return { word: null, cardId: null };
  const card = await db.vocabularyCard.findUnique({
    where: { userId_wordId: { userId: user.id, wordId: word.id } },
    select: { id: true },
  });
  return { word: toWordSummary(word), cardId: card?.id ?? null };
}

const ContextSave = z.object({
  text: WordText,
  sentence: z.string().max(500).optional().nullable(),
  context: z.enum(["MANUAL", "READING", "LISTENING", "SPEAKING", "WRITING", "BLOG", "GRAMMAR"]).default("MANUAL"),
  note: z.string().max(2000).optional().nullable(),
});

/** Saves a word encountered in a text/conversation, enriching it if it's new. */
export async function saveWordFromContextAction(
  input: z.input<typeof ContextSave>,
): Promise<{ ok: true; result: LookupResult } | { ok: false; error: string }> {
  const user = await requireUser();
  const parsed = ContextSave.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid word" };
  if (!checkRateLimit(user.id, "vocabulary")) return { ok: false, error: RATE_LIMIT_MESSAGE };
  try {
    const { word } = await getOrCreateWord(parsed.data.text, { context: parsed.data.sentence, userId: user.id });
    const card = await addCardForUser({
      userId: user.id,
      wordId: word.id,
      context: parsed.data.context as LearningContext,
      contextSentence: parsed.data.sentence,
      personalNote: parsed.data.note,
    });
    revalidatePath("/vocabulary");
    return { ok: true, result: { word: toWordSummary(word), cardId: card.id } };
  } catch (e) {
    return { ok: false, error: aiMessage(e) };
  }
}

/** Adds an existing dictionary word (e.g. from a reading's word list) to the deck. */
export async function addExistingWordAction(wordId: string, context: LearningContext = "MANUAL") {
  const user = await requireUser();
  const word = await db.vocabularyWord.findUnique({ where: { id: wordId }, select: { id: true } });
  if (!word) return { ok: false as const };
  const card = await addCardForUser({ userId: user.id, wordId, context });
  revalidatePath("/vocabulary");
  return { ok: true as const, cardId: card.id };
}

const CardUpdate = z.object({
  personalNote: z.string().max(2000).optional(),
  importance: z.coerce.number().int().min(1).max(3).optional(),
  suspended: z.boolean().optional(),
});

export async function updateCardAction(cardId: string, input: z.input<typeof CardUpdate>) {
  const user = await requireUser();
  const data = CardUpdate.parse(input);
  await db.vocabularyCard.updateMany({
    where: { id: cardId, userId: user.id },
    data: { ...data, personalNote: data.personalNote === undefined ? undefined : data.personalNote.trim() || null },
  });
  revalidatePath(`/vocabulary/${cardId}`);
  revalidatePath("/vocabulary");
}

export async function deleteCardAction(cardId: string) {
  const user = await requireUser();
  await db.vocabularyCard.deleteMany({ where: { id: cardId, userId: user.id } });
  revalidatePath("/vocabulary");
  redirect("/vocabulary");
}

const WordEdit = z.object({
  english: z.string().trim().min(1).max(300),
  partOfSpeech: z.enum(PARTS_OF_SPEECH),
  article: z.enum(["DE", "HET", "DE_HET", ""]).transform((v) => v || null),
  plural: z.string().trim().max(80).transform((v) => v.toLowerCase() || null),
  cefrLevel: z.enum([...CEFR_LEVELS, ""]).transform((v) => v || null),
  notes: z.string().trim().max(2000).transform((v) => v || null),
  example: z.string().trim().max(300),
  exampleEnglish: z.string().trim().max(300),
});

/**
 * Edits a shared dictionary entry. Allowed for admins, or for the learner who
 * created an unverified (AI/imported) entry. Verified entries are protected.
 */
export async function updateWordAction(cardId: string, _prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const user = await requireUser();
  const card = await db.vocabularyCard.findFirst({
    where: { id: cardId, userId: user.id },
    include: { word: true },
  });
  if (!card) return { error: "Card not found" };
  const me = await db.user.findUnique({ where: { id: user.id }, select: { role: true } });
  const canEdit = me?.role === "ADMIN" || (!card.word.verified && card.word.createdById === user.id);
  if (!canEdit) return { error: "This entry is curated and can't be edited. Add a personal note instead." };
  const parsed = WordEdit.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await db.$transaction(async (tx) => {
    await tx.vocabularyWord.update({
      where: { id: card.wordId },
      data: {
        english: d.english,
        partOfSpeech: d.partOfSpeech,
        article: d.partOfSpeech === "NOUN" ? d.article : null,
        plural: d.plural,
        cefrLevel: d.cefrLevel,
        notes: d.notes,
        verified: me?.role === "ADMIN" ? true : undefined,
      },
    });
    if (d.example) {
      await tx.wordExample.deleteMany({ where: { wordId: card.wordId, order: 0 } });
      await tx.wordExample.create({ data: { wordId: card.wordId, dutch: d.example, english: d.exampleEnglish, order: 0 } });
    }
  });
  revalidatePath(`/vocabulary/${cardId}`);
  return { ok: true };
}

/** Records a flashcard review and reschedules the card with FSRS. */
export async function rateCardAction(cardId: string, rating: Rating, durationMs: number) {
  const user = await requireUser();
  const card = await db.vocabularyCard.findFirst({ where: { id: cardId, userId: user.id } });
  if (!card) return { ok: false as const };
  const now = new Date();
  const next = reviewCard(card, rating, now);
  const failed = rating === "AGAIN";
  await db.$transaction([
    db.vocabularyCard.update({
      where: { id: card.id },
      data: {
        ...next,
        correctCount: failed ? undefined : { increment: 1 },
        incorrectCount: failed ? { increment: 1 } : undefined,
        lastFailedAt: failed ? now : undefined,
      },
    }),
    db.review.create({
      data: {
        cardId: card.id,
        userId: user.id,
        rating,
        stateBefore: card.state,
        stabilityAfter: next.stability,
        difficultyAfter: next.difficulty,
        elapsedDays: next.elapsedDays,
        scheduledDays: next.scheduledDays,
        dueAfter: next.due,
        durationMs: Math.max(0, Math.min(Math.round(durationMs), 10 * 60_000)),
      },
    }),
  ]);
  if (failed && card.state === "REVIEW") {
    // Forgetting a known word counts as a vocabulary mistake for the tracker.
    const word = await db.vocabularyWord.findUnique({ where: { id: card.wordId }, select: { lemma: true, english: true } });
    if (word) {
      await db.userMistake.create({
        data: { userId: user.id, source: "VOCABULARY", category: "VOCABULARY_CHOICE", original: `Forgot: ${word.lemma}`, corrected: `${word.lemma} = ${word.english}`, sourceRef: card.id },
      });
    }
  }
  return { ok: true as const, due: next.due.toISOString(), state: next.state };
}

/** Called once at the end of a review session to log time/XP. */
export async function finishReviewSessionAction(reviews: number, durationSec: number) {
  const user = await requireUser();
  if (reviews <= 0) return;
  await logStudy({ userId: user.id, skill: "VOCABULARY", activity: "flashcards", durationSec, kind: "review", units: reviews });
  revalidatePath("/dashboard");
}

/** Adds every word of a starter deck (topic slug nt2-a2 / nt2-b1) as a new flashcard; existing cards are untouched. */
export async function addStarterDeckAction(slug: string) {
  const user = await requireUser();
  if (!/^nt2-(a2|b1)$/.test(slug)) return { added: 0 };
  const words = await db.vocabularyWord.findMany({
    where: { topics: { some: { topic: { slug } } }, cards: { none: { userId: user.id } } },
    select: { id: true },
  });
  await db.vocabularyCard.createMany({ data: words.map((w) => ({ userId: user.id, wordId: w.id, context: "MANUAL" as const })) });
  revalidatePath("/vocabulary");
  revalidatePath("/dashboard");
  return { added: words.length };
}

/** Deletes the learner's flashcards (and their review history) for a starter deck; the shared words stay, so the deck can be re-added. */
export async function removeStarterDeckAction(slug: string) {
  const user = await requireUser();
  if (!/^nt2-(a2|b1)$/.test(slug)) return { removed: 0 };
  const r = await db.vocabularyCard.deleteMany({
    where: { userId: user.id, word: { topics: { some: { topic: { slug } } } } },
  });
  revalidatePath("/vocabulary");
  revalidatePath("/dashboard");
  return { removed: r.count };
}
