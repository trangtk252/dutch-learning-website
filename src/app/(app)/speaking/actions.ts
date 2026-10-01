"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { AIError } from "@/lib/ai";
import { evaluateSpeaking, generateConversationResponse } from "@/lib/ai/services/conversation";
import { CEFR_LEVELS, SCENARIOS, SCENARIO_INFO, type ScenarioKey } from "@/lib/constants";
import { recordMistakes } from "@/lib/server/mistakes";
import { logStudy } from "@/lib/server/progress";
import { addDays } from "@/lib/server/dates";
import { checkRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/server/rate-limit";
import type { ChatTurn } from "@/lib/ai/types";

const MAX_HISTORY = 30;
const MAX_TURNS = 60;

export async function startConversationAction(formData: FormData) {
  const { user, profile } = await requireProfile();
  const parsed = z
    .object({ scenario: z.enum(SCENARIOS), level: z.enum(CEFR_LEVELS) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/speaking");
  const { scenario, level } = parsed.data;
  let id: string;
  try {
    const opening = await generateConversationResponse({ scenario, level, learnerName: user.name, history: [] });
    const conv = await db.conversation.create({
      data: {
        userId: user.id,
        scenario,
        level,
        title: SCENARIO_INFO[scenario].label,
        messages: { create: { role: "ASSISTANT", content: opening.reply, english: opening.english } },
        retainUntil: profile.storeConversations && profile.conversationRetentionDays > 0 ? addDays(new Date(), profile.conversationRetentionDays) : null,
      },
    });
    id = conv.id;
  } catch (e) {
    console.error(e);
    redirect(`/speaking?error=${e instanceof AIError ? e.code : "unavailable"}`);
  }
  redirect(`/speaking/${id}`);
}

export interface ChatMessageDTO {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  english: string | null;
  corrections: { original: string; corrected: string; category: string; explanation: string }[];
}

const SendSchema = z.object({
  conversationId: z.string().max(40),
  text: z.string().trim().min(1).max(1000),
  inputMode: z.enum(["TEXT", "VOICE"]),
});

export async function sendMessageAction(input: z.input<typeof SendSchema>): Promise<
  { ok: true; user: ChatMessageDTO; reply: ChatMessageDTO; newWords: { dutch: string; english: string }[] } | { ok: false; error: string }
> {
  const { user } = await requireProfile();
  const data = SendSchema.safeParse(input);
  if (!data.success) return { ok: false, error: "Message is empty or too long." };
  const conv = await db.conversation.findFirst({
    where: { id: data.data.conversationId, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conv) return { ok: false, error: "Conversation not found." };
  if (conv.endedAt) return { ok: false, error: "This conversation has ended." };
  if (!checkRateLimit(user.id, "conversation")) return { ok: false, error: RATE_LIMIT_MESSAGE };
  if (conv.messages.length >= MAX_TURNS) return { ok: false, error: "This conversation is getting long — finish it to get your feedback, then start a new one." };

  const history: ChatTurn[] = [
    ...conv.messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role === "USER" ? ("user" as const) : ("assistant" as const), content: m.content })),
    { role: "user", content: data.data.text },
  ];
  try {
    const res = await generateConversationResponse({
      scenario: conv.scenario as ScenarioKey,
      level: conv.level,
      learnerName: user.name,
      history,
    });
    const corrections = res.corrections.filter((c) => c.original.trim() !== c.corrected.trim()).slice(0, 5);
    const userMsg = await db.conversationMessage.create({
      data: {
        conversationId: conv.id,
        role: "USER",
        content: data.data.text,
        inputMode: data.data.inputMode,
        corrections: { create: corrections },
      },
    });
    const reply = await db.conversationMessage.create({
      data: { conversationId: conv.id, role: "ASSISTANT", content: res.reply, english: res.english },
    });
    await recordMistakes({ userId: user.id, source: "SPEAKING", level: conv.level, sourceRef: conv.id, items: corrections });
    return {
      ok: true,
      user: { id: userMsg.id, role: "USER", content: userMsg.content, english: null, corrections },
      reply: { id: reply.id, role: "ASSISTANT", content: reply.content, english: reply.english, corrections: [] },
      newWords: res.newWords.slice(0, 3),
    };
  } catch (e) {
    return { ok: false, error: e instanceof AIError ? e.message : "The tutor couldn't reply. Please try again." };
  }
}

export async function finishConversationAction(conversationId: string): Promise<{ ok: boolean; error?: string }> {
  const { user, profile } = await requireProfile();
  const conv = await db.conversation.findFirst({
    where: { id: conversationId, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } }, feedback: true },
  });
  if (!conv) return { ok: false, error: "Not found" };
  if (conv.feedback) return { ok: true };
  const learnerTurns = conv.messages.filter((m) => m.role === "USER");
  if (learnerTurns.length === 0) {
    await db.conversation.delete({ where: { id: conv.id } });
    redirect("/speaking");
  }
  try {
    const ev = await evaluateSpeaking({
      level: conv.level,
      scenario: conv.scenario as ScenarioKey,
      transcript: conv.messages.map((m) => ({ role: m.role === "USER" ? "user" : "assistant", content: m.content })),
    });
    const endedAt = new Date();
    await db.$transaction([
      db.speakingFeedback.create({
        data: {
          conversationId: conv.id,
          grammarScore: ev.grammar.score, grammarNote: ev.grammar.note,
          vocabularyScore: ev.vocabulary.score, vocabularyNote: ev.vocabulary.note,
          fluencyScore: ev.fluency.score, fluencyNote: ev.fluency.note,
          accuracyScore: ev.accuracy.score, accuracyNote: ev.accuracy.note,
          naturalnessScore: ev.naturalness.score, naturalnessNote: ev.naturalness.note,
          summary: ev.summary,
          newVocabulary: ev.newVocabulary.slice(0, 10),
        },
      }),
      db.conversation.update({ where: { id: conv.id }, data: { endedAt } }),
      // Privacy: if the learner doesn't store conversations, drop the transcript and keep only the report.
      ...(profile.storeConversations ? [] : [db.conversationMessage.deleteMany({ where: { conversationId: conv.id } })]),
    ]);
    await logStudy({
      userId: user.id,
      skill: "SPEAKING",
      activity: "conversation",
      durationSec: Math.min(3600, (endedAt.getTime() - conv.startedAt.getTime()) / 1000),
      kind: "conversation",
    });
    revalidatePath("/speaking");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof AIError ? e.message : "Couldn't create the report. Try again." };
  }
}

export async function deleteConversationAction(conversationId: string) {
  const { user } = await requireProfile();
  await db.conversation.deleteMany({ where: { id: conversationId, userId: user.id } });
  redirect("/speaking");
}
