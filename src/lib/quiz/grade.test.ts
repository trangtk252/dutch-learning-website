import { describe, expect, it } from "vitest";
import { gradeQuestion, toClientQuestion, type GradableQuestion } from "./grade";

const mc: GradableQuestion = {
  id: "q1", type: "MULTIPLE_CHOICE", prompt: "?", focus: null, explanation: "because",
  options: [
    { id: "a", text: "de", isCorrect: false, order: 0 },
    { id: "b", text: "het", isCorrect: true, order: 1 },
  ],
};
const fill: GradableQuestion = {
  id: "q2", type: "FILL_BLANK", prompt: "Ik ___ naar huis gegaan.", focus: null, explanation: null,
  options: [{ id: "x", text: "ben", isCorrect: true, order: 0 }],
};

describe("quiz grading", () => {
  it("grades multiple choice by option id", () => {
    expect(gradeQuestion(mc, { questionId: "q1", optionId: "b" }).correct).toBe(true);
    expect(gradeQuestion(mc, { questionId: "q1", optionId: "a" }).correct).toBe(false);
    expect(gradeQuestion(mc, undefined).correct).toBe(false);
  });
  it("grades typed answers leniently", () => {
    expect(gradeQuestion(fill, { questionId: "q2", text: " Ben " }).correct).toBe(true);
    expect(gradeQuestion(fill, { questionId: "q2", text: "heb" }).correct).toBe(false);
    expect(gradeQuestion(fill, { questionId: "q2", text: "" }).correct).toBe(false);
  });
  it("never leaks correctness to the client", () => {
    const c = toClientQuestion(mc);
    expect(JSON.stringify(c)).not.toContain("isCorrect");
    expect(toClientQuestion(fill).options).toEqual([]);
  });
});
