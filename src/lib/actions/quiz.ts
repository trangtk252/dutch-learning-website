"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AttemptKind, MistakeSource, Prisma, Skill } from "@prisma/client";
import { db } from "../db";
import { requireUser } from "../session";
import { gradeQuestion, type GradableQuestion } from "../quiz/grade";
import type { QuestionResult } from "../quiz/types";
import { logStudy } from "../server/progress";
import { recordMistakes } from "../server/mistakes";

const AnswerSchema = z.object({
  questionId: z.string().max(40),
  optionId: z.string().max(40).nullish(),
  text: z.string().max(1000).nullish(),
});

const SubmitSchema = z.object({
  kind: z.enum(["READING", "LISTENING", "GRAMMAR", "MOCK_EXAM"]),
  refId: z.string().max(40),
  mode: z.enum(["PRACTICE", "EXAM"]).default("PRACTICE"),
  answers: z.array(AnswerSchema).max(200),
  durationSec: z.number().min(0).max(6 * 3600),
  /** Grammar topics have separate practice and quiz sets. */
  set: z.enum(["PRACTICE", "QUIZ"]).optional(),
});

const questionSelect = {
  id: true, type: true, prompt: true, focus: true, explanation: true, errorCategory: true,
  options: { select: { id: true, text: true, isCorrect: true, order: true } },
} satisfies Prisma.QuestionSelect;

function questionWhere(kind: AttemptKind, refId: string, set?: "PRACTICE" | "QUIZ"): Prisma.QuestionWhereInput {
  switch (kind) {
    case "READING": return { readingExerciseId: refId };
    case "LISTENING": return { listeningExerciseId: refId };
    case "GRAMMAR": return { grammarTopicId: refId, ...(set ? { set } : {}) };
    case "MOCK_EXAM": return { mockExamPart: { examId: refId } };
  }
}

const SKILL_FOR: Record<AttemptKind, Skill> = { READING: "READING", LISTENING: "LISTENING", GRAMMAR: "GRAMMAR", MOCK_EXAM: "READING" };
const SOURCE_FOR: Record<AttemptKind, MistakeSource> = { READING: "READING", LISTENING: "LISTENING", GRAMMAR: "GRAMMAR", MOCK_EXAM: "QUIZ" };

/** Practice mode: immediate feedback for a single question (graded on the server). */
export async function checkAnswerAction(input: z.input<typeof AnswerSchema>): Promise<QuestionResult | null> {
  await requireUser();
  const a = AnswerSchema.parse(input);
  const q = await db.question.findUnique({ where: { id: a.questionId }, select: questionSelect });
  if (!q) return null;
  return gradeQuestion(q as GradableQuestion, a);
}

/** Grades a full attempt, stores it, records mistakes and logs study time. */
export async function submitAttemptAction(input: z.input<typeof SubmitSchema>) {
  const user = await requireUser();
  const data = SubmitSchema.parse(input);
  const questions = await db.question.findMany({
    where: questionWhere(data.kind, data.refId, data.set),
    select: questionSelect,
    orderBy: { order: "asc" },
  });
  if (questions.length === 0) throw new Error("No questions found");
  const byId = new Map(data.answers.map((a) => [a.questionId, a]));
  const results = questions.map((q) => gradeQuestion(q as GradableQuestion, byId.get(q.id)));
  const correct = results.filter((r) => r.correct).length;

  let mockExamSkill: Skill | null = null;
  const refField: Partial<Prisma.AttemptUncheckedCreateInput> = {};
  if (data.kind === "READING") refField.readingExerciseId = data.refId;
  if (data.kind === "LISTENING") refField.listeningExerciseId = data.refId;
  if (data.kind === "GRAMMAR") refField.grammarTopicId = data.refId;
  if (data.kind === "MOCK_EXAM") {
    refField.mockExamId = data.refId;
    mockExamSkill = (await db.mockExam.findUnique({ where: { id: data.refId }, select: { skill: true } }))?.skill ?? null;
  }

  const attempt = await db.attempt.create({
    data: {
      userId: user.id,
      kind: data.kind,
      mode: data.mode,
      correct,
      total: questions.length,
      completedAt: new Date(),
      startedAt: new Date(Date.now() - data.durationSec * 1000),
      durationSec: Math.round(data.durationSec),
      ...refField,
      responses: {
        create: results.map((r) => ({
          questionId: r.questionId,
          optionId: byId.get(r.questionId)?.optionId ?? null,
          answerText: byId.get(r.questionId)?.text ?? null,
          isCorrect: r.correct,
        })),
      },
    },
  });

  // Wrong answers on grammar-tagged questions feed the mistake tracker.
  const wrongTagged = questions
    .map((q, i) => ({ q, r: results[i] }))
    .filter(({ q, r }) => !r.correct && q.errorCategory && r.given);
  await recordMistakes({
    userId: user.id,
    source: SOURCE_FOR[data.kind],
    sourceRef: attempt.id,
    items: wrongTagged.map(({ q, r }) => ({
      original: `${q.prompt.replace("___", `[${r.given}]`)}`.slice(0, 500),
      corrected: q.type === "FILL_BLANK" ? q.prompt.replace("___", r.correctAnswer.split(" / ")[0]) : r.correctAnswer,
      category: q.errorCategory!,
      explanation: q.explanation,
    })),
  });

  await logStudy({
    userId: user.id,
    skill: mockExamSkill ?? SKILL_FOR[data.kind],
    activity: data.kind.toLowerCase(),
    durationSec: data.durationSec,
    kind: data.kind === "MOCK_EXAM" ? "exam" : "exercise",
  });
  revalidatePath("/dashboard");
  return { attemptId: attempt.id, correct, total: questions.length, results };
}
