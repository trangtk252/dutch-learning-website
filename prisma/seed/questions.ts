/** Helpers to write seed questions compactly. */

export interface SeedQuestion {
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "SELECT_HEARD" | "DICTATION";
  focus?: "MAIN_IDEA" | "DETAIL" | "INFERENCE" | "VOCABULARY" | "GRAMMAR";
  set?: "PRACTICE" | "QUIZ";
  prompt: string;
  explanation: string;
  options: { text: string; isCorrect: boolean }[];
  errorCategory?: string;
}

type Extra = Partial<Pick<SeedQuestion, "focus" | "set" | "errorCategory">>;

/** Multiple choice; `correct` is the index of the right option. */
export function mc(prompt: string, options: string[], correct: number, explanation: string, extra: Extra = {}): SeedQuestion {
  return {
    type: "MULTIPLE_CHOICE",
    prompt,
    explanation,
    options: options.map((text, i) => ({ text, isCorrect: i === correct })),
    ...extra,
  };
}

export function tf(prompt: string, isTrue: boolean, explanation: string, extra: Extra = {}): SeedQuestion {
  return {
    type: "TRUE_FALSE",
    prompt,
    explanation,
    options: [
      { text: "Waar", isCorrect: isTrue },
      { text: "Niet waar", isCorrect: !isTrue },
    ],
    ...extra,
  };
}

/** Fill in the blank: prompt contains "___"; all `accepted` answers are correct. */
export function fill(prompt: string, accepted: string[], explanation: string, extra: Extra = {}): SeedQuestion {
  return {
    type: "FILL_BLANK",
    prompt,
    explanation,
    options: accepted.map((text) => ({ text, isCorrect: true })),
    ...extra,
  };
}

/** Dictation: the learner types the sentence they hear. */
export function dictation(sentence: string, explanation = "Listen again and compare word by word."): SeedQuestion {
  return { type: "DICTATION", prompt: sentence, explanation, options: [{ text: sentence, isCorrect: true }], focus: "DETAIL" };
}

/** Select the phrase you heard (multiple choice on similar-sounding phrases). */
export function heard(options: string[], correct: number, explanation: string): SeedQuestion {
  return {
    type: "SELECT_HEARD",
    prompt: "Which phrase did you hear?",
    explanation,
    options: options.map((text, i) => ({ text, isCorrect: i === correct })),
    focus: "DETAIL",
  };
}
