import type { ErrorCategoryKey, SkillKey } from "../constants";

/**
 * The personal learning engine: answers "What should I study today?".
 *
 * Pure and deterministic so it is explainable ("why this?") and unit-tested.
 * Inputs are gathered from the database in lib/server/plan.ts.
 */

export interface PlanInput {
  dailyMinutes: number;
  dueCards: number;
  newCardsAvailable: number;
  preferred: SkillKey[];
  weaknesses: SkillKey[];
  /** Recent accuracy 0–1 per skill (null = no data yet). */
  accuracy: Partial<Record<SkillKey, number | null>>;
  /** Days since the skill was last practised (null = never). */
  daysSince: Partial<Record<SkillKey, number | null>>;
  /** Mistake counts over the last 14 days, most frequent first. */
  recentMistakes: { category: ErrorCategoryKey; count: number }[];
  preparingNt2: boolean;
  examDate: Date | null;
  today?: Date;
}

export interface PlanBlock {
  skill: SkillKey;
  minutes: number;
  title: string;
  reason: string;
}

export interface DailyPlan {
  totalMinutes: number;
  blocks: PlanBlock[];
  /** Days until the NT2 exam, if set. */
  examInDays: number | null;
  suggestMockExam: boolean;
}

const SECONDS_PER_REVIEW = 12;
const SECONDS_PER_NEW_CARD = 40;
const MIN_BLOCK = 5;

const PRACTICE_SKILLS: SkillKey[] = ["LISTENING", "READING", "SPEAKING", "GRAMMAR", "WRITING"];

const TITLES: Record<SkillKey, string> = {
  VOCABULARY: "Vocabulary reviews",
  LISTENING: "Listening exercise",
  READING: "Reading exercise",
  SPEAKING: "Speaking practice",
  GRAMMAR: "Grammar practice",
  WRITING: "Writing task",
};

export function buildDailyPlan(input: PlanInput): DailyPlan {
  const today = input.today ?? new Date();
  const total = Math.max(10, Math.round(input.dailyMinutes));
  const examInDays = input.examDate
    ? Math.ceil((input.examDate.getTime() - today.getTime()) / 86_400_000)
    : null;
  const examSoon = input.preparingNt2 && examInDays !== null && examInDays >= 0 && examInDays <= 60;

  const blocks: PlanBlock[] = [];

  // 1. Vocabulary: clear due reviews first (they decay), plus a few new cards.
  const newToday = Math.min(input.newCardsAvailable, 10);
  const vocabNeeded = Math.ceil((input.dueCards * SECONDS_PER_REVIEW + newToday * SECONDS_PER_NEW_CARD) / 60);
  const vocabCap = Math.round(total * 0.4);
  const vocabMinutes = vocabNeeded > 0 ? Math.min(vocabCap, Math.max(3, vocabNeeded)) : 0;
  if (vocabMinutes > 0) {
    blocks.push({
      skill: "VOCABULARY",
      minutes: vocabMinutes,
      title: TITLES.VOCABULARY,
      reason:
        input.dueCards > 0
          ? `${input.dueCards} card${input.dueCards === 1 ? " is" : "s are"} due — reviewing on time keeps them in long-term memory.`
          : `Learn ${newToday} new word${newToday === 1 ? "" : "s"} from your list.`,
    });
  }

  // 2. Score the other skills.
  const topMistake = input.recentMistakes[0];
  const scored = PRACTICE_SKILLS.map((skill) => {
    let weight = 1;
    const why: string[] = [];
    if (input.preferred.includes(skill)) {
      weight += 1;
      why.push("one of your preferred activities");
    }
    if (input.weaknesses.includes(skill)) {
      weight += 1;
      why.push("you marked it as an area to improve");
    }
    const acc = input.accuracy[skill];
    if (acc != null && acc < 0.6) {
      weight += 1.5;
      why.push(`recent accuracy is ${Math.round(acc * 100)}%`);
    } else if (acc != null && acc < 0.75) {
      weight += 0.5;
      why.push(`recent accuracy is ${Math.round(acc * 100)}%`);
    }
    const since = input.daysSince[skill];
    if (since == null) {
      weight += 0.75;
      why.push("you haven't tried it yet");
    } else if (since >= 3) {
      weight += Math.min(since, 7) / 7;
      why.push(`last practised ${since} days ago`);
    }
    if (skill === "GRAMMAR" && topMistake && topMistake.count >= 3) {
      weight += 1.25;
      why.push(`${topMistake.count} recent mistakes in one grammar area`);
    }
    if (examSoon) {
      weight += 0.5;
      if (why.length === 0) why.push(`your NT2 exam is in ${examInDays} days`);
    }
    return { skill, weight, why };
  }).sort((a, b) => b.weight - a.weight || PRACTICE_SKILLS.indexOf(a.skill) - PRACTICE_SKILLS.indexOf(b.skill));

  // 3. Split the remaining time over the top skills (each block ≥ MIN_BLOCK minutes).
  const remaining = total - vocabMinutes;
  const count = Math.max(1, Math.min(4, Math.floor(remaining / MIN_BLOCK)));
  const chosen = scored.slice(0, count);
  // Everyone gets the minimum, the rest is shared by weight (largest remainder).
  const extra = remaining - count * MIN_BLOCK;
  const weightSum = chosen.reduce((n, c) => n + c.weight, 0);
  const shares = chosen.map((c) => (extra * c.weight) / weightSum);
  const minutes = shares.map((s) => Math.floor(s));
  let left = extra - minutes.reduce((n, m) => n + m, 0);
  shares
    .map((s, i) => ({ i, frac: s - Math.floor(s) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => {
      if (left > 0) {
        minutes[i] += 1;
        left -= 1;
      }
    });
  chosen.forEach((c, i) => {
    blocks.push({
      skill: c.skill,
      minutes: MIN_BLOCK + minutes[i],
      title: TITLES[c.skill],
      reason: c.why.length ? capitalise(c.why.slice(0, 2).join(", ")) + "." : "Keeps your practice balanced.",
    });
  });

  return {
    totalMinutes: blocks.reduce((n, b) => n + b.minutes, 0),
    blocks,
    examInDays,
    suggestMockExam: examSoon && (examInDays ?? 99) <= 30,
  };
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
