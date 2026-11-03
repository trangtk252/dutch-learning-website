import { A2_WORDS } from "./nt2-words-a2";
import { B1_WORDS } from "./nt2-words-b1";

/** [pos, lemma, English, example (nl), example (en)] — pos: n noun, v verb, a adjective, d adverb, p preposition, c conjunction, x phrase. */
export type StarterWord = ["n" | "v" | "a" | "d" | "p" | "c" | "x", string, string, string, string];

export const STARTER_DECKS = [
  { slug: "nt2-a2", name: "NT2 A2 starter words", level: "A2" as const, words: A2_WORDS },
  { slug: "nt2-b1", name: "NT2 B1 starter words", level: "B1" as const, words: B1_WORDS },
];

export const POS_MAP = { n: "NOUN", v: "VERB", a: "ADJECTIVE", d: "ADVERB", p: "PREPOSITION", c: "CONJUNCTION", x: "PHRASE" } as const;
