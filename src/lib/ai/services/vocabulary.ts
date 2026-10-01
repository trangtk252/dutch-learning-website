import "server-only";
import { getLanguageModel } from "..";
import { VOCABULARY_SYSTEM, vocabularyUserPrompt } from "../prompts";
import { VocabularyEntrySchema, type VocabularyEntry } from "../schemas";
import { normalizeWord } from "../../dutch/text";

/**
 * Generates a full learner-dictionary entry for a Dutch word.
 * Callers should prefer an existing human-verified entry in the database and
 * only call this for unknown words (see lib/server/vocabulary.ts).
 */
export async function generateVocabularyEntry(word: string, context?: string | null): Promise<VocabularyEntry> {
  const lemma = normalizeWord(word);
  return getLanguageModel().generateStructured({
    task: "generateVocabularyEntry",
    system: VOCABULARY_SYSTEM,
    messages: [{ role: "user", content: vocabularyUserPrompt(lemma, context) }],
    schema: VocabularyEntrySchema,
    effort: "medium",
    mock: () => ({
      lemma,
      english: "(meaning unavailable offline — edit to add)",
      partOfSpeech: "OTHER" as const,
      article: null,
      plural: null,
      diminutive: null,
      cefrLevel: null,
      ipa: null,
      topics: [],
      notes: "Created in offline mode. Configure AI_PROVIDER=anthropic for automatic enrichment, or edit this entry manually.",
      verb: null,
      adjective: null,
      examples: context ? [{ dutch: context, english: "" }] : [],
      collocations: [],
      synonyms: [],
      antonyms: [],
      confidence: "low" as const,
    }),
  });
}
