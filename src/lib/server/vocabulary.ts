import "server-only";
import type { CefrLevel, LearningContext, Prisma } from "@prisma/client";
import { db } from "../db";
import { generateVocabularyEntry } from "../ai/services/vocabulary";
import type { VocabularyEntry } from "../ai/schemas";
import { normalizeWord, slugify } from "../dutch/text";

export const wordInclude = {
  verb: true,
  adjective: true,
  examples: { orderBy: { order: "asc" } },
  collocations: true,
  relations: true,
  topics: { include: { topic: true } },
} satisfies Prisma.VocabularyWordInclude;

export type WordWithDetails = Prisma.VocabularyWordGetPayload<{ include: typeof wordInclude }>;

/**
 * Finds a dictionary entry by lemma or by an inflected form (plural, verb forms,
 * inflected adjective). Human-verified entries win over AI-generated ones.
 */
export async function findWordByForm(text: string): Promise<WordWithDetails | null> {
  const key = normalizeWord(text);
  if (!key) return null;
  const matches = await db.vocabularyWord.findMany({
    where: {
      OR: [
        { normalized: key },
        { plural: key },
        { diminutive: key },
        {
          verb: {
            OR: [
              { presentIk: key }, { presentJij: key }, { presentHij: key }, { presentWij: key },
              { pastSingular: key }, { pastPlural: key }, { pastParticiple: key },
            ],
          },
        },
        { adjective: { OR: [{ inflected: key }, { comparative: key }, { superlative: key }] } },
      ],
    },
    include: wordInclude,
    take: 5,
  });
  if (matches.length === 0) return null;
  return (
    matches.sort(
      (a, b) =>
        Number(b.normalized === key) - Number(a.normalized === key) ||
        Number(b.verified) - Number(a.verified),
    )[0] ?? null
  );
}

/** Batch lookup used to mark known words in readings/transcripts. Returns normalized form → word id. */
export async function findWordIdsForForms(forms: string[]): Promise<Map<string, string>> {
  const keys = [...new Set(forms.map(normalizeWord).filter(Boolean))];
  const out = new Map<string, string>();
  if (keys.length === 0) return out;
  const rows = await db.vocabularyWord.findMany({
    where: {
      OR: [
        { normalized: { in: keys } },
        { plural: { in: keys } },
        { verb: { OR: [{ presentIk: { in: keys } }, { presentHij: { in: keys } }, { presentWij: { in: keys } }, { pastSingular: { in: keys } }, { pastPlural: { in: keys } }, { pastParticiple: { in: keys } }] } },
        { adjective: { inflected: { in: keys } } },
      ],
    },
    select: {
      id: true, normalized: true, plural: true,
      verb: { select: { presentIk: true, presentHij: true, presentWij: true, pastSingular: true, pastPlural: true, pastParticiple: true } },
      adjective: { select: { inflected: true } },
    },
  });
  for (const r of rows) {
    const forms = [r.normalized, r.plural, r.adjective?.inflected, ...(r.verb ? Object.values(r.verb) : [])];
    for (const f of forms) if (f && keys.includes(f) && !out.has(f)) out.set(f, r.id);
  }
  return out;
}

const lower = (s: string | null | undefined) => (s ? s.trim().toLowerCase() : null);

/** Persists an AI-generated (or imported) entry with all related rows. */
export async function createWordFromEntry(
  entry: VocabularyEntry,
  opts: { source: "AI" | "HUMAN" | "IMPORTED"; createdById?: string; verified?: boolean },
): Promise<WordWithDetails> {
  const normalized = normalizeWord(entry.lemma);
  const existing = await db.vocabularyWord.findUnique({
    where: { normalized_partOfSpeech: { normalized, partOfSpeech: entry.partOfSpeech } },
    include: wordInclude,
  });
  if (existing) return existing;

  const topicSlugs = entry.topics.map(slugify).filter(Boolean).slice(0, 3);
  const topics = await Promise.all(
    topicSlugs.map((slug) =>
      db.topic.upsert({ where: { slug }, create: { slug, name: slug.replace(/-/g, " ") }, update: {} }),
    ),
  );

  return db.vocabularyWord.create({
    data: {
      lemma: entry.lemma.trim(),
      normalized,
      english: entry.english.trim(),
      partOfSpeech: entry.partOfSpeech,
      article: entry.partOfSpeech === "NOUN" ? entry.article : null,
      plural: lower(entry.plural),
      diminutive: lower(entry.diminutive),
      cefrLevel: entry.cefrLevel as CefrLevel | null,
      ipa: entry.ipa,
      notes: entry.notes,
      source: opts.source,
      verified: opts.verified ?? false,
      createdById: opts.createdById,
      verb:
        entry.partOfSpeech === "VERB" && entry.verb
          ? {
              create: {
                ...entry.verb,
                presentIk: entry.verb.presentIk.toLowerCase(),
                presentJij: entry.verb.presentJij.toLowerCase(),
                presentHij: entry.verb.presentHij.toLowerCase(),
                presentWij: entry.verb.presentWij.toLowerCase(),
                pastSingular: entry.verb.pastSingular.toLowerCase(),
                pastPlural: entry.verb.pastPlural.toLowerCase(),
                pastParticiple: entry.verb.pastParticiple.toLowerCase(),
              },
            }
          : undefined,
      adjective:
        entry.partOfSpeech === "ADJECTIVE" && entry.adjective
          ? {
              create: {
                inflected: entry.adjective.inflected.toLowerCase(),
                comparative: lower(entry.adjective.comparative),
                superlative: lower(entry.adjective.superlative),
              },
            }
          : undefined,
      examples: { create: entry.examples.slice(0, 4).map((e, i) => ({ ...e, order: i })) },
      collocations: { create: entry.collocations.slice(0, 6) },
      relations: {
        create: [
          ...entry.synonyms.slice(0, 5).map((text) => ({ type: "SYNONYM" as const, text })),
          ...entry.antonyms.slice(0, 3).map((text) => ({ type: "ANTONYM" as const, text })),
        ],
      },
      topics: { create: topics.map((t) => ({ topicId: t.id })) },
    },
    include: wordInclude,
  });
}

/**
 * Returns the dictionary entry for a word, creating it with AI enrichment if
 * it doesn't exist yet. Existing (especially human-verified) entries are reused.
 */
export async function getOrCreateWord(text: string, opts: { context?: string | null; userId?: string } = {}) {
  const existing = await findWordByForm(text);
  if (existing) return { word: existing, created: false };
  const entry = await generateVocabularyEntry(text, opts.context);
  const word = await createWordFromEntry(entry, { source: "AI", createdById: opts.userId });
  return { word, created: true, confidence: entry.confidence };
}

/** Adds a word to the learner's deck (idempotent). */
export async function addCardForUser(args: {
  userId: string;
  wordId: string;
  context?: LearningContext;
  contextSentence?: string | null;
  personalNote?: string | null;
  importance?: number;
}) {
  return db.vocabularyCard.upsert({
    where: { userId_wordId: { userId: args.userId, wordId: args.wordId } },
    create: {
      userId: args.userId,
      wordId: args.wordId,
      context: args.context ?? "MANUAL",
      contextSentence: args.contextSentence?.slice(0, 500) ?? null,
      personalNote: args.personalNote?.slice(0, 2000) || null,
      importance: Math.min(3, Math.max(1, args.importance ?? 2)),
    },
    update: args.personalNote ? { personalNote: args.personalNote.slice(0, 2000) } : {},
  });
}

/** Display string such as "de tafel" or "het huis". */
export function displayLemma(word: { lemma: string; article: string | null; partOfSpeech: string }) {
  if (word.partOfSpeech !== "NOUN" || !word.article) return word.lemma;
  const art = word.article === "DE_HET" ? "de/het" : word.article.toLowerCase();
  return `${art} ${word.lemma}`;
}
