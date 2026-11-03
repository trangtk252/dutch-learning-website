import { answersMatch } from "../dutch/text";
import type { AnswerInput, ClientQuestion, QuestionResult } from "./types";

export interface GradableQuestion {
  id: string;
  type: ClientQuestion["type"];
  prompt: string;
  focus: string | null;
  explanation: string | null;
  options: { id: string; text: string; isCorrect: boolean; order: number }[];
}

/** Pure grading so it can be unit-tested and reused for every exercise type. */
export function gradeQuestion(q: GradableQuestion, answer: AnswerInput | undefined): QuestionResult {
  const correctOptions = q.options.filter((o) => o.isCorrect);
  const correctAnswer = correctOptions.map((o) => o.text).join(" / ");
  if (q.type === "FILL_BLANK" || q.type === "DICTATION" || q.type === "OPEN") {
    const given = (answer?.text ?? "").trim();
    const correct = given.length > 0 && correctOptions.some((o) => answersMatch(given, o.text));
    return { questionId: q.id, correct, correctAnswer, explanation: q.explanation, given };
  }
  const chosen = q.options.find((o) => o.id === answer?.optionId);
  return {
    questionId: q.id,
    correct: Boolean(chosen?.isCorrect),
    correctAnswer,
    explanation: q.explanation,
    given: chosen?.text ?? "",
  };
}

export function toClientQuestion(q: GradableQuestion): ClientQuestion {
  const textInput = q.type === "FILL_BLANK" || q.type === "DICTATION" || q.type === "OPEN";
  return {
    id: q.id,
    type: q.type,
    prompt: q.type === "DICTATION" ? "Type the sentence you hear." : q.prompt,
    focus: q.focus,
    options: textInput ? [] : [...q.options].sort((a, b) => a.order - b.order).map((o) => ({ id: o.id, text: o.text })),
    audioText:
      q.type === "DICTATION" ? q.prompt : q.type === "SELECT_HEARD" ? q.options.find((o) => o.isCorrect)?.text : undefined,
  };
}
