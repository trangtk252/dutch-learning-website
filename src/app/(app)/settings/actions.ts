"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { requireProfile, requireUser } from "@/lib/session";
import { FONT_SCALE_COOKIE } from "@/lib/constants";
import { ProfileSchema, safeTimeZone } from "@/lib/validation/profile";

type State = { ok?: boolean; error?: string } | null;

const checkboxes = (fd: FormData, name: string) => fd.getAll(name).map(String);

export async function saveProfileAction(_prev: State, fd: FormData): Promise<State> {
  const { user } = await requireProfile();
  const parsed = ProfileSchema.safeParse({
    currentLevel: fd.get("currentLevel"),
    targetLevel: fd.get("targetLevel"),
    motivation: fd.get("motivation") ?? "",
    preparingNt2: fd.get("preparingNt2") === "on",
    nt2Program: fd.get("nt2Program") ?? "NONE",
    examDate: fd.get("examDate") || undefined,
    dailyMinutes: fd.get("dailyMinutes"),
    preferredActivities: checkboxes(fd, "preferredActivities"),
    strengths: checkboxes(fd, "strengths"),
    weaknesses: checkboxes(fd, "weaknesses"),
    timezone: fd.get("timezone") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const extra = z
    .object({ weeklyGoalDays: z.coerce.number().int().min(1).max(7), newCardsPerDay: z.coerce.number().int().min(0).max(50) })
    .safeParse({ weeklyGoalDays: fd.get("weeklyGoalDays"), newCardsPerDay: fd.get("newCardsPerDay") });
  if (!extra.success) return { error: "Check your weekly goal and new cards per day." };
  const p = parsed.data;
  await db.userProfile.update({
    where: { userId: user.id },
    data: {
      currentLevel: p.currentLevel, targetLevel: p.targetLevel, motivation: p.motivation || null,
      preparingNt2: p.preparingNt2, nt2Program: p.preparingNt2 && p.nt2Program === "NONE" ? "PROGRAMMA_I" : p.nt2Program,
      examDate: p.examDate, dailyMinutes: p.dailyMinutes, preferredActivities: p.preferredActivities,
      strengths: p.strengths, weaknesses: p.weaknesses, timezone: safeTimeZone(p.timezone), ...extra.data,
    },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveDisplayAction(_prev: State, fd: FormData): Promise<State> {
  const { user } = await requireProfile();
  const fontScale = z.coerce.number().int().min(85).max(150).safeParse(fd.get("fontScale"));
  if (!fontScale.success) return { error: "Invalid font size" };
  await db.userProfile.update({ where: { userId: user.id }, data: { fontScale: fontScale.data } });
  (await cookies()).set(FONT_SCALE_COOKIE, String(fontScale.data), { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function savePrivacyAction(_prev: State, fd: FormData): Promise<State> {
  const { user } = await requireProfile();
  const days = z.coerce.number().int().min(0).max(3650).safeParse(fd.get("conversationRetentionDays"));
  if (!days.success) return { error: "Invalid retention period" };
  const store = fd.get("storeConversations") === "on";
  await db.userProfile.update({ where: { userId: user.id }, data: { storeConversations: store, conversationRetentionDays: days.data } });
  // Apply the new retention to existing conversations.
  const conversations = await db.conversation.findMany({ where: { userId: user.id }, select: { id: true, startedAt: true } });
  await db.$transaction(
    conversations.map((c) =>
      db.conversation.update({
        where: { id: c.id },
        data: { retainUntil: !store ? new Date() : days.data > 0 ? new Date(c.startedAt.getTime() + days.data * 86_400_000) : null },
      }),
    ),
  );
  if (!store) await db.conversationMessage.deleteMany({ where: { conversation: { userId: user.id, endedAt: { not: null } } } });
  revalidatePath("/settings");
  return { ok: true };
}

const HISTORY_PARTS = ["vocabulary", "conversations", "writing", "mistakes", "attempts", "activity"] as const;

export async function deleteHistoryAction(_prev: State, fd: FormData): Promise<State> {
  const user = await requireUser();
  const parts = fd.getAll("parts").map(String).filter((p): p is (typeof HISTORY_PARTS)[number] => (HISTORY_PARTS as readonly string[]).includes(p));
  if (parts.length === 0) return { error: "Select what to delete." };
  const where = { userId: user.id };
  await db.$transaction([
    ...(parts.includes("vocabulary") ? [db.vocabularyCard.deleteMany({ where })] : []),
    ...(parts.includes("conversations") ? [db.conversation.deleteMany({ where })] : []),
    ...(parts.includes("writing") ? [db.writingSubmission.deleteMany({ where })] : []),
    ...(parts.includes("mistakes") ? [db.userMistake.deleteMany({ where })] : []),
    ...(parts.includes("attempts") ? [db.attempt.deleteMany({ where })] : []),
    ...(parts.includes("activity") ? [db.studySession.deleteMany({ where }), db.dailyActivity.deleteMany({ where }), db.userAchievement.deleteMany({ where })] : []),
  ]);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteAccountAction(_prev: State, fd: FormData): Promise<State> {
  const user = await requireUser();
  if (String(fd.get("confirm") ?? "").trim().toLowerCase() !== user.email.toLowerCase()) {
    return { error: "Type your email address exactly to confirm." };
  }
  // Content the learner authored for others (AI-created dictionary entries, blog posts) is kept but unlinked (SetNull).
  await db.user.delete({ where: { id: user.id } });
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {}
  (await cookies()).delete(FONT_SCALE_COOKIE);
  redirect("/?deleted=1");
}

export async function updateNameAction(_prev: State, fd: FormData): Promise<State> {
  const user = await requireUser();
  const name = z.string().trim().min(1).max(80).safeParse(fd.get("name"));
  if (!name.success) return { error: "Enter a name (max 80 characters)." };
  await db.user.update({ where: { id: user.id }, data: { name: name.data } });
  revalidatePath("/", "layout");
  return { ok: true };
}
