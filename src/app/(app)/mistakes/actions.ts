"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { AIError } from "@/lib/ai";
import { analyzeUserMistakes } from "@/lib/ai/services/coach";
import type { MistakeAnalysis } from "@/lib/ai/schemas";
import { addDays } from "@/lib/server/dates";

export async function analyzeMistakesAction(): Promise<{ ok: true; analysis: MistakeAnalysis } | { ok: false; error: string }> {
  const user = await requireUser();
  const mistakes = await db.userMistake.findMany({
    where: { userId: user.id, createdAt: { gte: addDays(new Date(), -60) } },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: { category: true, original: true, corrected: true },
  });
  if (mistakes.length === 0) return { ok: false, error: "No recent mistakes to analyse yet." };
  try {
    return { ok: true, analysis: await analyzeUserMistakes(mistakes) };
  } catch (e) {
    return { ok: false, error: e instanceof AIError ? e.message : "Analysis failed." };
  }
}

export async function deleteMistakeAction(id: string) {
  const user = await requireUser();
  await db.userMistake.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/mistakes");
}

export async function clearMistakesAction() {
  const user = await requireUser();
  await db.userMistake.deleteMany({ where: { userId: user.id } });
  revalidatePath("/mistakes");
}
