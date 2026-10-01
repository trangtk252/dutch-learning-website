import "server-only";
import { getLanguageModel } from "..";
import { QUESTIONS_SYSTEM, READING_GEN_SYSTEM } from "../prompts";
import {
  GeneratedQuestionsSchema,
  ReadingExerciseDraftSchema,
  type GeneratedQuestion,
  type ReadingExerciseDraft,
} from "../schemas";
import { splitSentences, tokenize } from "../../dutch/text";

/** Offline cloze questions: blank out the longest word of a few sentences. */
function clozeQuestions(text: string, count: number): GeneratedQuestion[] {
  return splitSentences(text)
    .filter((s) => s.split(" ").length >= 5)
    .slice(0, count)
    .map((sentence) => {
      const words = tokenize(sentence).filter((t) => t.isWord);
      const target = words.reduce((a, b) => (b.text.length > a.text.length ? b : a)).text;
      return {
        type: "FILL_BLANK" as const,
        focus: "DETAIL" as const,
        prompt: sentence.replace(target, "___"),
        options: [{ text: target, isCorrect: true }],
        explanation: `The missing word is "${target}".`,
      };
    });
}

export async function generateListeningQuestions(args: {
  transcript: string;
  level: string;
  count?: number;
}): Promise<GeneratedQuestion[]> {
  const count = args.count ?? 5;
  const res = await getLanguageModel().generateStructured({
    task: "generateListeningQuestions",
    system: QUESTIONS_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Level: ${args.level}\nWrite ${count} listening comprehension questions (mix of main idea and detail) for this transcript:\n"""\n${args.transcript}\n"""`,
      },
    ],
    schema: GeneratedQuestionsSchema,
    effort: "medium",
    mock: () => ({ questions: clozeQuestions(args.transcript, count) }),
  });
  return res.questions;
}

export async function generateReadingExercise(args: {
  level: string;
  topic: string;
  genre: string;
}): Promise<ReadingExerciseDraft> {
  return getLanguageModel().generateStructured({
    task: "generateReadingExercise",
    system: READING_GEN_SYSTEM,
    messages: [{ role: "user", content: `Level: ${args.level}\nGenre: ${args.genre}\nTopic: ${args.topic}` }],
    schema: ReadingExerciseDraftSchema,
    effort: "high",
    maxTokens: 12000,
    mock: () => {
      const body = `Dit is een voorbeeldtekst over ${args.topic}. In offline modus kan de app geen nieuwe teksten schrijven. Kies een bestaande tekst uit de bibliotheek, of verbind een AI-provider om nieuwe oefeningen te maken.`;
      return {
        title: `Voorbeeld: ${args.topic}`,
        summaryEn: "Placeholder text generated in offline mode.",
        body,
        keyWords: [],
        questions: clozeQuestions(body, 2),
      };
    },
  });
}
