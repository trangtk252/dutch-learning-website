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
    expect(fix("Het was leuk omdat ik was met vrienden.")).toBe("Het was leuk omdat ik met vrienden was.");
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

  it("fixes an infinitive used instead of the conjugated verb", () => {
    expect(fix("ik verven soms")).toBe("ik verf soms");
    expect(fix("Ik kook en soms sporten ik")).toBe("Ik kook en soms sport ik");
    expect(fix("Hij werken in Amsterdam")).toBe("Hij werkt in Amsterdam");
    expect(checkSentence("ik verven soms")[0].category).toBe("VERB_CONJUGATION");
  });

  it("puts the verb second after an adverb", () => {
    expect(fix("Soms ik sport")).toBe("Soms sport ik");
    expect(fix("Misschien ik ben moe")).toBe("Misschien ben ik moe");
  });

  it("flags common word-choice slips", () => {
    expect(fix("Dat is veel leuk")).toBe("Dat is heel leuk");
    expect(fix("Ik doe een fout")).toBe("Ik maak een fout");
    expect(fix("Ik heb 25 jaar")).toBe("Ik ben 25 jaar");
    expect(fix("Ik ben because moe")).toBe("Ik ben omdat moe");
  });

  it("does not touch correct sentences with infinitives", () => {
    for (const s of [
      "Ik wil sporten", "Wil ik sporten", "Ik hou van sporten", "Ik ga morgen werken", "Mijn vrienden en ik wonen hier",
      "Ze willen koken", "Ik zie hem werken", "Soms sport ik", "Ik weet niet of ik kan komen", "Groter dan ik ben",
    ]) {
      expect(fix(s)).toBe(s);
    }
  });

  it("explains in the chosen language", () => {
    const t = (s: string) => `[vi] ${s}`;
    expect(checkSentence("ik verven soms", t)[0].explanation.startsWith("[vi] ")).toBe(true);
  });
});
