import { z } from "zod";
import { CEFR_LEVELS, ERROR_CATEGORIES, PARTS_OF_SPEECH } from "../constants";

/**
 * Zod schemas for every structured AI response. Outputs are validated against
 * these before anything is stored. Keep schemas simple (no numeric bounds) so
 * they translate cleanly to the API's JSON-schema subset; bounds are enforced
 * by `clampScore` and friends when saving.
 */

const Cefr = z.enum(CEFR_LEVELS);
const ErrorCategory = z.enum(ERROR_CATEGORIES);

export const VocabularyEntrySchema = z.object({
  lemma: z.string().describe("Dictionary form, without article"),
  english: z.string().describe("Concise English meaning(s), separated by ';'"),
  partOfSpeech: z.enum(PARTS_OF_SPEECH),
  article: z.enum(["DE", "HET", "DE_HET"]).nullable(),
  plural: z.string().nullable(),
  diminutive: z.string().nullable(),
  cefrLevel: Cefr.nullable(),
  ipa: z.string().nullable(),
  topics: z.array(z.string()).describe("1-3 lowercase English topic slugs, e.g. 'home', 'work', 'emotions'"),
  notes: z.string().nullable().describe("Usage notes for an English speaker, in English"),
  verb: z
    .object({
      presentIk: z.string(),
      presentJij: z.string(),
      presentHij: z.string(),
      presentWij: z.string(),
      pastSingular: z.string(),
      pastPlural: z.string(),
      pastParticiple: z.string(),
      auxiliary: z.enum(["HEBBEN", "ZIJN", "HEBBEN_ZIJN"]),
      separable: z.boolean(),
      separablePrefix: z.string().nullable(),
      irregular: z.boolean(),
      reflexive: z.boolean(),
    })
    .nullable(),
  adjective: z
    .object({ inflected: z.string(), comparative: z.string().nullable(), superlative: z.string().nullable() })
    .nullable(),
  examples: z.array(z.object({ dutch: z.string(), english: z.string() })),
  collocations: z.array(z.object({ phrase: z.string(), english: z.string() })),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]).describe("How sure you are this entry is fully correct"),
});
export type VocabularyEntry = z.infer<typeof VocabularyEntrySchema>;

export const CorrectionSchema = z.object({
  original: z.string(),
  corrected: z.string(),
  category: ErrorCategory,
  explanation: z.string().describe("Short English explanation"),
});
export type Correction = z.infer<typeof CorrectionSchema>;

export const SentenceAnalysisSchema = z.object({
  isCorrect: z.boolean(),
  corrected: z.string(),
  naturalAlternative: z.string().nullable(),
  corrections: z.array(CorrectionSchema),
  translation: z.string(),
});
export type SentenceAnalysis = z.infer<typeof SentenceAnalysisSchema>;

export const ConversationReplySchema = z.object({
  reply: z.string().describe("Your next turn in Dutch"),
  english: z
    .string()
    .nullable()
    .describe("English help, only when the learner asked for it or is clearly lost; otherwise null"),
  corrections: z.array(CorrectionSchema).describe("Errors in the learner's LAST message only; empty if none"),
  newWords: z.array(z.object({ dutch: z.string(), english: z.string() })).describe("Up to 3 useful words from your reply"),
});
export type ConversationReply = z.infer<typeof ConversationReplySchema>;

const ScoreNote = z.object({ score: z.number().int(), note: z.string() });
export const SpeakingEvaluationSchema = z.object({
  grammar: ScoreNote,
  vocabulary: ScoreNote,
  fluency: ScoreNote,
  accuracy: ScoreNote,
  naturalness: ScoreNote,
  summary: z.string(),
  keyCorrections: z.array(CorrectionSchema),
  newVocabulary: z.array(z.string()),
});
export type SpeakingEvaluation = z.infer<typeof SpeakingEvaluationSchema>;

export const WritingEvaluationSchema = z.object({
  scores: z.object({
    grammar: z.number().int(),
    vocabulary: z.number().int(),
    structure: z.number().int(),
    register: z.number().int(),
    coherence: z.number().int(),
    taskCompletion: z.number().int(),
  }),
  summary: z.string(),
  corrections: z.array(CorrectionSchema),
  improvedVersion: z.string(),
  usefulVocabulary: z.array(z.string()),
});
export type WritingEvaluation = z.infer<typeof WritingEvaluationSchema>;

export const GeneratedQuestionSchema = z.object({
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_BLANK"]),
  focus: z.enum(["MAIN_IDEA", "DETAIL", "INFERENCE", "VOCABULARY"]),
  prompt: z.string(),
  options: z.array(z.object({ text: z.string(), isCorrect: z.boolean() })),
  explanation: z.string(),
});
export const GeneratedQuestionsSchema = z.object({ questions: z.array(GeneratedQuestionSchema) });
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

export const ReadingExerciseDraftSchema = z.object({
  title: z.string(),
  summaryEn: z.string(),
  body: z.string(),
  keyWords: z.array(z.string()),
  questions: z.array(GeneratedQuestionSchema),
});
export type ReadingExerciseDraft = z.infer<typeof ReadingExerciseDraftSchema>;

export const MistakeAnalysisSchema = z.object({
  summary: z.string(),
  patterns: z.array(
    z.object({ category: ErrorCategory, insight: z.string(), tip: z.string(), exampleFix: z.string() }),
  ),
});
export type MistakeAnalysis = z.infer<typeof MistakeAnalysisSchema>;

export function clampScore(n: number, min = 1, max = 5): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}
