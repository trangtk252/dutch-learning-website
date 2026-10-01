import "server-only";
import type { Prisma } from "@prisma/client";
import { toClientQuestion, type GradableQuestion } from "../quiz/grade";

export const questionInclude = {
  orderBy: { order: "asc" },
  select: {
    id: true, type: true, prompt: true, focus: true, explanation: true,
    options: { select: { id: true, text: true, isCorrect: true, order: true } },
  },
} satisfies Prisma.ReadingExercise$questionsArgs;

export function toClientQuestions(qs: GradableQuestion[]) {
  return qs.map(toClientQuestion);
}
