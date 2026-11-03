import { describe, expect, it } from "vitest";
import { checkSentence } from "./rules";
import { buildOfflineReport } from "./analysis";

const clamp = (n: number) => Math.min(5, Math.max(1, Math.round(n)));
const report = (turns: string[], isExam = false) =>
  buildOfflineReport({ turns, corrections: turns.flatMap((x) => checkSentence(x).map((c) => ({ ...c, original: x }))), isExam, clamp });

describe("offline speaking report", () => {
  it("names the concrete mistakes instead of a generic line", () => {
    const r = report(["Ik kook en soms sporten ik", "Ik vind dat", "ik verven soms"], true);
    expect(r.grammar.note).toContain("“ik verven soms” → “ik verf soms”");
    expect(r.grammar.note).toContain("unfinished");
    expect(r.accuracy.note).toContain("Verb conjugation ×2");
    expect(r.naturalness.note).toContain("“ik”");
    expect(r.vocabulary.note).toContain("omdat");
  });

  it("praises connectors and flags repeated words", () => {
    const r = report(["Ik hou van koken omdat koken ontspannend is.", "Ik kook vaak, maar ik sport ook graag in het park."]);
    expect(r.vocabulary.note).toContain("Good use of connectors");
    expect(r.vocabulary.note).toContain("“koken”");
  });

  it("suggests richer alternatives for basic words", () => {
    expect(report(["Het was heel leuk en de film was leuk."]).vocabulary.note).toContain("“gezellig”");
  });

  it("notices a past-time word with a present-tense verb", () => {
    expect(report(["Gisteren ga ik naar de markt."]).grammar.note).toContain("talks about the past");
  });

  it("keeps scores within 1–5", () => {
    const r = report(["Ik", "Ik", "Ik"]);
    for (const k of ["grammar", "vocabulary", "fluency", "accuracy", "naturalness"] as const) {
      expect(r[k].score).toBeGreaterThanOrEqual(1);
      expect(r[k].score).toBeLessThanOrEqual(5);
    }
  });

  const POS: Record<string, string[]> = { ik: ["pron"], knus: ["adj"], zo: ["adv"], van: ["prep"], klein: ["adj"], was: ["verb"], woonde: ["verb"], in: ["prep"], gent: ["name"], toen: ["adv"] };
  const withDict = (turns: string[]) => buildOfflineReport({ turns, corrections: [], isExam: true, clamp, posOf: (w) => POS[w] ?? [] });

  it("is not contradictory for a short, broken answer (“ik knus zo van”)", () => {
    const r = withDict(["ik knus zo van"]);
    expect(r.grammar.note).not.toContain("No common grammar errors");
    expect(r.grammar.note).toContain("“knus” is not a verb");
    expect(r.grammar.note).toContain("unfinished");
    expect(r.grammar.score).toBeLessThanOrEqual(2);
    expect(r.accuracy.score).toBeLessThanOrEqual(2);
    expect(r.fluency.note).toContain("in your answer");
  });

  it("does not flag a predicate adjective before the clause-final verb", () => {
    expect(withDict(["Toen ik klein was, woonde ik in Gent."]).grammar.note).not.toContain("is not a verb");
  });

  it("caps scores when there is almost nothing to judge", () => {
    expect(withDict(["ik ben"]).grammar.score).toBeLessThanOrEqual(3);
  });
});
