import "server-only";
import type { Skill } from "@prisma/client";
import { db } from "../db";
import { addDays, computeStreak, localDay } from "./dates";

const XP: Record<string, number> = { review: 1, exercise: 10, conversation: 15, writing: 15, exam: 25 };

/**
 * Records study activity: one StudySession row plus the per-day rollup used for
 * streaks and goals. Call after every completed activity.
 */
export async function logStudy(args: {
  userId: string;
  skill: Skill;
  activity: string;
  durationSec: number;
  kind: keyof typeof XP;
  units?: number;
  timeZone?: string;
}) {
  const units = args.units ?? 1;
  const xp = XP[args.kind] * units;
  const tz = args.timeZone ?? (await getTimeZone(args.userId));
  const date = localDay(new Date(), tz);
  const minutes = Math.max(0, Math.round(args.durationSec / 60));
  const isReview = args.kind === "review";

  await db.$transaction([
    db.studySession.create({
      data: {
        userId: args.userId,
        skill: args.skill,
        activity: args.activity,
        durationSec: Math.max(0, Math.round(args.durationSec)),
        xp,
      },
    }),
    db.dailyActivity.upsert({
      where: { userId_date: { userId: args.userId, date } },
      create: {
        userId: args.userId,
        date,
        minutes,
        xp,
        reviews: isReview ? units : 0,
        exercises: isReview ? 0 : 1,
      },
      update: {
        minutes: { increment: minutes },
        xp: { increment: xp },
        reviews: { increment: isReview ? units : 0 },
        exercises: { increment: isReview ? 0 : 1 },
      },
    }),
  ]);
}

export async function getTimeZone(userId: string): Promise<string> {
  const p = await db.userProfile.findUnique({ where: { userId }, select: { timezone: true } });
  return p?.timezone ?? "Europe/Amsterdam";
}

export async function getActivitySummary(userId: string, timeZone: string) {
  const today = localDay(new Date(), timeZone);
  const since = addDays(today, -400);
  const days = await db.dailyActivity.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "asc" },
  });
  const active = days.filter((d) => d.minutes > 0 || d.reviews > 0 || d.exercises > 0);
  const todayRow = days.find((d) => d.date.getTime() === today.getTime());
  const weekStart = addDays(today, -6);
  const lastWeek = days.filter((d) => d.date >= weekStart);
  return {
    streak: computeStreak(active.map((d) => d.date), today),
    todayMinutes: todayRow?.minutes ?? 0,
    todayXp: todayRow?.xp ?? 0,
    activeDaysThisWeek: lastWeek.filter((d) => d.minutes > 0 || d.reviews > 0 || d.exercises > 0).length,
    totalXp: days.reduce((n, d) => n + d.xp, 0),
    last7: Array.from({ length: 7 }, (_, i) => {
      const day = addDays(today, i - 6);
      const row = days.find((d) => d.date.getTime() === day.getTime());
      return { date: day, minutes: row?.minutes ?? 0 };
    }),
  };
}

export async function getDailyMinutes(userId: string, timeZone: string, days: number) {
  const today = localDay(new Date(), timeZone);
  const rows = await db.dailyActivity.findMany({ where: { userId, date: { gte: addDays(today, -(days - 1)) } } });
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i - days + 1);
    return { date: day, minutes: rows.find((r) => r.date.getTime() === day.getTime())?.minutes ?? 0 };
  });
}

/** Awards milestone badges whose conditions are met. Subtle by design. */
export async function awardAchievements(userId: string, streak: number) {
  const [cards, reviews, conversations, writing, exams, earned, all] = await Promise.all([
    db.vocabularyCard.count({ where: { userId } }),
    db.review.count({ where: { userId } }),
    db.conversation.count({ where: { userId, endedAt: { not: null } } }),
    db.writingSubmission.count({ where: { userId } }),
    db.attempt.count({ where: { userId, kind: "MOCK_EXAM", completedAt: { not: null } } }),
    db.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
    db.achievement.findMany(),
  ]);
  const met: Record<string, boolean> = {
    "first-word": cards >= 1,
    "words-50": cards >= 50,
    "reviews-100": reviews >= 100,
    "streak-7": streak >= 7,
    "first-conversation": conversations >= 1,
    "first-writing": writing >= 1,
    "first-mock-exam": exams >= 1,
  };
  const have = new Set(earned.map((e) => e.achievementId));
  const toAward = all.filter((a) => met[a.code] && !have.has(a.id));
  if (toAward.length) {
    await db.userAchievement.createMany({ data: toAward.map((a) => ({ userId, achievementId: a.id })), skipDuplicates: true });
  }
}
