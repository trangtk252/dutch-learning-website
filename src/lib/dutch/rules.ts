import type { ErrorCategoryKey } from "../constants";
import { makeT, type TFunction } from "../i18n/translate";

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
  "was", "waren", "had", "hadden", "ging", "gingen", "kwam", "kwamen", "wilde", "kon", "moest",
  "zie", "ziet", "doe", "doet", "eet", "drink", "drinkt", "kook", "kookt", "speel", "speelt", "lees", "leest", "maak", "maakt",
  "sport", "sporten", "studeer", "studeert", "denk", "denkt", "weet", "weten", "wordt", "word", "zal", "zult", "zou", "slaap", "slaapt",
  "hou", "houdt", "fiets", "fietst", "wandel", "wandelt", "verf", "verft", "praat", "praat", "heet", "hoop", "hoopt",
]);
const SUBORDINATORS = "omdat|dat|als|wanneer|terwijl|hoewel|zodat|of|nadat|voordat|totdat";
const SUBJECTS = "ik|jij|je|hij|zij|ze|we|wij|u|jullie|het|mijn \\w+|de \\w+";


const V2_ADVERBS = "soms|vaak|altijd|meestal|misschien|gisteren|vandaag|morgen|daarna|later|eerst|daarom|dus|helaas|gelukkig";
const REPEAT_OK = new Set(["had", "dat", "die", "wie", "wat", "is", "zijn", "doen", "nu", "ja", "nee", "zo", "heel", "kleine", "lange", "bye", "je", "we", "u"]);
/** Unambiguous English words learners slip into Dutch sentences, with the Dutch to use ("a/b" = alternatives). */
const ENGLISH_TO_DUTCH: [string, string][] = [
  ["because", "omdat/want"], ["but", "maar"], ["very", "heel"], ["with", "met"], ["really", "echt"], ["maybe", "misschien"],
  ["actually", "eigenlijk"], ["always", "altijd"], ["never", "nooit"], ["sometimes", "soms"], ["today", "vandaag"],
  ["tomorrow", "morgen"], ["yesterday", "gisteren"], ["and", "en"], ["the", "de/het"], ["like", "leuk vinden"], ["work", "werken/werk"],
];

/** Words directly before "ik/hij" that make a following infinitive correct ("wil ik werken"). */
const INFINITIVE_TRIGGERS = new Set([
  "wil", "wilt", "willen", "kan", "kun", "kunt", "kunnen", "moet", "moeten", "mag", "mogen", "zal", "zul", "zult", "zullen",
  "zou", "zouden", "ga", "gaat", "gaan", "laat", "laten", "hoef", "hoeft", "durf", "blijf", "blijft", "kom", "komt",
  "hoor", "hoort", "zie", "ziet", "voel", "voelt", "help", "helpt", "om", "te", "heb", "heeft", "hebben", "had", "ben", "is", "was",
  "wat", "waar", "hoe", "waarom", "wanneer", "wie", "welke", "voor", "dat", "als", "of", "omdat", "mensen", "kinderen", "vrienden",
  "ging", "gingen", "kon", "konden", "wilde", "wilden", "moest", "moesten", "mocht", "mochten", "zou", "liet", "bleef", "bleven",
  "kwam", "kwamen", "hoorde", "zag", "zagen", "voelde", "hielp", "durfde", "begon", "begonnen", "probeer", "probeert", "stop", "stopt",
  "en", "maar", "noch", // "mijn broer en ik wonen": a plural subject keeps the infinitive-like form
]);
const AUX_AFTER = new Set(["heb", "hebt", "heeft", "hebben", "had", "hadden", "ben", "bent", "is", "zijn", "was", "waren", "wil", "kan", "moet", "mag", "zal", "zou", "kon", "wilde", "moest", "wordt", "worden"]);
const NOT_VERBS = new Set([
  "gisteren", "morgen", "eergisteren", "overmorgen", "negen", "zeven", "tegen", "heden", "misschien", "tussen", "binnen", "buiten",
  "boven", "samen", "even", "open", "eigen", "mensen", "kinderen", "vrienden", "dagen", "weken", "maanden", "jaren",
]);
/** -eren verbs of foreign origin keep the stress: studeren → studeer (native ones: luisteren → luister). */
const EER_VERBS = new Set(["studeren", "reageren", "repareren", "parkeren", "telefoneren", "organiseren", "fotograferen", "passeren", "controleren", "accepteren", "reserveren", "excuseren", "discussiëren", "kopiëren"]);
const IRREGULAR: Record<string, { ik: string; hij: string }> = {
  komen: { ik: "kom", hij: "komt" }, worden: { ik: "word", hij: "wordt" }, zullen: { ik: "zal", hij: "zal" }, willen: { ik: "wil", hij: "wil" },
  kunnen: { ik: "kan", hij: "kan" }, mogen: { ik: "mag", hij: "mag" }, moeten: { ik: "moet", hij: "moet" }, gaan: { ik: "ga", hij: "gaat" },
  staan: { ik: "sta", hij: "staat" }, slaan: { ik: "sla", hij: "slaat" }, doen: { ik: "doe", hij: "doet" }, zien: { ik: "zie", hij: "ziet" },
  zijn: { ik: "ben", hij: "is" }, hebben: { ik: "heb", hij: "heeft" }, weten: { ik: "weet", hij: "weet" }, houden: { ik: "hou", hij: "houdt" },
  eten: { ik: "eet", hij: "eet" }, laten: { ik: "laat", hij: "laat" },
};
/** Verbs whose infinitive is not enough to derive the stem; handled above. Everything else follows the regular spelling rules. */
const VOWELS = /[aeiou]/;

/** First-person stem of a regular Dutch infinitive: koken → kook, verven → verf, zitten → zit, werken → werk. */
export function dutchStem(inf: string): string {
  if (EER_VERBS.has(inf.toLowerCase())) return inf.toLowerCase().replace(/en$/, "").replace(/ë/g, "e").replace(/er$/, "eer");
  let r = inf.toLowerCase().replace(/en$/, "");
  if (/(\p{L})\1$/u.test(r) && !/(aa|ee|oo|uu)$/.test(r)) r = r.slice(0, -1); // zitten → zit
  else if (!/[aeiou]{2}$/.test(r) && /^(?:[^aeiou]*)([aeiou])([^aeiou])$/.test(r) && !(r.length >= 5 && /(el|er|em|en)$/.test(r))) {
    // open syllable: ko-ken → kook, pra-ten → praat
    r = r.replace(/([aeiou])([^aeiou])$/, "$1$1$2");
  } else if (/([^aeiou])([aeiou])([^aeiou])$/.test(r) && r.length >= 5 && !/(el|er|em|en)$/.test(r) && !/[aeiou]{2}[^aeiou]$/.test(r) && !/[^aeiou]{2}$/.test(r)) {
    r = r.replace(/([aeiou])([^aeiou])$/, "$1$1$2"); // multi-syllable open syllable: be-ta-len → betaal
  }
  if (/v$/.test(r)) r = r.slice(0, -1) + "f";
  if (/z$/.test(r)) r = r.slice(0, -1) + "s";
  return r;
}

/** Finite form for "ik"/"hij"/"jij" derived from an infinitive, or null when the word probably is not a verb or the infinitive is correct here. */
function finiteForm(inf: string, subj: string, prev: string | undefined): string | null {
  const w = inf.toLowerCase();
  if (NOT_VERBS.has(w) || /^ge\p{L}+en$/u.test(w)) return null; // ge-…-en is a participle
  if (prev && INFINITIVE_TRIGGERS.has(prev.toLowerCase())) return null;
  const irr = IRREGULAR[w];
  if (!irr && w.length < 5) return null;
  if (!irr && /^(ont|her|er|ver)ken$/.test(w)) return null;
  const ik = irr ? irr.ik : dutchStem(w);
  if (subj === "ik") return ik;
  if (irr) return irr.hij;
  return /t$/.test(ik) ? ik : `${ik}t`;
}

export function checkSentence(sentence: string, t: TFunction = makeT(null)): RuleCorrection[] {
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
    if (re.test(current)) apply(current.replace(re, replacement), "VERB_CONJUGATION", t(explanation));
  }

  // 2. Perfect tense: "ik ben … gaan" → "gegaan" (infinitive used instead of participle).
  const perfectInf = new RegExp(`\\b(${ZIJN_FORMS}|${HEBBEN_FORMS})\\b(.*?)\\b(${Object.keys(ZIJN_VERBS).join("|")})([.!?]?)\\s*$`, "i");
  const m1 = current.match(perfectInf);
  if (m1 && !/\b(wil|kan|moet|ga|gaat|gaan|zal|zullen|te)\b/i.test(m1[2])) {
    const inf = m1[3].toLowerCase();
    apply(
      current.replace(perfectInf, `$1$2${ZIJN_VERBS[inf]}$4`),
      "PERFECT_TENSE",
      t("In the perfect tense, use the past participle: '{inf}' → '{pp}'.", { inf, pp: ZIJN_VERBS[inf] }),
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
      t("'{inf}' forms the perfect tense with 'zijn', not 'hebben' (e.g. 'ik ben {pp}').", { inf: inf ?? "", pp: m2[3].toLowerCase() }),
    );
  }

  // 4. Subordinate clause: finite verb must go to the end.
  const subRe = new RegExp(`\\b(${SUBORDINATORS}) (${SUBJECTS}) (\\w+) ([^.,!?;]+)`, "i");
  const m3 = current.match(subRe);
  // "of ik kan komen" is fine: a modal followed by an infinitive may keep either order.
  const modalCluster = m3 && /^(kan|kun|kunt|moet|wil|wilt|mag|zal|zou|kon|moest|wilde|mocht)$/i.test(m3[3]) && /\b\p{L}+en\s*$/u.test(m3[4].trim());
  if (m3 && !modalCluster && FINITE_VERBS.has(m3[3].toLowerCase())) {
    const rest = m3[4].trim();
    apply(
      current.replace(subRe, `${m3[1]} ${m3[2]} ${rest} ${m3[3]}`),
      "SUBORDINATE_CLAUSES",
      t("After '{word}' the conjugated verb moves to the end of the clause.", { word: m3[1].toLowerCase() }),
    );
  }

  // 5. de/het for common nouns.
  for (const w of HET_WORDS) {
    const re = new RegExp(`\\b([Dd])e ${w}\\b`);
    if (re.test(current)) {
      apply(current.replace(re, (_m, d: string) => `${d === "D" ? "H" : "h"}et ${w}`), "DE_HET", t("'{w}' is a het-word: 'het {w}'.", { w }));
    }
  }
  for (const w of DE_WORDS) {
    const re = new RegExp(`\\b([Hh])et ${w}\\b`);
    if (re.test(current)) {
      apply(current.replace(re, (_m, h: string) => `${h === "H" ? "D" : "d"}e ${w}`), "DE_HET", t("'{w}' is a de-word: 'de {w}'.", { w }));
    }
  }

  // 6. "niet een" → "geen".
  if (/\bniet een\b/i.test(current)) {
    apply(current.replace(/\bniet een\b/i, "geen"), "NEGATION", t("Use 'geen' (not 'niet een') to negate a noun with an indefinite article."));
  }

  // 7. Verb used as an infinitive after the subject: "ik verven" → "ik verf", "hij werken" → "hij werkt".
  current = current.replace(
    /(?:(\p{L}+)\s+)?\b(ik|hij|jij)\s+(\p{L}+en)\b(?:\s+(\p{L}+))?/giu,
    (whole, prev: string | undefined, subj: string, inf: string, after: string | undefined) => {
      // "omdat ik gegeten had": a participle before its auxiliary is correct.
      if (after && AUX_AFTER.has(after.toLowerCase())) return whole;
      const form = finiteForm(inf, subj.toLowerCase(), prev);
      if (!form) return whole;
      const next = `${prev ? `${prev} ` : ""}${subj} ${form}${after ? ` ${after}` : ""}`;
      out.push({
        original: current, category: "VERB_CONJUGATION",
        corrected: current.replace(whole, next),
        explanation: t("With '{subj}' the verb takes its own ending, not the infinitive: '{inf}' → '{form}'.", { subj: subj.toLowerCase(), inf: inf.toLowerCase(), form }),
      });
      return next;
    },
  );
  // 7b. Same mistake after the verb is moved to the front ("soms sporten ik" → "soms sport ik").
  current = current.replace(
    /\b(\p{L}+en)\s+(ik|hij)\b/giu,
    (whole, inf: string, subj: string) => {
      const form = finiteForm(inf, subj.toLowerCase(), undefined);
      if (!form) return whole;
      const next = `${form} ${subj}`;
      out.push({
        original: current, category: "VERB_CONJUGATION",
        corrected: current.replace(whole, next),
        explanation: t("With '{subj}' the verb takes its own ending, not the infinitive: '{inf}' → '{form}'.", { subj: subj.toLowerCase(), inf: inf.toLowerCase(), form }),
      });
      return next;
    },
  );

  // 8. Verb second: after an adverb in first position the verb comes before the subject.
  const v2 = new RegExp(`\\b(${V2_ADVERBS}) (ik|jij|hij|zij|ze|we|wij|jullie) (${[...FINITE_VERBS].join("|")})\\b`, "i");
  const m8 = current.match(v2);
  if (m8) {
    apply(
      current.replace(v2, `${m8[1]} ${m8[3]} ${m8[2]}`),
      "WORD_ORDER",
      t("In a Dutch main clause the verb is in 2nd position: after '{adv}' the verb comes before the subject ('{adv} {verb} {subj}').", { adv: m8[1].toLowerCase(), verb: m8[3], subj: m8[2] }),
    );
  }

  // 9. "veel" is for amounts; before an adjective use "heel".
  const veel = /\bveel (mooi|leuk|goed|groot|klein|lekker|interessant|moeilijk|makkelijk|belangrijk|gezellig|druk|warm|koud|duur|lang|snel|aardig|vriendelijk)\b/i;
  if (veel.test(current)) {
    apply(current.replace(veel, "heel $1"), "VOCABULARY_CHOICE", t("Use 'heel' (not 'veel') before an adjective: 'heel mooi'."));
  }

  // 10. doen vs maken in fixed expressions.
  const doen = /\b(doe|doet|doen|deed|deden) (een|de|mijn|zijn|haar) (fout|afspraak|foto|wandeling|reis|plan|keuze|opmerking)\b/i;
  const md = current.match(doen);
  if (md) {
    const maken: Record<string, string> = { doe: "maak", doet: "maakt", doen: "maken", deed: "maakte", deden: "maakten" };
    apply(
      current.replace(doen, `${maken[md[1].toLowerCase()]} $2 $3`),
      "VOCABULARY_CHOICE",
      t("Say '{phrase}' with 'maken', not 'doen'.", { phrase: `${md[2].toLowerCase()} ${md[3].toLowerCase()}` }),
    );
  }

  // 11. Age: Dutch uses "zijn", not "hebben".
  const age = /\b(ik|jij|hij|zij|ze|wij|we) (heb|hebt|heeft|hebben) (\d{1,3}) jaar\b/i;
  const ma = current.match(age);
  if (ma) {
    const beForm: Record<string, string> = { heb: "ben", hebt: "bent", heeft: "is", hebben: "zijn" };
    apply(current.replace(age, `$1 ${beForm[ma[2].toLowerCase()]} $3 jaar`), "VOCABULARY_CHOICE", t("In Dutch you 'are' your age: 'ik ben {n} jaar (oud)', not 'hebben'.", { n: ma[3] }));
  }

  // 12. English words in a Dutch sentence.
  for (const [en, nl] of ENGLISH_TO_DUTCH) {
    const re = new RegExp(`\\b${en}\\b`, "i");
    if (re.test(current)) {
      apply(current.replace(re, nl.split("/")[0]), "VOCABULARY_CHOICE", t("'{en}' is English — in Dutch say '{nl}'.", { en, nl }));
    }
  }

  // 13. A word repeated twice in a row.
  const rep = /\b(\p{L}{2,})\s+\1\b/iu;
  const mr = current.match(rep);
  if (mr && !REPEAT_OK.has(mr[1].toLowerCase())) {
    apply(current.replace(rep, "$1"), "OTHER", t("The word '{w}' is repeated.", { w: mr[1] }));
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
