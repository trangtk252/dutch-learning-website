import "server-only";
import { getLanguageModel } from "..";
import {
  SENTENCE_ANALYSIS_SYSTEM,
  WRITING_SYSTEM,
  writingUserPrompt,
} from "../prompts";
import {
  SentenceAnalysisSchema,
  WritingEvaluationSchema,
  clampScore,
  type SentenceAnalysis,
  type WritingEvaluation,
} from "../schemas";
import { checkSentence, correctText } from "../../dutch/rules";
import { countWords } from "../../dutch/text";

/** Checks one Dutch sentence and explains every error. */
export async function analyzeDutchSentence(sentence: string, level: string): Promise<SentenceAnalysis> {
  return getLanguageModel().generateStructured({
    task: "analyzeDutchSentence",
    system: SENTENCE_ANALYSIS_SYSTEM,
    messages: [{ role: "user", content: `Learner level: ${level}\nSentence: "${sentence}"` }],
    schema: SentenceAnalysisSchema,
    effort: "medium",
    mock: () => {
      const found = checkSentence(sentence);
      const corrected = found.length ? found[found.length - 1].corrected : sentence;
      return {
        isCorrect: found.length === 0,
        corrected,
        naturalAlternative: null,
        corrections: found.map((c) => ({ ...c, original: sentence })),
        translation: "(translation unavailable offline)",
      };
    },
  });
}

/** Full written-task feedback: scores, corrections and an improved version. */
export async function correctDutchText(args: {
  text: string;
  level: string;
  task: string;
  register?: string | null;
}): Promise<WritingEvaluation> {
  const result = await getLanguageModel().generateStructured({
    task: "correctDutchText",
    system: WRITING_SYSTEM,
    messages: [{ role: "user", content: writingUserPrompt(args) }],
    schema: WritingEvaluationSchema,
    effort: "medium",
    maxTokens: 12000,
    mock: () => {
      const { corrected, corrections } = correctText(args.text);
      const words = countWords(args.text);
      const errorRate = corrections.length / Math.max(1, words / 10);
      const grammar = clampScore(5 - errorRate * 2);
      return {
        scores: {
          grammar,
          vocabulary: clampScore(words > 120 ? 4 : 3),
          structure: grammar,
          register: 3,
          coherence: clampScore(/\b(omdat|want|daarom|maar|ook|daarna|tot slot|bovendien)\b/i.test(args.text) ? 4 : 3),
          taskCompletion: clampScore(words >= 40 ? 4 : 2),
        },
        summary:
          "Offline feedback: a simple rule-based checker looked for a few common errors (verb forms, perfect tense, word order after subordinating conjunctions, de/het, niet/geen). Connect an AI provider for full, nuanced feedback.",
        corrections,
        improvedVersion: corrected,
        usefulVocabulary: [],
      };
    },
  });
  // Enforce the 1–5 range regardless of provider.
  const s = result.scores;
  result.scores = {
    grammar: clampScore(s.grammar),
    vocabulary: clampScore(s.vocabulary),
    structure: clampScore(s.structure),
    register: clampScore(s.register),
    coherence: clampScore(s.coherence),
    taskCompletion: clampScore(s.taskCompletion),
  };
  return result;
}
