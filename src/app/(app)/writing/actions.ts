"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { AIError } from "@/lib/ai";
import { correctDutchText } from "@/lib/ai/services/language";
import { countWords } from "@/lib/dutch/text";
import { recordMistakes } from "@/lib/server/mistakes";
import { logStudy } from "@/lib/server/progress";

const Input = z.object({
  promptId: z.string().max(40).optional().transform((v) => v || undefined),
  task: z.string().trim().max(500).optional(),
  text: z.string().trim().min(10, "Write at least a sentence or two.").max(6000, "That's too long (max ~1,000 words)."),
  startedAt: z.coerce.number().optional(),
});

export async function submitWritingAction(_prev: { error?: string } | null, formData: FormData) {
  const { user, profile } = await requireProfile();
  const parsed = Input.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { promptId, text, task } = parsed.data;
  const prompt = promptId ? await db.writingPrompt.findUnique({ where: { id: promptId } }) : null;
  if (!prompt && !task) return { error: "Describe what you're writing (e.g. 'an email to my landlord')." };

  let submissionId: string;
  try {
    const level = prompt?.level ?? profile.targetLevel;
    const evaluation = await correctDutchText({
      text,
      level,
      task: prompt ? `${prompt.title}. ${prompt.instructions} (${prompt.minWords}–${prompt.maxWords} words)` : task!,
      register: prompt?.register ?? null,
    });
    const s = evaluation.scores;
    const submission = await db.writingSubmission.create({
      data: {
        userId: user.id,
        promptId: prompt?.id,
        taskDescription: prompt ? null : task,
        text,
        wordCount: countWords(text),
        feedback: {
          create: {
            grammarScore: s.grammar, vocabularyScore: s.vocabulary, structureScore: s.structure, registerScore: s.register,
            coherenceScore: s.coherence, taskScore: s.taskCompletion, summary: evaluation.summary,
            improvedVersion: evaluation.improvedVersion, usefulVocabulary: evaluation.usefulVocabulary.slice(0, 8),
          },
        },
        corrections: { create: evaluation.corrections.slice(0, 20).map((c, order) => ({ ...c, order })) },
      },
    });
    submissionId = submission.id;
    await recordMistakes({ userId: user.id, source: "WRITING", level, sourceRef: submission.id, items: evaluation.corrections });
    const started = parsed.data.startedAt && parsed.data.startedAt < Date.now() ? parsed.data.startedAt : Date.now() - 10 * 60_000;
    await logStudy({ userId: user.id, skill: "WRITING", activity: "writing", durationSec: Math.min(3600, (Date.now() - started) / 1000), kind: "writing" });
  } catch (e) {
    if (e instanceof AIError) return { error: e.message };
    console.error(e);
    return { error: "Couldn't get feedback right now. Your text was not lost — copy it and try again." };
  }
  redirect(`/writing/${submissionId}`);
}

export async function deleteSubmissionAction(id: string) {
  const { user } = await requireProfile();
  await db.writingSubmission.deleteMany({ where: { id, userId: user.id } });
  redirect("/writing");
}
