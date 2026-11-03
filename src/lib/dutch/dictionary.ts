import type { Pos } from "@/lib/constants";

export interface DictionaryResult {
  english: string;
  partOfSpeech: Pos;
  example: { dutch: string; english: string } | null;
  /** Nouns only. */
  article: "DE" | "HET" | null;
  plural: string | null;
  diminutive: string | null;
}

interface WiktionaryDefinition {
  definition?: string;
  parsedExamples?: { example?: string; translation?: string }[];
}
interface WiktionaryEntry {
  partOfSpeech?: string;
  definitions?: WiktionaryDefinition[];
}

const POS_MAP: Record<string, Pos> = {
  noun: "NOUN", verb: "VERB", adjective: "ADJECTIVE", adverb: "ADVERB", preposition: "PREPOSITION",
  conjunction: "CONJUNCTION", pronoun: "PRONOUN", article: "ARTICLE", numeral: "NUMERAL",
  interjection: "INTERJECTION", phrase: "PHRASE", proverb: "PHRASE", particle: "OTHER",
};

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&\w+;/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

/** "Inflection of …" style definitions say nothing useful about the word itself. */
const isFormOf = (d: WiktionaryDefinition) => /form-of-definition/.test(d.definition ?? "");
const isEmpty = (d: WiktionaryDefinition) => !stripHtml(d.definition ?? "");

const HEADERS = { "User-Agent": "dutch-learning-app/1.0 (personal study tool)", Accept: "application/json" };

/** GET with one retry on rate limiting (429), server errors or timeouts. */
async function fetchWithRetry(url: string): Promise<Response | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(6000), next: { revalidate: 60 * 60 * 24 } });
      if (res.ok || (res.status !== 429 && res.status < 500)) return res;
    } catch {
      // timeout / network error: retry once
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 1200));
  }
  return null;
}

/** Reads gender, plural and diminutive from the rendered Dutch headword line, e.g. "huis n (plural huizen, diminutive huisje n)". */
async function lookupNounForms(term: string) {
  const none = { article: null, plural: null, diminutive: null } as const;
  try {
    const res = await fetchWithRetry(
      `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(term)}&prop=text&format=json&formatversion=2`,
    );
    if (!res?.ok) return none;
    let html = ((await res.json()) as { parse?: { text?: string } }).parse?.text ?? "";
    const start = html.indexOf('id="Dutch"');
    if (start < 0) return none;
    html = html.slice(start);
    const end = html.indexOf("<h2", 10);
    const text = stripHtml(end > 0 ? html.slice(0, end) : html);
    const m = text.match(/(?:^|\s)[\p{L}'-]+ ([mfnc])(?: or [mfnc])* \(plural ([^,)]+?)(?= or |,|\))(?: or [^,)]+)?(?:, diminutive ([^,)\s]+))?/u);
    if (!m) return none;
    return {
      article: m[1] === "n" ? ("HET" as const) : ("DE" as const),
      plural: m[2] && m[2] !== "?" ? m[2].trim() : null,
      diminutive: m[3] ?? null,
    };
  } catch {
    return none;
  }
}

/**
 * Looks a Dutch word up in the free English Wiktionary REST API (no key needed).
 * Returns null when the word is not found or the service is unreachable.
 */
export async function lookupDictionary(word: string): Promise<DictionaryResult | null> {
  const term = word.trim().replace(/^(de|het|een)\s+/i, "").toLowerCase();
  if (!term) return null;
  try {
    const res = await fetchWithRetry(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(term)}`);
    if (!res?.ok) return null;
    const data = (await res.json()) as { nl?: WiktionaryEntry[] };
    const entries = data.nl ?? [];

    // Prefer an entry that has a real definition of the word, not just an inflection.
    const entry = entries.find((e) => e.definitions?.some((d) => !isFormOf(d) && !isEmpty(d))) ?? entries[0];
    if (!entry?.definitions?.length) return null;

    const defs = entry.definitions;
    const main = defs.find((d) => !isFormOf(d) && !isEmpty(d)) ?? defs[0];
    const english = stripHtml(main.definition ?? "").slice(0, 300);
    if (!english) return null;

    const withExample = [main, ...defs].find((d) => d.parsedExamples?.some((x) => x.example));
    const ex = withExample?.parsedExamples?.find((x) => x.example);
    const partOfSpeech = POS_MAP[(entry.partOfSpeech ?? "").toLowerCase()] ?? "OTHER";
    const forms = partOfSpeech === "NOUN" ? await lookupNounForms(term) : { article: null, plural: null, diminutive: null };
    return {
      english,
      partOfSpeech,
      ...forms,
      example: ex?.example ? { dutch: stripHtml(ex.example), english: stripHtml(ex.translation ?? "") } : null,
    };
  } catch {
    return null;
  }
}
