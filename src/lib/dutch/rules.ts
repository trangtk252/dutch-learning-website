import type { ErrorCategoryKey } from "../constants";

/**
 * A small, conservative rule-based checker for very common learner errors.
 *
 * It is used ONLY by the offline mock AI provider so the correction flows can be
 * exercised without an API key. It deliberately covers few patterns and favours
 * precision over recall; real feedback comes from the language model.
 */

export interface RuleCorrection {
  original: string;
  corrected: string;
  category: ErrorCategoryKey;
  explanation: string;
}

const ZIJN_FORMS = "ben|bent|is|zijn";
const HEBBEN_FORMS = "heb|hebt|heeft|hebben";

/** Verbs that take "zijn" in the perfect tense, with their participles. */
const ZIJN_VERBS: Record<string, string> = {
  gaan: "gegaan", komen: "gekomen", blijven: "gebleven", worden: "geworden",
  vallen: "gevallen", sterven: "gestorven", verhuizen: "verhuisd", vertrekken: "vertrokken",
  beginnen: "begonnen", stoppen: "gestopt", verdwijnen: "verdwenen", gebeuren: "gebeurd",
};
const PARTICIPLE_TO_ZIJN_VERB = new Map(Object.entries(ZIJN_VERBS).map(([inf, pp]) => [pp, inf]));

const SUBJECT_VERB_FIXES: Array<[RegExp, string, string]> = [
  [/\b(ik) (heeft|hebt)\b/i, "$1 heb", "With 'ik' the form of 'hebben' is 'heb'."],
  [/\b(ik) (is|bent)\b/i, "$1 ben", "With 'ik' the form of 'zijn' is 'ben'."],
  [/\b(hij|zij|ze|het) (heb|hebben)\b/i, "$1 heeft", "With 'hij/zij/het' the form of 'hebben' is 'heeft'."],
  [/\b(hij|zij|het) (ben|bent)\b/i, "$1 is", "With 'hij/zij/het' the form of 'zijn' is 'is'."],
  [/\b(wij|we|jullie) (heeft|heb)\b/i, "$1 hebben", "With plural subjects the form of 'hebben' is 'hebben'."],
  [/\b(wij|we|jullie) (is|ben)\b/i, "$1 zijn", "With plural subjects the form of 'zijn' is 'zijn'."],
];

/** Frequent het-words learners often use with "de". */
const HET_WORDS = [
  "huis", "kind", "boek", "werk", "weer", "eten", "water", "geld", "land", "jaar", "uur",
  "bed", "raam", "meisje", "probleem", "idee", "restaurant", "station", "museum", "nieuws",
  "bedrijf", "gesprek", "examen", "appartement", "verhaal", "woord", "antwoord", "leven",
];
/** Frequent de-words learners often use with "het". */
const DE_WORDS = [
  "man", "vrouw", "stad", "straat", "fiets", "auto", "trein", "dag", "week", "tijd", "kamer",
  "school", "taal", "vraag", "baan", "deur", "tafel", "winkel", "dokter", "huisarts", "gemeente",
];

const FINITE_VERBS = new Set([
  "ben", "bent", "is", "zijn", "heb", "hebt", "heeft", "hebben", "wil", "wilt", "willen",
  "kan", "kun", "kunt", "kunnen", "moet", "moeten", "mag", "mogen", "ga", "gaat", "gaan",
  "woon", "woont", "wonen", "werk", "werkt", "werken", "vind", "vindt", "vinden",
  "spreek", "spreekt", "spreken", "kom", "komt", "komen", "leer", "leert", "leren",
]);
const SUBORDINATORS = "omdat|dat|als|wanneer|terwijl|hoewel|zodat|of|nadat|voordat|totdat";
const SUBJECTS = "ik|jij|je|hij|zij|ze|we|wij|u|jullie|het|mijn \\w+|de \\w+";

export function checkSentence(sentence: string): RuleCorrection[] {
  const out: RuleCorrection[] = [];
  let current = sentence;

  const apply = (next: string, category: ErrorCategoryKey, explanation: string) => {
    if (next !== current) {
      out.push({ original: current, corrected: next, category, explanation });
      current = next;
    }
  };

  // 1. Subject–verb agreement for hebben/zijn.
  for (const [re, replacement, explanation] of SUBJECT_VERB_FIXES) {
    if (re.test(current)) apply(current.replace(re, replacement), "VERB_CONJUGATION", explanation);
  }

  // 2. Perfect tense: "ik ben … gaan" → "gegaan" (infinitive used instead of participle).
  const perfectInf = new RegExp(`\\b(${ZIJN_FORMS}|${HEBBEN_FORMS})\\b(.*?)\\b(${Object.keys(ZIJN_VERBS).join("|")})([.!?]?)\\s*$`, "i");
  const m1 = current.match(perfectInf);
  if (m1 && !/\b(wil|kan|moet|ga|gaat|gaan|zal|zullen|te)\b/i.test(m1[2])) {
    const inf = m1[3].toLowerCase();
    apply(
      current.replace(perfectInf, `$1$2${ZIJN_VERBS[inf]}$4`),
      "PERFECT_TENSE",
      `In the perfect tense, use the past participle: '${inf}' → '${ZIJN_VERBS[inf]}'.`,
    );
  }

  // 3. Auxiliary: verbs of movement/change take "zijn", not "hebben".
  const auxRe = new RegExp(`\\b(${HEBBEN_FORMS})\\b(.*\\b(${[...PARTICIPLE_TO_ZIJN_VERB.keys()].join("|")})\\b)`, "i");
  const m2 = current.match(auxRe);
  if (m2) {
    const map: Record<string, string> = { heb: "ben", hebt: "bent", heeft: "is", hebben: "zijn" };
    const aux = m2[1].toLowerCase();
    const inf = PARTICIPLE_TO_ZIJN_VERB.get(m2[3].toLowerCase());
    apply(
      current.replace(auxRe, `${map[aux]}$2`),
      "PERFECT_TENSE",
      `'${inf}' forms the perfect tense with 'zijn', not 'hebben' (e.g. 'ik ben ${m2[3].toLowerCase()}').`,
    );
  }

  // 4. Subordinate clause: finite verb must go to the end.
  const subRe = new RegExp(`\\b(${SUBORDINATORS}) (${SUBJECTS}) (\\w+) ([^.,!?;]+)`, "i");
  const m3 = current.match(subRe);
  if (m3 && FINITE_VERBS.has(m3[3].toLowerCase())) {
    const rest = m3[4].trim();
    apply(
      current.replace(subRe, `${m3[1]} ${m3[2]} ${rest} ${m3[3]}`),
      "SUBORDINATE_CLAUSES",
      `After '${m3[1].toLowerCase()}' the conjugated verb moves to the end of the clause.`,
    );
  }

  // 5. de/het for common nouns.
  for (const w of HET_WORDS) {
    const re = new RegExp(`\\b([Dd])e ${w}\\b`);
    if (re.test(current)) {
      apply(current.replace(re, (_m, d: string) => `${d === "D" ? "H" : "h"}et ${w}`), "DE_HET", `'${w}' is a het-word: 'het ${w}'.`);
    }
  }
  for (const w of DE_WORDS) {
    const re = new RegExp(`\\b([Hh])et ${w}\\b`);
    if (re.test(current)) {
      apply(current.replace(re, (_m, h: string) => `${h === "H" ? "D" : "d"}e ${w}`), "DE_HET", `'${w}' is a de-word: 'de ${w}'.`);
    }
  }

  // 6. "niet een" → "geen".
  if (/\bniet een\b/i.test(current)) {
    apply(current.replace(/\bniet een\b/i, "geen"), "NEGATION", "Use 'geen' (not 'niet een') to negate a noun with an indefinite article.");
  }

  return out;
}

/** Applies all rule corrections and returns the final corrected text. */
export function correctText(text: string): { corrected: string; corrections: RuleCorrection[] } {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const corrections: RuleCorrection[] = [];
  const fixed = sentences.map((s) => {
    const found = checkSentence(s);
    if (found.length === 0) return s;
    // Report each fix against the learner's original sentence for clarity.
    corrections.push(
      ...found.map((c, i) => ({ ...c, original: i === 0 ? s : found[i - 1].corrected })),
    );
    return found[found.length - 1].corrected;
  });
  return { corrected: fixed.join(" "), corrections };
}
