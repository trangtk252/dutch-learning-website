import "server-only";
import type { AttemptKind, CefrLevel, Skill, UserProfile } from "@prisma/client";
import { db } from "../db";
import { CEFR_LEVELS, levelIndex, type SkillKey } from "../constants";
import { addDays, endOfLocalDay } from "./dates";
import { getMistakeSummary } from "./mistakes";
import { buildDailyPlan, type DailyPlan } from "../learning/plan";

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

export async function getDailyPlan(userId: string, profile: UserProfile): Promise<DailyPlan> {
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
    preferred: profile.preferredActivities as SkillKey[],
    weaknesses: profile.weaknesses as SkillKey[],
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
  });
}

export interface SkillEstimate {
  key: SkillKey | "OVERALL" | "NT2";
  label: string;
  /** 0–100, or null when there is not enough data. */
  value: number | null;
  detail: string;
}

/**
 * Practice-based progress estimates toward the learner's target level.
 * These are heuristics from in-app activity — never an official CEFR/NT2 level.
 */
export async function getProgressEstimates(userId: string, profile: UserProfile): Promise<SkillEstimate[]> {
  const target = profile.targetLevel;
  const targetIdx = levelIndex(target);
  const levelsUpToTarget = CEFR_LEVELS.slice(0, targetIdx + 1);

  const [knownWords, grammarTopics, grammarAttempts, listening, reading, speaking, writing, exams] = await Promise.all([
    db.vocabularyCard.count({ where: { userId, state: "REVIEW" } }),
    db.grammarTopic.findMany({ where: { published: true, level: { in: levelsUpToTarget } }, select: { id: true } }),
    db.attempt.findMany({
      where: { userId, kind: "GRAMMAR", completedAt: { not: null }, total: { gt: 0 } },
      select: { grammarTopicId: true, correct: true, total: true },
    }),
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
    db.attempt.findMany({
      where: { userId, kind: "MOCK_EXAM", completedAt: { not: null }, total: { gt: 0 } },
      orderBy: { completedAt: "desc" },
      take: 10,
      select: { correct: true, total: true, mockExam: { select: { skill: true } } },
    }),
  ]);

  const vocabTarget = VOCAB_TARGETS[target];
  const vocab = Math.min(100, Math.round((knownWords / vocabTarget) * 100));

  // A grammar topic counts as "solid" when its best attempt scored ≥ 80%.
  const topicIds = new Set(grammarTopics.map((t) => t.id));
  const solid = new Set(
    grammarAttempts
      .filter((a) => a.grammarTopicId && topicIds.has(a.grammarTopicId) && a.correct / a.total >= 0.8)
      .map((a) => a.grammarTopicId),
  ).size;
  const grammar = grammarTopics.length ? Math.round((solid / grammarTopics.length) * 100) : null;

  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const speakingAvg = avg(speaking.map((f) => (f.grammarScore + f.vocabularyScore + f.fluencyScore + f.accuracyScore + f.naturalnessScore) / 5));
  const writingAvg = avg(writing.map((f) => (f.grammarScore + f.vocabularyScore + f.structureScore + f.registerScore + f.coherenceScore + f.taskScore) / 6));
  const toPct = (score: number | null) => (score == null ? null : Math.round(((score - 1) / 4) * 100));

  const examBySkill = new Map<Skill, number[]>();
  for (const e of exams) {
    if (!e.mockExam) continue;
    examBySkill.set(e.mockExam.skill, [...(examBySkill.get(e.mockExam.skill) ?? []), e.correct / e.total]);
  }
  const nt2 = examBySkill.size ? Math.round((avg([...examBySkill.values()].map((xs) => xs[0])) ?? 0) * 100) : null;

  const pct = (x: number | null) => (x == null ? null : Math.round(x * 100));
  const items: SkillEstimate[] = [
    { key: "VOCABULARY", label: `Estimated ${target} vocabulary progress`, value: vocab, detail: `${knownWords} words in long-term review · ~${vocabTarget.toLocaleString("en")} words is a common ${target} estimate` },
    { key: "GRAMMAR", label: "Grammar topics mastered", value: grammar, detail: `${solid} of ${grammarTopics.length} topics up to ${target} with a quiz score ≥ 80%` },
    { key: "LISTENING", label: "Listening practice accuracy", value: pct(listening.accuracy), detail: listening.count ? `Last ${listening.count} exercises` : "No listening exercises yet" },
    { key: "READING", label: "Reading practice accuracy", value: pct(reading.accuracy), detail: reading.count ? `Last ${reading.count} exercises` : "No reading exercises yet" },
    { key: "SPEAKING", label: "Speaking practice estimate", value: toPct(speakingAvg), detail: speaking.length ? `Average of ${speaking.length} recent conversation reports` : "No conversation reports yet" },
    { key: "WRITING", label: "Writing practice estimate", value: toPct(writingAvg), detail: writing.length ? `Average of ${writing.length} recent texts` : "No writing submissions yet" },
  ];
  const known = items.filter((i) => i.value != null).map((i) => i.value!);
  const overall = known.length >= 3 ? Math.round(known.reduce((a, b) => a + b, 0) / known.length) : null;
  items.unshift({
    key: "OVERALL",
    label: `Estimated practice progress toward ${target}`,
    value: overall,
    detail: overall == null ? "Practise a few skills to see an estimate" : "Average of the skill estimates below — not an official level",
  });
  if (profile.preparingNt2) {
    items.push({
      key: "NT2",
      label: "NT2 practice readiness",
      value: nt2,
      detail: nt2 == null ? "Take a practice exam to see your readiness" : `Latest practice exam per skill · pass mark ~60%`,
    });
  }
  return items;
}

/** Grammar lesson that best addresses the learner's most frequent recent mistakes. */
export async function getRecommendedGrammar(userId: string, level: CefrLevel) {
  const mistakes = await getMistakeSummary(userId);
  const top = mistakes.find((m) => m.recent > 0) ?? mistakes[0];
  if (top) {
    const topic = await db.grammarTopic.findFirst({
      where: { published: true, remedies: { has: top.category } },
      orderBy: { order: "asc" },
    });
    if (topic) return { topic, reason: { category: top.category, count: top.recent || top.total } };
  }
  const attempted = await db.attempt.findMany({ where: { userId, kind: "GRAMMAR" }, select: { grammarTopicId: true } });
  const done = attempted.map((a) => a.grammarTopicId).filter(Boolean) as string[];
  const levels = CEFR_LEVELS.slice(0, levelIndex(level) + 2);
  const topic = await db.grammarTopic.findFirst({
    where: { published: true, id: { notIn: done }, level: { in: levels } },
    orderBy: [{ order: "asc" }],
  });
  return topic ? { topic, reason: null } : null;
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
      where: { published: true, level: { in: levels }, attempts: { none: { userId } } },
      orderBy: [{ level: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  return { reading, listening };
}
