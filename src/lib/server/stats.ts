import "server-only";
import type { AttemptKind, CefrLevel, UserProfile } from "@prisma/client";
import { db } from "../db";
import { jsonList } from "../json-list";
import { CEFR_LEVELS, levelIndex, type SkillKey } from "../constants";
import { addDays, endOfLocalDay } from "./dates";
import { getMistakeSummary } from "./mistakes";
import { buildDailyPlan, type DailyPlan } from "../learning/plan";
import { makeT, type TFunction } from "../i18n/translate";

/**
 * Rough receptive-vocabulary sizes often associated with each CEFR level.
 * Used ONLY to show an "estimated vocabulary progress" bar — not a test result.
 */
export const VOCAB_TARGETS: Record<CefrLevel, number> = { A1: 500, A2: 1000, B1: 2000, B2: 4000, C1: 8000 };

export async function getCardCounts(userId: string, timeZone: string) {
  const now = new Date();
  const endOfToday = endOfLocalDay(now, timeZone);
  const [total, due, fresh, learning, mature, difficult, recentlyFailed] = await Promise.all([
    db.vocabularyCard.count({ where: { userId, suspended: false } }),
    db.vocabularyCard.count({ where: { userId, suspended: false, state: { not: "NEW" }, due: { lte: endOfToday } } }),
    db.vocabularyCard.count({ where: { userId, suspended: false, state: "NEW" } }),
    db.vocabularyCard.count({ where: { userId, suspended: false, state: { in: ["LEARNING", "RELEARNING"] } } }),
    db.vocabularyCard.count({ where: { userId, state: "REVIEW", scheduledDays: { gte: 21 } } }),
    db.vocabularyCard.count({ where: { userId, OR: [{ lapses: { gte: 2 } }, { difficulty: { gte: 7 } }] } }),
    db.vocabularyCard.count({ where: { userId, lastFailedAt: { gte: addDays(now, -7) } } }),
  ]);
  return { total, due, new: fresh, learning, mature, difficult, recentlyFailed };
}

/** Accuracy over the most recent attempts of one kind (null when no data). */
async function recentAccuracy(userId: string, kind: AttemptKind, take = 10) {
  const attempts = await db.attempt.findMany({
    where: { userId, kind, completedAt: { not: null }, total: { gt: 0 } },
    orderBy: { completedAt: "desc" },
    take,
    select: { correct: true, total: true, completedAt: true },
  });
  if (attempts.length === 0) return { accuracy: null, count: 0, last: null as Date | null };
  const c = attempts.reduce((n, a) => n + a.correct, 0);
  const t = attempts.reduce((n, a) => n + a.total, 0);
  return { accuracy: c / t, count: attempts.length, last: attempts[0].completedAt };
}

async function lastPractised(userId: string): Promise<Partial<Record<SkillKey, number | null>>> {
  const rows = await db.studySession.groupBy({ by: ["skill"], where: { userId }, _max: { createdAt: true } });
  const out: Partial<Record<SkillKey, number | null>> = {};
  const now = Date.now();
  for (const r of rows) {
    out[r.skill as SkillKey] = r._max.createdAt ? Math.floor((now - r._max.createdAt.getTime()) / 86_400_000) : null;
  }
  return out;
}

export async function getDailyPlan(userId: string, profile: UserProfile, t: TFunction = makeT(null)): Promise<DailyPlan> {
  const [cards, listening, reading, grammar, since, mistakes] = await Promise.all([
    getCardCounts(userId, profile.timezone),
    recentAccuracy(userId, "LISTENING"),
    recentAccuracy(userId, "READING"),
    recentAccuracy(userId, "GRAMMAR"),
    lastPractised(userId),
    getMistakeSummary(userId),
  ]);
  return buildDailyPlan({
    dailyMinutes: profile.dailyMinutes,
    dueCards: cards.due,
    newCardsAvailable: Math.min(cards.new, profile.newCardsPerDay),
    preferred: jsonList<SkillKey>(profile.preferredActivities),
    weaknesses: jsonList<SkillKey>(profile.weaknesses),
    accuracy: { LISTENING: listening.accuracy, READING: reading.accuracy, GRAMMAR: grammar.accuracy },
    daysSince: {
      LISTENING: since.LISTENING ?? null,
      READING: since.READING ?? null,
      SPEAKING: since.SPEAKING ?? null,
      GRAMMAR: since.GRAMMAR ?? null,
      WRITING: since.WRITING ?? null,
    },
    recentMistakes: mistakes.filter((m) => m.recent > 0).map((m) => ({ category: m.category, count: m.recent })),
    preparingNt2: profile.preparingNt2,
    examDate: profile.examDate,
  }, t);
}

export interface SkillEstimate {
  key: SkillKey | "OVERALL";
  label: string;
  /** 0–100, or null when there is not enough data. */
  value: number | null;
  detail: string;
}

/**
 * Practice-based progress estimates toward the learner's target level.
 * These are heuristics from in-app activity — never an official CEFR level.
 */
export async function getProgressEstimates(userId: string, profile: UserProfile, t: TFunction = makeT(null)): Promise<SkillEstimate[]> {
  const target = profile.targetLevel;

  const [knownWords, listening, reading, speaking, writing] = await Promise.all([
    db.vocabularyCard.count({ where: { userId, state: "REVIEW" } }),
    recentAccuracy(userId, "LISTENING"),
    recentAccuracy(userId, "READING"),
    db.speakingFeedback.findMany({
      where: { conversation: { userId, startedAt: { gte: addDays(new Date(), -60) } } },
      select: { grammarScore: true, vocabularyScore: true, fluencyScore: true, accuracyScore: true, naturalnessScore: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    db.writingFeedback.findMany({
      where: { submission: { userId } },
      select: { grammarScore: true, vocabularyScore: true, structureScore: true, registerScore: true, coherenceScore: true, taskScore: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const vocabTarget = VOCAB_TARGETS[target];
  const vocab = Math.min(100, Math.round((knownWords / vocabTarget) * 100));

  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const speakingAvg = avg(speaking.map((f) => (f.grammarScore + f.vocabularyScore + f.fluencyScore + f.accuracyScore + f.naturalnessScore) / 5));
  const writingAvg = avg(writing.map((f) => (f.grammarScore + f.vocabularyScore + f.structureScore + f.registerScore + f.coherenceScore + f.taskScore) / 6));
  const toPct = (score: number | null) => (score == null ? null : Math.round(((score - 1) / 4) * 100));

  const pct = (x: number | null) => (x == null ? null : Math.round(x * 100));
  const items: SkillEstimate[] = [
    { key: "VOCABULARY", label: t("Estimated {target} vocabulary progress", { target }), value: vocab, detail: t("{n} words in long-term review · ~{total} words is a common {target} estimate", { n: knownWords, total: vocabTarget.toLocaleString("en"), target }) },
    { key: "LISTENING", label: t("Listening practice accuracy"), value: pct(listening.accuracy), detail: listening.count ? t("Last {n} exercises", { n: listening.count }) : t("No listening exercises yet") },
    { key: "READING", label: t("Reading practice accuracy"), value: pct(reading.accuracy), detail: reading.count ? t("Last {n} exercises", { n: reading.count }) : t("No reading exercises yet") },
    { key: "SPEAKING", label: t("Speaking practice estimate"), value: toPct(speakingAvg), detail: speaking.length ? t("Average of {n} recent conversation reports", { n: speaking.length }) : t("No conversation reports yet") },
    { key: "WRITING", label: t("Writing practice estimate"), value: toPct(writingAvg), detail: writing.length ? t("Average of {n} recent texts", { n: writing.length }) : t("No writing submissions yet") },
  ];
  const known = items.filter((i) => i.value != null).map((i) => i.value!);
  const overall = known.length >= 3 ? Math.round(known.reduce((a, b) => a + b, 0) / known.length) : null;
  items.unshift({
    key: "OVERALL",
    label: t("Estimated practice progress toward {target}", { target }),
    value: overall,
    detail: overall == null ? t("Practise a few skills to see an estimate") : t("Average of the skill estimates below — not an official level"),
  });
  return items;
}

/** Next unattempted reading/listening at the learner's level (i or i+1). */
export async function getNextExercises(userId: string, level: CefrLevel) {
  const levels = [level, CEFR_LEVELS[Math.min(levelIndex(level) + 1, CEFR_LEVELS.length - 1)]];
  const [reading, listening] = await Promise.all([
    db.readingExercise.findFirst({
      where: { published: true, level: { in: levels }, attempts: { none: { userId } } },
      orderBy: [{ level: "asc" }, { createdAt: "asc" }],
    }),
    db.listeningExercise.findFirst({
      where: { published: true, ownerId: null, level: { in: levels }, attempts: { none: { userId } } },
      orderBy: [{ level: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  return { reading, listening };
}
