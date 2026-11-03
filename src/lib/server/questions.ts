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

/** Drop malformed AI questions (e.g. multiple choice without exactly one right answer). */
export function validQuestion(q: { type: string; options: { isCorrect: boolean }[] }) {
  const right = q.options.filter((o) => o.isCorrect).length;
  if (q.type === "FILL_BLANK") return right >= 1 && right === q.options.length;
  return q.options.length >= 2 && right === 1;
}
