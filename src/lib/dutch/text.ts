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

/**
 * Groups transcript lines into readable segments of roughly one or two sentences,
 * keeping the start time of the first line. Used for imported podcasts and videos,
 * whose captions arrive as short fragments.
 */
export function groupCues<T extends { text: string; startMs: number | null; endMs: number | null }>(
  cues: T[],
  { target = 130, max = 260, limit = 600 }: { target?: number; max?: number; limit?: number } = {},
): { text: string; startMs: number | null; endMs: number | null }[] {
  const out: { text: string; startMs: number | null; endMs: number | null }[] = [];
  let cur: { text: string; startMs: number | null; endMs: number | null } | null = null;
  for (const c of cues) {
    if (!cur) cur = { text: c.text, startMs: c.startMs, endMs: c.endMs };
    else {
      cur.text += ` ${c.text}`;
      cur.endMs = c.endMs ?? cur.endMs;
    }
    if (cur.text.length >= max || (cur.text.length >= target && /[.!?…]["”)]?$/.test(cur.text))) {
      out.push(cur);
      cur = null;
    }
  }
  if (cur) out.push(cur);
  // `max` closes segments of captions without punctuation (auto-generated YouTube captions).
  return out.slice(0, limit);
}

/** Pasted transcripts: one segment per non-empty line, or sentence groups when it is one block. */
export function cuesFromPlainText(text: string): { text: string; startMs: null; endMs: null }[] {
  const lines = text.replace(/\r/g, "").split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const pieces = lines.length >= 3 ? lines : splitSentences(text.replace(/\s+/g, " "));
  return pieces.map((t) => ({ text: t, startMs: null, endMs: null }));
}
