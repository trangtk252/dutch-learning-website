import { describe, expect, it } from "vitest";
import { buildDailyPlan, type PlanInput } from "./plan";

const base: PlanInput = {
  dailyMinutes: 30,
  dueCards: 40,
  newCardsAvailable: 10,
  preferred: ["SPEAKING", "LISTENING"],
  weaknesses: [],
  accuracy: {},
  daysSince: { LISTENING: 0, READING: 0, SPEAKING: 0, GRAMMAR: 0, WRITING: 0 },
  recentMistakes: [],
  preparingNt2: false,
  examDate: null,
  today: new Date("2026-03-01T08:00:00Z"),
};

describe("buildDailyPlan", () => {
  it("fills exactly the available time", () => {
    for (const minutes of [10, 15, 20, 30, 45, 60]) {
      const plan = buildDailyPlan({ ...base, dailyMinutes: minutes });
      expect(plan.totalMinutes).toBe(minutes);
      for (const b of plan.blocks) expect(b.minutes).toBeGreaterThanOrEqual(3);
    }
  });

  it("starts with due vocabulary reviews, capped at 40% of the session", () => {
    const plan = buildDailyPlan({ ...base, dueCards: 500 });
    expect(plan.blocks[0].skill).toBe("VOCABULARY");
    expect(plan.blocks[0].minutes).toBe(12);
  });

  it("skips vocabulary when nothing is due or new", () => {
    const plan = buildDailyPlan({ ...base, dueCards: 0, newCardsAvailable: 0 });
    expect(plan.blocks.some((b) => b.skill === "VOCABULARY")).toBe(false);
  });

  it("prioritises preferred skills", () => {
    const plan = buildDailyPlan({ ...base, dailyMinutes: 20 });
    const skills = plan.blocks.map((b) => b.skill);
    expect(skills).toContain("SPEAKING");
    expect(skills).toContain("LISTENING");
  });

  it("pushes grammar up when the same mistake keeps recurring", () => {
    const plan = buildDailyPlan({
      ...base,
      preferred: [],
      dailyMinutes: 15,
      recentMistakes: [{ category: "SUBORDINATE_CLAUSES", count: 8 }],
    });
    expect(plan.blocks.find((b) => b.skill !== "VOCABULARY")?.skill).toBe("GRAMMAR");
  });

  it("reacts to weak listening accuracy", () => {
    const plan = buildDailyPlan({ ...base, preferred: [], dailyMinutes: 15, accuracy: { LISTENING: 0.4 } });
    const nonVocab = plan.blocks.filter((b) => b.skill !== "VOCABULARY");
    expect(nonVocab[0].skill).toBe("LISTENING");
    expect(nonVocab[0].reason).toMatch(/40%/);
  });

  it("suggests a mock exam when the NT2 exam is near", () => {
    const plan = buildDailyPlan({ ...base, preparingNt2: true, examDate: new Date("2026-03-20T08:00:00Z") });
    expect(plan.examInDays).toBe(19);
    expect(plan.suggestMockExam).toBe(true);
  });
});
