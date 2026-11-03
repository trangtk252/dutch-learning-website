"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ProfileSchema, safeTimeZone, type ProfileInput } from "@/lib/validation/profile";

export async function saveOnboarding(input: ProfileInput): Promise<{ error: string } | void> {
  const user = await requireUser();
  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your answers." };
  const p = parsed.data;
  const data = {
    currentLevel: p.currentLevel,
    targetLevel: p.targetLevel,
    motivation: p.motivation || null,
    preparingNt2: p.preparingNt2,
    nt2Program: p.nt2Program,
    examDate: p.examDate,
    dailyMinutes: p.dailyMinutes,
    preferredActivities: p.preferredActivities,
    strengths: p.strengths,
    weaknesses: p.weaknesses,
    timezone: safeTimeZone(p.timezone),
    onboardedAt: new Date(),
  };
  await db.userProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data });
  redirect("/dashboard?welcome=1");
}
