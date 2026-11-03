import { describe, expect, it } from "vitest";
import { bucketOf, formatInterval, previewIntervals, reviewCard, type SrsFields } from "./fsrs";

const NOW = new Date("2026-01-10T09:00:00Z");
const newCard = (): SrsFields => ({
  state: "NEW", due: NOW, stability: 0, difficulty: 0, elapsedDays: 0,
  scheduledDays: 0, learningSteps: 0, reps: 0, lapses: 0, lastReview: null,
});

describe("FSRS scheduling", () => {
  it("moves a new card into learning on Good, with a short step", () => {
    const next = reviewCard(newCard(), "GOOD", NOW);
    expect(next.state).toBe("LEARNING");
    expect(next.reps).toBe(1);
    expect(next.due.getTime()).toBeGreaterThan(NOW.getTime());
    expect(next.due.getTime() - NOW.getTime()).toBeLessThan(60 * 60 * 1000);
  });

  it("graduates straight to review on Easy", () => {
    const next = reviewCard(newCard(), "EASY", NOW);
    expect(next.state).toBe("REVIEW");
    expect(next.scheduledDays).toBeGreaterThanOrEqual(1);
  });

  it("orders intervals Again < Hard < Good < Easy", () => {
    let card = reviewCard(newCard(), "EASY", NOW);
    const later = new Date(card.due.getTime() + 1000);
    card = reviewCard(card, "GOOD", later);
    const p = previewIntervals(card, new Date(card.due.getTime() + 1000));
    expect(p.AGAIN.getTime()).toBeLessThan(p.HARD.getTime());
    expect(p.HARD.getTime()).toBeLessThanOrEqual(p.GOOD.getTime());
    expect(p.GOOD.getTime()).toBeLessThan(p.EASY.getTime());
  });

  it("counts a lapse and relearns when a review card is forgotten", () => {
    const review = reviewCard(newCard(), "EASY", NOW);
    const failed = reviewCard(review, "AGAIN", new Date(review.due.getTime() + 1000));
    expect(failed.state).toBe("RELEARNING");
    expect(failed.lapses).toBe(1);
  });
});

describe("helpers", () => {
  it("formats intervals", () => {
    expect(formatInterval(NOW, new Date(NOW.getTime() + 10 * 60000))).toBe("10m");
    expect(formatInterval(NOW, new Date(NOW.getTime() + 3 * 86400000))).toBe("3d");
  });
  it("buckets cards", () => {
    expect(bucketOf({ state: "NEW", scheduledDays: 0 })).toBe("new");
    expect(bucketOf({ state: "REVIEW", scheduledDays: 30 })).toBe("mature");
    expect(bucketOf({ state: "REVIEW", scheduledDays: 4 })).toBe("young");
  });
});
