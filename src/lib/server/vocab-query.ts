import "server-only";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "../db";
import { CEFR_LEVELS, PARTS_OF_SPEECH } from "../constants";
import { addDays, endOfLocalDay } from "./dates";

export const VocabFilterSchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  level: z.enum(CEFR_LEVELS).optional().catch(undefined),
  topic: z.string().max(80).optional().catch(undefined),
  pos: z.enum(PARTS_OF_SPEECH).optional().catch(undefined),
  status: z.enum(["new", "learning", "due", "mature", "difficult", "failed", "suspended"]).optional().catch(undefined),
  added: z.enum(["7", "30", "90"]).optional().catch(undefined),
  sort: z.enum(["recent", "alpha", "topic", "importance", "due", "difficulty"]).default("recent").catch("recent"),
  page: z.coerce.number().int().min(1).default(1).catch(1),
});
export type VocabFilters = z.infer<typeof VocabFilterSchema>;

export const PAGE_SIZE = 50;

export function buildVocabWhere(userId: string, f: VocabFilters, timeZone: string): Prisma.VocabularyCardWhereInput {
  const where: Prisma.VocabularyCardWhereInput = { userId };
  const word: Prisma.VocabularyWordWhereInput = {};
  if (f.q) {
    where.OR = [
      { word: { lemma: { contains: f.q, mode: "insensitive" } } },
      { word: { english: { contains: f.q, mode: "insensitive" } } },
      { personalNote: { contains: f.q, mode: "insensitive" } },
    ];
  }
  if (f.level) word.cefrLevel = f.level;
  if (f.pos) word.partOfSpeech = f.pos;
  if (f.topic) word.topics = { some: { topic: { slug: f.topic } } };
  if (Object.keys(word).length) where.word = word;
  const now = new Date();
  switch (f.status) {
    case "new": where.state = "NEW"; break;
    case "learning": where.state = { in: ["LEARNING", "RELEARNING"] }; break;
    case "due": where.state = { not: "NEW" }; where.due = { lte: endOfLocalDay(now, timeZone) }; break;
    case "mature": where.state = "REVIEW"; where.scheduledDays = { gte: 21 }; break;
    case "difficult": where.AND = [{ OR: [{ lapses: { gte: 2 } }, { difficulty: { gte: 7 } }] }]; break;
    case "failed": where.lastFailedAt = { gte: addDays(now, -7) }; break;
    case "suspended": where.suspended = true; break;
  }
  if (f.added) where.createdAt = { gte: addDays(now, -Number(f.added)) };
  return where;
}

const ORDER: Record<Exclude<VocabFilters["sort"], "topic">, Prisma.VocabularyCardOrderByWithRelationInput[]> = {
  recent: [{ createdAt: "desc" }],
  alpha: [{ word: { normalized: "asc" } }],
  importance: [{ importance: "desc" }, { createdAt: "desc" }],
  due: [{ due: "asc" }],
  difficulty: [{ difficulty: "desc" }, { lapses: "desc" }],
};

const cardSelect = {
  id: true, state: true, due: true, importance: true, lapses: true, difficulty: true, scheduledDays: true,
  createdAt: true, suspended: true, personalNote: true,
  word: {
    select: {
      id: true, lemma: true, normalized: true, english: true, partOfSpeech: true, article: true, cefrLevel: true,
      topics: { select: { topic: { select: { slug: true, name: true } } } },
    },
  },
} satisfies Prisma.VocabularyCardSelect;

export type VocabRow = Prisma.VocabularyCardGetPayload<{ select: typeof cardSelect }>;

export async function queryVocabulary(userId: string, f: VocabFilters, timeZone: string) {
  const where = buildVocabWhere(userId, f, timeZone);
  const total = await db.vocabularyCard.count({ where });
  let rows: VocabRow[];
  if (f.sort === "topic") {
    // Topic is a many-to-many, so sort in memory (personal decks are small).
    const all = await db.vocabularyCard.findMany({ where, select: cardSelect, take: 3000 });
    const key = (r: VocabRow) => r.word.topics.map((t) => t.topic.name).sort()[0] ?? "~";
    rows = all
      .sort((a, b) => key(a).localeCompare(key(b)) || a.word.normalized.localeCompare(b.word.normalized))
      .slice((f.page - 1) * PAGE_SIZE, f.page * PAGE_SIZE);
  } else {
    rows = await db.vocabularyCard.findMany({
      where,
      select: cardSelect,
      orderBy: ORDER[f.sort],
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  }
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
