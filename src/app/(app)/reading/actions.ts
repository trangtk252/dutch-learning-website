"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { AIError } from "@/lib/ai";
import { generateReadingExercise } from "@/lib/ai/services/content";
import { countWords, estimateReadingMinutes, slugify } from "@/lib/dutch/text";
import { findWordByForm } from "@/lib/server/vocabulary";
import { checkRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/server/rate-limit";
import { CEFR_LEVELS } from "@/lib/constants";

const Input = z.object({
  level: z.enum(CEFR_LEVELS),
  genre: z.enum(["STORY", "NEWS", "EVERYDAY", "EMAIL", "WORKPLACE", "CULTURE", "OPINION", "FORMAL"]),
  topic: z.string().trim().min(3).max(120),
});

/** Drop malformed AI questions (e.g. multiple choice without exactly one right answer). */
function validQuestion(q: { type: string; options: { isCorrect: boolean }[] }) {
  const right = q.options.filter((o) => o.isCorrect).length;
  if (q.type === "FILL_BLANK") return right >= 1 && right === q.options.length;
  return q.options.length >= 2 && right === 1;
}

export async function generateReadingAction(_prev: { error?: string } | null, formData: FormData) {
  const user = await requireUser();
  if (!checkRateLimit(user.id, "generate")) return { error: RATE_LIMIT_MESSAGE };
  const parsed = Input.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please choose a level, text type and topic." };
  let slug: string;
  try {
    const draft = await generateReadingExercise(parsed.data);
    const wordCount = countWords(draft.body);
    slug = `${slugify(draft.title)}-${Date.now().toString(36)}`;
    const keyWords = (await Promise.all(draft.keyWords.slice(0, 10).map((w) => findWordByForm(w)))).filter(Boolean);
    await db.readingExercise.create({
      data: {
        slug,
        title: draft.title,
        level: parsed.data.level,
        genre: parsed.data.genre,
        summaryEn: draft.summaryEn,
        body: draft.body,
        wordCount,
        readingMinutes: estimateReadingMinutes(wordCount, parsed.data.level),
        source: "AI",
        questions: {
          create: draft.questions.filter(validQuestion).map((q, i) => ({
            type: q.type,
            focus: q.focus,
            prompt: q.prompt,
            explanation: q.explanation,
            order: i,
            options: { create: q.options.map((o, j) => ({ text: o.text, isCorrect: o.isCorrect, order: j })) },
          })),
        },
        words: { create: [...new Set(keyWords.map((w) => w!.id))].map((wordId) => ({ wordId })) },
      },
    });
  } catch (e) {
    if (e instanceof AIError) return { error: e.message };
    console.error(e);
    return { error: "Could not generate a text right now." };
  }
  redirect(`/reading/${slug}`);
}
