import { describe, expect, it } from "vitest";
import { checkSentence, correctText } from "./rules";

const fix = (s: string) => {
  const r = checkSentence(s);
  return r.length ? r[r.length - 1].corrected : s;
};

describe("offline rule checker", () => {
  it("fixes the perfect tense participle", () => {
    expect(fix("Ik ben gisteren naar Amsterdam gaan.")).toBe("Ik ben gisteren naar Amsterdam gegaan.");
    expect(checkSentence("Ik ben gisteren naar Amsterdam gaan.")[0].category).toBe("PERFECT_TENSE");
  });

  it("fixes the auxiliary of zijn-verbs", () => {
    expect(fix("Ik heb naar huis gegaan.")).toBe("Ik ben naar huis gegaan.");
    expect(fix("Hij heeft gisteren gekomen.")).toBe("Hij is gisteren gekomen.");
  });

  it("moves the verb to the end after omdat", () => {
    expect(fix("Ik blijf thuis omdat ik ben ziek.")).toBe("Ik blijf thuis omdat ik ziek ben.");
  });

  it("fixes de/het for common nouns and niet een", () => {
    expect(fix("De huis is groot.")).toBe("Het huis is groot.");
    expect(fix("Ik heb niet een auto.")).toBe("Ik heb geen auto.");
  });

  it("fixes hebben/zijn agreement", () => {
    expect(fix("Ik heeft een hond.")).toBe("Ik heb een hond.");
  });

  it("leaves correct sentences alone", () => {
    for (const s of [
      "Ik ben gisteren naar Amsterdam gegaan.",
      "Ik heb zin om te gaan.",
      "Hij zegt dat hij morgen komt.",
      "Ik wil naar huis gaan.",
      "Het huis van de man is groot.",
    ]) {
      expect(checkSentence(s)).toEqual([]);
    }
  });

  it("corrects multi-sentence text", () => {
    const r = correctText("Ik heeft een kat. Zij is lief.");
    expect(r.corrected).toBe("Ik heb een kat. Zij is lief.");
    expect(r.corrections).toHaveLength(1);
  });
});
