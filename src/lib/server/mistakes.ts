import "server-only";
import type { CefrLevel, ErrorCategory, MistakeSource } from "@prisma/client";
import { db } from "../db";
import { addDays } from "./dates";

export async function recordMistakes(args: {
  userId: string;
  source: MistakeSource;
  level?: CefrLevel | null;
  sourceRef?: string;
  items: { original: string; corrected: string; category: ErrorCategory; explanation?: string | null }[];
}) {
  const items = args.items.filter((m) => m.original.trim() && m.original.trim() !== m.corrected.trim());
  if (items.length === 0) return;
  await db.userMistake.createMany({
    data: items.map((m) => ({
      userId: args.userId,
      source: args.source,
      category: m.category,
      original: m.original.slice(0, 1000),
      corrected: m.corrected.slice(0, 1000),
      explanation: m.explanation?.slice(0, 2000) ?? null,
      level: args.level ?? null,
      sourceRef: args.sourceRef,
    })),
  });
}

export type Mastery = "needs-practice" | "improving" | "good";

/**
 * Mastery heuristic: recent mistakes weigh more than old ones, and correct
 * practice answers in the remedying grammar topic offset them.
 */
export function masteryFor(recent14: number, total: number, practiceAccuracy: number | null): Mastery {
  if (recent14 >= 3 || (recent14 >= 1 && (practiceAccuracy ?? 0) < 0.6)) return "needs-practice";
  if (recent14 >= 1 || (total >= 5 && (practiceAccuracy ?? 0) < 0.8)) return "improving";
  return "good";
}

export async function getMistakeSummary(userId: string) {
  const now = new Date();
  const [all, recent, lastSeen] = await Promise.all([
    db.userMistake.groupBy({ by: ["category"], where: { userId }, _count: { _all: true } }),
    db.userMistake.groupBy({
      by: ["category"],
      where: { userId, createdAt: { gte: addDays(now, -14) } },
      _count: { _all: true },
    }),
    db.userMistake.groupBy({ by: ["category"], where: { userId }, _max: { createdAt: true } }),
  ]);
  return all
    .map((row) => ({
      category: row.category,
      total: row._count._all,
      recent: recent.find((r) => r.category === row.category)?._count._all ?? 0,
      lastAt: lastSeen.find((r) => r.category === row.category)?._max.createdAt ?? null,
    }))
    .sort((a, b) => b.recent - a.recent || b.total - a.total);
}
