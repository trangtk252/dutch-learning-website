import { ERROR_CATEGORY_LABELS } from "../constants";
import { makeT, type TFunction } from "../i18n/translate";
import { countWords } from "./text";
import type { RuleCorrection } from "./rules";

/**
 * Offline analysis of what a learner said, used for the speaking report when no AI provider is connected.
 * It cannot understand Dutch, so it sticks to things that can be measured or matched reliably:
 * the rule-based corrections, unfinished sentences, repetition, basic words, connectors and tense slips.
 */

export interface OfflineReport {
  grammar: { score: number; note: string };
  vocabulary: { score: number; note: string };
  fluency: { score: number; note: string };
  accuracy: { score: number; note: string };
  naturalness: { score: number; note: string };
}

const STOP = new Set([
  "de", "het", "een", "en", "of", "maar", "want", "dus", "dat", "die", "dit", "deze", "ik", "je", "jij", "u", "hij", "zij", "ze", "we", "wij", "jullie",
  "mijn", "jouw", "zijn", "haar", "ons", "onze", "ben", "bent", "is", "was", "waren", "heb", "hebt", "heeft", "hebben", "had", "van", "in", "op", "aan",
  "met", "voor", "naar", "bij", "uit", "over", "om", "te", "als", "dan", "ook", "niet", "geen", "wel", "nog", "al", "er", "hier", "daar", "wat", "wie",
  "waar", "hoe", "ja", "nee", "zo", "heel", "veel", "erg", "soms", "graag", "kan", "kunt", "kunnen", "wil", "wilt", "willen", "moet", "moeten", "zal", "ga", "gaat",
]);
/** Simple everyday words with a richer B1 alternative worth trying. */
const BASIC_ALTERNATIVES: Record<string, string[]> = {
  leuk: ["gezellig", "interessant", "prettig"],
  mooi: ["prachtig", "aantrekkelijk", "indrukwekkend"],
  goed: ["prima", "uitstekend", "fijn"],
  groot: ["enorm", "uitgebreid", "ruim"],
  dingen: ["activiteiten", "spullen", "zaken"],
  kijken: ["bekijken", "opletten", "controleren"],
};
const CONNECTORS = ["omdat", "want", "maar", "dus", "daarom", "bovendien", "hoewel", "terwijl", "daarna", "bijvoorbeeld", "toch", "echter"];
const SUGGEST_CONNECTORS = ["omdat", "maar", "dus", "bijvoorbeeld"];
const OPINION = /\b(ik vind|volgens mij|ik denk|naar mijn mening|ik geloof|aan de ene kant)\b/i;
/** A sentence ending on one of these is almost certainly cut off. */
const DANGLING = new Set(["dat", "omdat", "en", "maar", "of", "want", "dus", "de", "het", "een", "van", "met", "in", "op", "naar", "voor", "bij", "over", "als", "mijn", "te", "om", "dan"]);
const PAST_MARKERS = /\b(gisteren|eergisteren|vorige week|vorig jaar|vorige maand|vanochtend|vanmorgen|toen)\b/i;
const PRESENT_FORMS = /\b(ga|werk|woon|eet|doe|kom|speel|maak|zie|koop|lees|drink|sport|kook|verf|wandel|ben|heb)\b/i;
const HAS_PAST = /\b(was|waren|had|hadden|ging|gingen|kwam|kwamen|deed|zagen?|nam|zei|gege\p{L}*|ge\p{L}+[dt]|\p{L}+(?:te|de)n?)\b/iu;

const CLAUSE_VERBS = new Set(["was", "waren", "ben", "bent", "is", "zijn", "heb", "hebt", "heeft", "hebben", "had", "hadden", "word", "wordt", "werd", "kan", "kunt", "wil", "moet", "mag", "zal", "zou"]);
const sentencesOf = (text: string) => text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
const words = (text: string) => text.toLowerCase().match(/\p{L}+(?:['’-]\p{L}+)*/gu) ?? [];
const sentence = (parts: string[]) => parts.map((p) => (/[.!?…]$/.test(p) ? p : `${p}.`)).join(" ");
const list = (items: string[]) => items.map((i) => `“${i}”`).join(", ");

export function buildOfflineReport(args: {
  turns: string[];
  corrections: RuleCorrection[];
  isExam: boolean;
  t?: TFunction;
  clamp: (n: number) => number;
  /** Dictionary lookup (parts of speech of a word; [] = unknown, null = no dictionary). Optional. */
  posOf?: (word: string) => string[] | null;
}): OfflineReport {
  const t = args.t ?? makeT(null);
  const { turns, corrections, clamp } = args;
  const nTurns = Math.max(1, turns.length);
  const all = turns.flatMap(words);
  const total = all.length;
  const unique = new Set(all).size;
  const avgWords = turns.length ? turns.reduce((n, x) => n + countWords(x), 0) / turns.length : 0;
  const sentences = turns.flatMap(sentencesOf);

  // --- Findings ---------------------------------------------------------------------------------
  const counts = new Map<string, number>();
  for (const w of all) if (w.length >= 4 && !STOP.has(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
  const repeated = [...counts].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w]) => w);
  const basic = Object.keys(BASIC_ALTERNATIVES).filter((w) => counts.has(w)).slice(0, 2);
  const connectorsUsed = CONNECTORS.filter((c) => all.includes(c));
  const connectorTips = SUGGEST_CONNECTORS.filter((c) => !all.includes(c)).slice(0, 3);
  const unfinished = sentences.filter((s) => { const w = words(s); return w.length >= 2 && DANGLING.has(w[w.length - 1] ?? ""); });
  const tenseSlip = sentences.find((s) => PAST_MARKERS.exec(s) && PRESENT_FORMS.test(s) && !HAS_PAST.test(s));
  const starts = sentences.map((s) => words(s)[0]).filter((w): w is string => Boolean(w));
  const topStart = [...starts.reduce((m, w) => m.set(w, (m.get(w) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1])[0];
  const sameStart = topStart && starts.length >= 3 && topStart[1] / starts.length >= 0.6 ? topStart[0] : null;
  // Dictionary-based checks: words the dictionary doesn't know, and a non-verb right after the subject ("ik knus").
  const SUBJECTS = new Set(["ik", "jij", "hij", "zij", "ze", "wij", "we", "jullie", "u"]);
  const unknown: string[] = [];
  const notVerb: { subj: string; w: string; pos: string }[] = [];
  if (args.posOf) {
    const posOf = args.posOf;
    const listed = (w: string) => (posOf(w)?.length ?? 1) > 0;
    // Known directly, or as an inflected form (winterse), or as a compound of two known words (buurt+feest, huur+prijs).
    const isKnown = (w: string): boolean => {
      if (listed(w)) return true;
      for (const suffix of ["e", "en", "s", "er", "ers", "je", "jes", "n", "t", "te", "de"]) {
        if (w.endsWith(suffix) && w.length - suffix.length >= 3 && listed(w.slice(0, -suffix.length))) return true;
      }
      for (let i = 3; i <= w.length - 3; i++) {
        const head = w.slice(0, i);
        if (listed(w.slice(i)) && (listed(head) || (/(s|e)$/.test(head) && listed(head.slice(0, -1))) || (/en$/.test(head) && listed(head.slice(0, -2))))) return true;
      }
      return false;
    };
    for (const w of new Set(all)) if (w.length >= 3 && /^\p{L}+$/u.test(w) && !isKnown(w)) unknown.push(w);
    for (const s of sentences) {
      const ws = words(s);
      ws.forEach((w, i) => {
        const next = ws[i + 1];
        if (!next || !SUBJECTS.has(w) || next.length < 3) return;
        // "toen ik klein was": an adjective before the verb at the end of a subordinate clause is fine.
        if (ws.slice(i + 2).some((x) => CLAUSE_VERBS.has(x))) return;
        const pos = args.posOf?.(next);
        if (pos && pos.length && pos.every((p) => p === "adj" || p === "noun") && !notVerb.some((x) => x.w === next)) {
          notVerb.push({ subj: w, w: next, pos: pos.includes("adj") ? "adjective" : "noun" });
        }
      });
    }
  }
  const problems = corrections.length + unfinished.length + notVerb.length + (tenseSlip ? 1 : 0);
  const hasOpinion = turns.some((x) => OPINION.test(x));

  const grammarFixes = corrections.filter((c) => c.category !== "VOCABULARY_CHOICE" && c.category !== "OTHER");
  const vocabFixes = corrections.filter((c) => c.category === "VOCABULARY_CHOICE");
  const fix = (c: RuleCorrection) => `“${c.original}” → “${c.corrected}”`;

  // --- Grammar ----------------------------------------------------------------------------------
  const g: string[] = [];
  if (grammarFixes.length) {
    const first = grammarFixes[0];
    g.push(t("{n} grammar point(s) to fix. Example: {fix} — {why}", { n: grammarFixes.length, fix: fix(first), why: first.explanation }));
    if (grammarFixes.length > 1) g.push(t("Also: {list}", { list: grammarFixes.slice(1, 3).map(fix).join("; ") }));
  }
  for (const x of notVerb.slice(0, 2)) g.push(t("After “{subj}” a verb is expected, but “{w}” is not a verb (the dictionary lists it as: {pos}).", { subj: x.subj, w: x.w, pos: t(x.pos) }));
  for (const s of unfinished.slice(0, 2)) g.push(t("This sentence seems unfinished: “{s}” — finish it with the verb or a reason (“Ik vind dat … omdat …”).", { s }));
  if (tenseSlip) g.push(t("“{s}” talks about the past, so use the perfect (“ik ben … gegaan”, “ik heb … gewerkt”) or the imperfect (“ik ging”, “ik werkte”).", { s: tenseSlip }));
  if (!g.length) g.push(t("No common grammar errors were detected by the offline checker."), t("It only knows frequent patterns, so ask a teacher to check subtler points."));
  if (total < 8) g.push(t("There is too little text to judge reliably — say a few full sentences to get a meaningful score."));

  // --- Vocabulary -------------------------------------------------------------------------------
  const v: string[] = [t("You used {unique} different words out of {total}.", { unique, total })];
  if (unknown.length) v.push(t("Not found in the dictionary: {list} — check the spelling (speech recognition may have misheard you).", { list: list(unknown.slice(0, 4)) }));
  if (vocabFixes.length) v.push(t("Word choice: {fix} — {why}", { fix: fix(vocabFixes[0]), why: vocabFixes[0].explanation }));
  if (repeated.length) v.push(t("You repeated {list}; try synonyms or a pronoun.", { list: list(repeated) }));
  for (const w of basic) v.push(t("Instead of “{w}” try {alts}.", { w, alts: list(BASIC_ALTERNATIVES[w]) }));
  if (connectorsUsed.length) v.push(t("Good use of connectors: {list}.", { list: list(connectorsUsed.slice(0, 3)) }));
  else v.push(t("Link your ideas with connectors such as {list}.", { list: list(connectorTips) }));
  if (args.isExam && !hasOpinion) v.push(t("For opinion questions add phrases like “Ik vind dat …”, “Volgens mij …” or “Aan de ene kant … aan de andere kant …”."));

  // --- Fluency ----------------------------------------------------------------------------------
  const f: string[] = [turns.length === 1
    ? t("You said about {words} words in your answer.", { words: Math.round(avgWords) })
    : t("You averaged about {words} words per turn across {turns} turns.", { words: Math.round(avgWords), turns: turns.length })];
  if (avgWords < 10) f.push(t("Your answers are short — aim for 2–3 sentences (15–25 words) with a reason (“omdat …”) and an example."));

  // --- Accuracy ---------------------------------------------------------------------------------
  const byType = new Map<string, number>();
  for (const c of corrections) byType.set(c.category, (byType.get(c.category) ?? 0) + 1);
  const a: string[] = [problems ? t("{n} issue(s) found by the offline rule checker.", { n: problems }) : t("No issues found by the offline rule checker.")];
  if (unfinished.length) byType.set("UNFINISHED", unfinished.length);
  if (notVerb.length) byType.set("NOT_A_VERB", notVerb.length);
  if (byType.size) a.push(t("By type: {list}.", { list: [...byType].map(([k, n]) => `${k === "UNFINISHED" ? t("Unfinished sentence") : k === "NOT_A_VERB" ? t("Verb missing") : t(ERROR_CATEGORY_LABELS[k as keyof typeof ERROR_CATEGORY_LABELS] ?? k)} ×${n}`).join(", ") }));

  // --- Naturalness ------------------------------------------------------------------------------
  const n: string[] = [];
  if (sameStart) n.push(t("Most of your sentences start with “{w}”. Vary the start with a time or place (“Op zaterdag …”, “In mijn vrije tijd …”).", { w: sameStart }));
  n.push(t("Naturalness can only be judged with an AI provider connected."));

  const cap = (score: number) => (total < 8 ? Math.min(score, 3) : score); // too little text to earn top marks
  return {
    grammar: { score: clamp(cap(5 - ((grammarFixes.length + notVerb.length) / nTurns) * 1.5 - unfinished.length * 1.2 - (tenseSlip ? 0.5 : 0))), note: sentence(g) },
    vocabulary: { score: clamp(1 + unique / 7 + Math.min(2, connectorsUsed.length) * 0.5 - vocabFixes.length * 0.5 - unknown.length * 0.5 - (repeated.length > 1 ? 0.5 : 0)), note: sentence(v) },
    fluency: { score: clamp(avgWords / 4 - unfinished.length * 0.3), note: sentence(f) },
    accuracy: { score: clamp(cap(5 - (problems / nTurns) * 2)), note: sentence(a) },
    naturalness: { score: clamp(3 + (connectorsUsed.length >= 2 ? 0.5 : 0) - (sameStart ? 0.5 : 0)), note: sentence(n) },
  };
}
