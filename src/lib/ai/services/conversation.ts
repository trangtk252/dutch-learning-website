import "server-only";
import { getLanguageModel } from "..";
import {
  CONVERSATION_SYSTEM,
  SPEAKING_EVAL_SYSTEM,
  conversationContext,
} from "../prompts";
import {
  ConversationReplySchema,
  SpeakingEvaluationSchema,
  clampScore,
  type ConversationReply,
  type SpeakingEvaluation,
} from "../schemas";
import type { ChatTurn } from "../types";
import { SCENARIO_INFO, type ScenarioKey } from "../../constants";
import { checkSentence } from "../../dutch/rules";
import { countWords } from "../../dutch/text";
import { mockOpening, mockFollowUp, wantsEnglishHelp } from "./conversation-mock";

export interface ConversationInput {
  scenario: ScenarioKey;
  level: string;
  learnerName?: string;
  /** Full history; the last item is the learner's newest message (or empty for the opening turn). */
  history: ChatTurn[];
}

/** Produces the tutor's next turn plus corrections of the learner's last message. */
export async function generateConversationResponse(input: ConversationInput): Promise<ConversationReply> {
  const info = SCENARIO_INFO[input.scenario];
  const context = conversationContext({
    scenario: info.label,
    setup: info.setup,
    level: input.level,
    learnerName: input.learnerName,
  });
  // The scenario context is the first user turn, so the system prompt stays static (cacheable).
  const messages: ChatTurn[] = [
    {
      role: "user",
      content: `${context}\n\n(Start the conversation with a short greeting and an opening question in your role. The learner's replies follow.)`,
    },
    ...input.history,
  ];

  const lastUser = [...input.history].reverse().find((t) => t.role === "user")?.content ?? "";
  const turnIndex = input.history.filter((t) => t.role === "user").length;

  return getLanguageModel().generateStructured({
    task: "generateConversationResponse",
    system: CONVERSATION_SYSTEM,
    messages,
    schema: ConversationReplySchema,
    effort: "low",
    maxTokens: 2000,
    mock: () => {
      if (input.history.length === 0) return { ...mockOpening(input.scenario), english: null, corrections: [] };
      const reply = mockFollowUp(input.scenario, turnIndex);
      const corrections = lastUser
        .split(/(?<=[.!?])\s+/)
        .flatMap((s) => checkSentence(s).map((c) => ({ ...c, original: s })));
      return {
        reply: reply.reply,
        english: wantsEnglishHelp(lastUser)
          ? "No problem! In offline mode I can't translate freely. Try rephrasing in simple Dutch, or tap any word to see its meaning."
          : null,
        corrections,
        newWords: reply.newWords,
      };
    },
  });
}

/** Post-conversation report. Scores are practice estimates, never official CEFR results. */
export async function evaluateSpeaking(args: {
  level: string;
  scenario: ScenarioKey;
  transcript: ChatTurn[];
}): Promise<SpeakingEvaluation> {
  const learnerTurns = args.transcript.filter((t) => t.role === "user");
  const transcriptText = args.transcript
    .map((t) => `${t.role === "user" ? "LEARNER" : "TUTOR"}: ${t.content}`)
    .join("\n");

  const result = await getLanguageModel().generateStructured({
    task: "evaluateSpeaking",
    system: SPEAKING_EVAL_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Learner level: ${args.level}\nScenario: ${SCENARIO_INFO[args.scenario].label}\n\nTranscript:\n${transcriptText}`,
      },
    ],
    schema: SpeakingEvaluationSchema,
    effort: "medium",
    maxTokens: 6000,
    mock: () => {
      const corrections = learnerTurns.flatMap((t) =>
        t.content.split(/(?<=[.!?])\s+/).flatMap((s) => checkSentence(s).map((c) => ({ ...c, original: s }))),
      );
      const avgWords = learnerTurns.length
        ? learnerTurns.reduce((n, t) => n + countWords(t.content), 0) / learnerTurns.length
        : 0;
      const accuracy = clampScore(5 - corrections.length / Math.max(1, learnerTurns.length) * 2);
      const fluency = clampScore(avgWords / 3);
      return {
        grammar: { score: accuracy, note: corrections.length ? "Some recurring grammar slips were detected — see the corrections." : "No common grammar errors were detected by the offline checker." },
        vocabulary: { score: clampScore(avgWords / 4), note: "Offline estimate based on the length of your answers." },
        fluency: { score: fluency, note: `You averaged about ${Math.round(avgWords)} words per turn across ${learnerTurns.length} turns.` },
        accuracy: { score: accuracy, note: `${corrections.length} issue(s) found by the offline rule checker.` },
        naturalness: { score: 3, note: "Naturalness can only be judged with an AI provider connected." },
        summary: "Offline report. Connect an AI provider (AI_PROVIDER=anthropic) for a full evaluation of grammar, vocabulary and naturalness.",
        keyCorrections: corrections.slice(0, 5),
        newVocabulary: [],
      };
    },
  });
  for (const k of ["grammar", "vocabulary", "fluency", "accuracy", "naturalness"] as const) {
    result[k].score = clampScore(result[k].score);
  }
  return result;
}
