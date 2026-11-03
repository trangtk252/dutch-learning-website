import "server-only";
import { getLanguageModel } from "..";
import { MISTAKE_ANALYSIS_SYSTEM } from "../prompts";
import { MistakeAnalysisSchema, type MistakeAnalysis } from "../schemas";
import { ERROR_CATEGORY_LABELS, type ErrorCategoryKey } from "../../constants";
import { buildDailyPlan, type PlanInput, type DailyPlan } from "../../learning/plan";

/**
 * "What should I study today?" The plan itself is computed deterministically
 * (lib/learning/plan.ts) so it is explainable and testable; no AI call needed.
 */
export function recommendNextLesson(input: PlanInput): DailyPlan {
  return buildDailyPlan(input);
}

/** Finds patterns in a learner's mistakes and gives targeted tips. */
export async function analyzeUserMistakes(
  mistakes: { category: ErrorCategoryKey; original: string; corrected: string }[],
): Promise<MistakeAnalysis> {
  const sample = mistakes.slice(0, 60);
  return getLanguageModel().generateStructured({
    task: "analyzeUserMistakes",
    system: MISTAKE_ANALYSIS_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Recent mistakes (category | original → corrected):\n${sample
          .map((m) => `${m.category} | ${m.original} → ${m.corrected}`)
          .join("\n")}`,
      },
    ],
    schema: MistakeAnalysisSchema,
    effort: "medium",
    mock: () => {
      const counts = new Map<ErrorCategoryKey, typeof sample>();
      for (const m of sample) counts.set(m.category, [...(counts.get(m.category) ?? []), m]);
      const top = [...counts.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 3);
      return {
        summary: top.length
          ? `Your most frequent mistake type is "${ERROR_CATEGORY_LABELS[top[0][0]]}". Focus your grammar practice there first.`
          : "No mistakes recorded yet — keep practising!",
        patterns: top.map(([category, list]) => ({
          category,
          insight: `${list.length} recent mistake(s) in this area.`,
          tip: "Review the related grammar lesson and do its mini exercise.",
          exampleFix: `${list[0].original} → ${list[0].corrected}`,
        })),
      };
    },
  });
}
