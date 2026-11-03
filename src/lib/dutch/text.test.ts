import { describe, expect, it } from "vitest";
import { answersMatch, normalizeWord, tokenize } from "./text";

describe("text utilities", () => {
  it("tokenizes Dutch words with apostrophes and diacritics", () => {
    const words = tokenize("Zo'n café, auto's en een één-tweetje!").filter((t) => t.isWord).map((t) => t.text);
    expect(words).toEqual(["Zo'n", "café", "auto's", "en", "een", "één-tweetje"]);
  });
  it("round-trips text exactly", () => {
    const s = "Hallo, wereld! Hoe gaat het?\nGoed.";
    expect(tokenize(s).map((t) => t.text).join("")).toBe(s);
  });
  it("normalises lookup keys", () => {
    expect(normalizeWord("Het Huis")).toBe("huis");
    expect(normalizeWord("Gezellig!")).toBe("gezellig");
  });
  it("compares answers leniently", () => {
    expect(answersMatch(" Gegaan. ", "gegaan")).toBe(true);
    expect(answersMatch("gaan", "gegaan")).toBe(false);
  });
});
