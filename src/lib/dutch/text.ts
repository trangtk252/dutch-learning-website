/** Text utilities shared by server and client (no Node APIs). */

export interface Token {
  text: string;
  /** True for words that can be looked up (not whitespace/punctuation). */
  isWord: boolean;
}

// Letters incl. Dutch diacritics, plus apostrophes/hyphens inside words (zo'n, auto's, e-mail).
const TOKEN_RE = /([A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*)|([^A-Za-zÀ-ÖØ-öø-ÿ0-9]+)/g;

export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  for (const m of text.matchAll(TOKEN_RE)) {
    if (m[1]) out.push({ text: m[1], isWord: !/^\d+$/.test(m[1]) });
    else if (m[2]) out.push({ text: m[2], isWord: false });
  }
  return out;
}

/** Lookup key: lower-case, curly apostrophes normalised, article stripped. */
export function normalizeWord(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/^(de|het|een)\s+/, "")
    .replace(/[.,!?;:"()]/g, "")
    .trim();
}

export function countWords(text: string): number {
  return tokenize(text).filter((t) => t.isWord).length;
}

/** ~120 wpm for A2 readers up to ~200 wpm at C1. */
export function estimateReadingMinutes(wordCount: number, level: string): number {
  const wpm: Record<string, number> = { A1: 90, A2: 110, B1: 140, B2: 170, C1: 200 };
  return Math.max(1, Math.round(wordCount / (wpm[level] ?? 140)));
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Lenient comparison for typed answers (case, punctuation, extra spaces). */
export function answersMatch(given: string, expected: string): boolean {
  const clean = (s: string) =>
    s.toLowerCase().replace(/’/g, "'").replace(/[.,!?;:"]/g, "").replace(/\s+/g, " ").trim();
  return clean(given) === clean(expected);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
