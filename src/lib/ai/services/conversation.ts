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
import { buildOfflineReport } from "../../dutch/analysis";
import { makeT } from "../../i18n/translate";
import { dutchPartsOfSpeech } from "../../server/dictionary-db";
import { vi } from "../../i18n/dictionaries/vi";
import { countWords } from "../../dutch/text";
import { mockOpening, mockFollowUp, wantsEnglishHelp } from "./conversation-mock";

export interface ConversationInput {
  scenario: ScenarioKey;
  level: string;
  learnerName?: string;
  /** NT2 exam-style task instruction (Spreken); appended to the scenario setup. */
  nt2Task?: string;
  /** Full history; the last item is the learner's newest message (or empty for the opening turn). */
  history: ChatTurn[];
  /** Interface language: offline corrections and explanations are written in it. */
  language?: "en" | "vi";
}

/** Produces the tutor's next turn plus corrections of the learner's last message. */
export async function generateConversationResponse(input: ConversationInput): Promise<ConversationReply> {
  const info = SCENARIO_INFO[input.scenario];
  const context = conversationContext({
    scenario: info.label,
    setup: input.nt2Task ? `${info.setup}. This session's task: ${input.nt2Task}` : info.setup,
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
        .flatMap((s) => checkSentence(s, makeT(input.language === "vi" ? vi : null)).map((c) => ({ ...c, original: s })));
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
  /** Language for the notes and summary; Dutch example corrections stay Dutch. */
  language?: "en" | "vi";
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
        content: `Learner level: ${args.level}\nScenario: ${SCENARIO_INFO[args.scenario].label}\n${args.language === "vi" ? "Write every note, the summary and the correction explanations in Vietnamese (keep Dutch examples in Dutch).\n" : ""}\nTranscript:\n${transcriptText}`,
      },
    ],
    schema: SpeakingEvaluationSchema,
    effort: "medium",
    maxTokens: 6000,
    mock: () => {
      const tr = makeT(args.language === "vi" ? vi : null);
      const corrections = learnerTurns.flatMap((t) =>
        t.content.split(/(?<=[.!?])\s+/).flatMap((s) => checkSentence(s, tr).map((c) => ({ ...c, original: s }))),
      );
      const report = buildOfflineReport({
        turns: learnerTurns.map((t) => t.content),
        corrections,
        isExam: args.scenario === "NT2_SPEAKING",
        t: tr,
        clamp: clampScore,
        posOf: dutchPartsOfSpeech,
      });
      return {
        ...report,
        summary: "",
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
