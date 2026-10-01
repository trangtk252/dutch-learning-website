/** Client-safe question shape: never includes which option is correct. */
export interface ClientQuestion {
  id: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "SELECT_HEARD" | "DICTATION" | "OPEN";
  prompt: string;
  focus: string | null;
  options: { id: string; text: string }[];
  /** Text to speak for SELECT_HEARD / DICTATION questions. */
  audioText?: string;
}

export interface AnswerInput {
  questionId: string;
  optionId?: string | null;
  text?: string | null;
}

export interface QuestionResult {
  questionId: string;
  correct: boolean;
  correctAnswer: string;
  explanation: string | null;
  given: string;
}
