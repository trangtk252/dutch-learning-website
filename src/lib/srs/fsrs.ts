import {
  fsrs,
  generatorParameters,
  Rating as FsrsRating,
  State as FsrsState,
  type Card as FsrsCard,
  type Grade,
} from "ts-fsrs";

/**
 * Spaced repetition via FSRS (Free Spaced Repetition Scheduler).
 * This module is pure (no DB access) so it is easy to test and reuse.
 */

export type CardState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
export type Rating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface SrsFields {
  state: CardState;
  due: Date;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  lastReview: Date | null;
}

const STATE_TO_FSRS: Record<CardState, FsrsState> = {
  NEW: FsrsState.New,
  LEARNING: FsrsState.Learning,
  REVIEW: FsrsState.Review,
  RELEARNING: FsrsState.Relearning,
};
const FSRS_TO_STATE: Record<FsrsState, CardState> = {
  [FsrsState.New]: "NEW",
  [FsrsState.Learning]: "LEARNING",
  [FsrsState.Review]: "REVIEW",
  [FsrsState.Relearning]: "RELEARNING",
};
const RATING_TO_FSRS: Record<Rating, Grade> = {
  AGAIN: FsrsRating.Again,
  HARD: FsrsRating.Hard,
  GOOD: FsrsRating.Good,
  EASY: FsrsRating.Easy,
};

/** 90% target retention; 1-minute and 10-minute learning steps. */
export const scheduler = fsrs(
  generatorParameters({
    request_retention: 0.9,
    maximum_interval: 365 * 3,
    enable_fuzz: true,
    enable_short_term: true,
    learning_steps: ["1m", "10m"],
    relearning_steps: ["10m"],
  }),
);

function toFsrs(card: SrsFields): FsrsCard {
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays,
    scheduled_days: card.scheduledDays,
    learning_steps: card.learningSteps,
    reps: card.reps,
    lapses: card.lapses,
    state: STATE_TO_FSRS[card.state],
    last_review: card.lastReview ?? undefined,
  };
}

function fromFsrs(card: FsrsCard): SrsFields {
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: FSRS_TO_STATE[card.state],
    lastReview: card.last_review ?? null,
  };
}

export function reviewCard(card: SrsFields, rating: Rating, now: Date = new Date()): SrsFields {
  const { card: next } = scheduler.next(toFsrs(card), now, RATING_TO_FSRS[rating]);
  return fromFsrs(next);
}

/** Next due date for every rating, for "Again · 1m / Good · 3d" button labels. */
export function previewIntervals(card: SrsFields, now: Date = new Date()): Record<Rating, Date> {
  const out = {} as Record<Rating, Date>;
  for (const r of Object.keys(RATING_TO_FSRS) as Rating[]) {
    out[r] = reviewCard(card, r, now).due;
  }
  return out;
}

/** Probability (0–1) the learner still remembers the card now. */
export function retrievability(card: SrsFields, now: Date = new Date()): number | null {
  if (card.state === "NEW" || !card.lastReview) return null;
  return scheduler.get_retrievability(toFsrs(card), now, false) as number;
}

export function formatInterval(from: Date, to: Date): string {
  const mins = Math.max(1, Math.round((to.getTime() - from.getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 31) return `${days}d`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

/** A card is "mature" once its interval reaches 21 days (Anki convention). */
export const MATURE_DAYS = 21;

export type CardBucket = "new" | "learning" | "young" | "mature";
export function bucketOf(card: Pick<SrsFields, "state" | "scheduledDays">): CardBucket {
  if (card.state === "NEW") return "new";
  if (card.state === "LEARNING" || card.state === "RELEARNING") return "learning";
  return card.scheduledDays >= MATURE_DAYS ? "mature" : "young";
}

/** Heuristic "difficult word" flag used for filtering. */
export function isDifficult(card: { difficulty: number; lapses: number }): boolean {
  return card.lapses >= 2 || card.difficulty >= 7;
}
