import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

/**
 * Read-only access to the local Dutch<->English dictionary (prisma/dictionary.db),
 * built by `npm run db:build:dictionary` from Wiktionary data (CC BY-SA 4.0).
 */

export type DictionaryDirection = "nl" | "en" | "nl-vi" | "vi-nl";

export interface DictionarySense {
  gloss: string;
  tags: string | null;
  exampleNl: string | null;
  exampleEn: string | null;
  /** Dutch -> Vietnamese: Vietnamese words that share this sense's English meaning. */
  vietnamese?: string[];
  /** Vietnamese -> Dutch: Dutch words that share this sense's English meaning. */
  dutch?: { word: string; gender: "DE" | "HET" | null }[];
}

export interface DictionaryEntry {
  id: number;
  word: string;
  pos: string;
  gender: "DE" | "HET" | null;
  plural: string | null;
  diminutive: string | null;
  forms: string | null;
  ipa: string | null;
  /** Set when this entry is only an inflected/alternative form of another word. */
  formOf: string | null;
  senses: DictionarySense[];
}

export interface DictionaryResults {
  /** Entries that match the query exactly (Dutch side) or by English meaning. */
  entries: DictionaryEntry[];
  /** Looser matches (words starting with the query) shown as a compact list. */
  related: { word: string; pos: string; gender: "DE" | "HET" | null; gloss: string }[];
}

const DB_PATH = path.join(process.cwd(), "prisma", "dictionary.db");
let cached: DatabaseSync | null | undefined;

function open(): DatabaseSync | null {
  if (cached !== undefined) return cached;
  cached = fs.existsSync(DB_PATH) ? new DatabaseSync(DB_PATH, { readOnly: true }) : null;
  return cached;
}

export const isDictionaryAvailable = () => open() !== null;

/**
 * Parts of speech the dictionary lists for a Dutch word (inflected forms count: "liep" → verb).
 * Empty when the word is unknown; `null` when the dictionary file isn't available.
 */
export function dutchPartsOfSpeech(word: string): string[] | null {
  const db = open();
  if (!db) return null;
  const rows = db.prepare("SELECT DISTINCT pos FROM entry WHERE norm = ?").all(normalize(word)) as unknown as { pos: string }[];
  return rows.map((r) => r.pos);
}

const normalize = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
/** Vietnamese without tone marks (đ -> d), so "nha" finds "nhà". */
const viNormalize = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/[đĐ]/g, "d").toLowerCase();
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

interface EntryRow {
  id: number; word: string; pos: string; gender: "DE" | "HET" | null; plural: string | null;
  diminutive: string | null; forms: string | null; ipa: string | null; form_of: string | null;
}
interface SenseRow { entry_id: number; gloss: string; tags: string | null; example_nl: string | null; example_en: string | null }

function withSenses(db: DatabaseSync, rows: EntryRow[], maxSenses: number): DictionaryEntry[] {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const senses = db
    .prepare(`SELECT entry_id, gloss, tags, example_nl, example_en FROM sense WHERE entry_id IN (${ids.map(() => "?").join(",")}) AND idx < ? ORDER BY entry_id, idx`)
    .all(...ids, maxSenses) as unknown as SenseRow[];
  const byEntry = new Map<number, DictionarySense[]>();
  for (const s of senses) {
    const list = byEntry.get(s.entry_id) ?? [];
    list.push({ gloss: s.gloss, tags: s.tags, exampleNl: s.example_nl, exampleEn: s.example_en });
    byEntry.set(s.entry_id, list);
  }
  return rows.map((r) => ({
    id: r.id, word: r.word, pos: r.pos, gender: r.gender, plural: r.plural, diminutive: r.diminutive,
    forms: r.forms, ipa: r.ipa, formOf: r.form_of, senses: byEntry.get(r.id) ?? [],
  }));
}

const ENTRY_COLS = "id, word, pos, gender, plural, diminutive, forms, ipa, form_of";

function dutchToEnglish(db: DatabaseSync, query: string): DictionaryResults {
  const norm = normalize(query.replace(/^(de|het|een)\s+/i, ""));
  const exact = db
    .prepare(`SELECT ${ENTRY_COLS} FROM entry WHERE norm = ? ORDER BY score DESC, id LIMIT 20`)
    .all(norm) as unknown as EntryRow[];

  // "liep" is only a form of "lopen": show the base word's full entry as well.
  const lemmas = [...new Set(exact.filter((r) => r.form_of).map((r) => r.form_of!))];
  const lemmaRows = lemmas.length
    ? (db
        .prepare(`SELECT ${ENTRY_COLS} FROM entry WHERE word IN (${lemmas.map(() => "?").join(",")}) AND form_of IS NULL ORDER BY score DESC LIMIT 10`)
        .all(...lemmas) as unknown as EntryRow[])
    : [];
  const seen = new Set(exact.map((r) => r.id));
  const rows = [...exact.filter((r) => !r.form_of), ...exact.filter((r) => r.form_of), ...lemmaRows.filter((r) => !seen.has(r.id))];

  const related = db
    .prepare(
      `SELECT e.word, e.pos, e.gender, (SELECT gloss FROM sense s WHERE s.entry_id = e.id ORDER BY idx LIMIT 1) AS gloss
       FROM entry e WHERE e.norm LIKE ? ESCAPE '\\' AND e.norm <> ? AND e.form_of IS NULL
       ORDER BY e.score DESC, length(e.word) LIMIT 12`,
    )
    .all(`${escapeLike(norm)}%`, norm) as unknown as DictionaryResults["related"];
  return { entries: withSenses(db, rows, 12), related: related.filter((r) => r.gloss) };
}

function englishToDutch(db: DatabaseSync, query: string): DictionaryResults {
  const term = query.toLowerCase().replace(/\s+/g, " ").replace(/^to\s+/, "").trim();
  const exact = db
    .prepare(
      `SELECT ${ENTRY_COLS.split(", ").map((c) => `e.${c}`).join(", ")} FROM eng_term t JOIN entry e ON e.id = t.entry_id
       WHERE t.term = ? ORDER BY t.rank + t.sense_idx, e.score DESC LIMIT 25`,
    )
    .all(term) as unknown as EntryRow[];

  const related =
    exact.length < 10
      ? (db
          .prepare(
            `SELECT e.word, e.pos, e.gender, t.term AS gloss FROM eng_term t JOIN entry e ON e.id = t.entry_id
             WHERE t.term LIKE ? ESCAPE '\\' AND t.term <> ? ORDER BY t.rank + t.sense_idx, e.score DESC LIMIT 40`,
          )
          .all(`${escapeLike(term)}%`, term) as unknown as DictionaryResults["related"])
      : [];
  return { entries: withSenses(db, exact, 3), related: dedupe(related).slice(0, 12) };
}

function dedupe<T extends { word: string; pos: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(`${i.word}|${i.pos}`) ? false : (seen.add(`${i.word}|${i.pos}`), true)));
}

/** Table check: the Vietnamese tables are added by `npm run db:build:dictionary:vi`. */
export function isVietnameseAvailable(): boolean {
  const db = open();
  if (!db) return false;
  return db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'vi_entry'").get() !== undefined;
}

const MAX_VI_PER_SENSE = 6;

/** Dutch -> Vietnamese: the normal Dutch entries, each sense annotated with Vietnamese words via the shared English meaning. */
function dutchToVietnamese(db: DatabaseSync, query: string): DictionaryResults {
  const results = dutchToEnglish(db, query);
  const ids = results.entries.filter((e) => !e.formOf).map((e) => e.id);
  if (!ids.length) return results;
  const ph = ids.map(() => "?").join(",");
  // Prefer Vietnamese words of the same part of speech; fall back to any when none match.
  const query2 = (samePos: boolean) =>
    db
      .prepare(
        `SELECT dt.entry_id AS id, dt.sense_idx AS idx, v.word AS word
         FROM eng_term dt JOIN entry e ON e.id = dt.entry_id
         JOIN vi_term vt ON vt.term = dt.term JOIN vi_entry v ON v.id = vt.entry_id
         WHERE dt.entry_id IN (${ph}) AND dt.rank < 3 AND vt.rank < 3 ${samePos ? "AND v.pos = e.pos" : ""}
         ORDER BY dt.entry_id, dt.sense_idx, dt.rank, vt.rank + vt.sense_idx, v.score DESC`,
      )
      .all(...ids) as unknown as { id: number; idx: number; word: string }[];
  let rows = query2(true);
  const covered = new Set(rows.map((r) => r.id));
  if (covered.size < ids.length) rows = [...rows, ...query2(false).filter((r) => !covered.has(r.id))];

  const bySense = new Map<string, string[]>();
  for (const r of rows) {
    const key = `${r.id}:${r.idx}`;
    const list = bySense.get(key) ?? [];
    if (list.length < MAX_VI_PER_SENSE && !list.includes(r.word)) list.push(r.word);
    bySense.set(key, list);
  }
  for (const entry of results.entries) {
    entry.senses.forEach((s, i) => { s.vietnamese = bySense.get(`${entry.id}:${i}`) ?? []; });
  }
  return results;
}

interface ViRow { id: number; word: string; pos: string; ipa: string | null }

/** Vietnamese -> Dutch: Vietnamese entries (with English glosses), each sense annotated with Dutch words. */
function vietnameseToDutch(db: DatabaseSync, query: string): DictionaryResults {
  const lw = query.normalize("NFC").toLowerCase();
  const norm = viNormalize(query);
  // Exact spelling (with tone marks) first, then the same letters without marks.
  const rows = db
    .prepare("SELECT id, word, pos, ipa FROM vi_entry WHERE norm = ? ORDER BY (lw = ?) DESC, score DESC, id LIMIT 12")
    .all(norm, lw) as unknown as ViRow[];

  const entries: DictionaryEntry[] = rows.map((r) => ({
    id: r.id, word: r.word, pos: r.pos, gender: null, plural: null, diminutive: null, forms: null, ipa: r.ipa, formOf: null,
    senses: (db.prepare("SELECT gloss, tags FROM vi_sense WHERE entry_id = ? ORDER BY idx").all(r.id) as unknown as { gloss: string; tags: string | null }[])
      .map((s) => ({ gloss: s.gloss, tags: s.tags, exampleNl: null, exampleEn: null, dutch: [] })),
  }));

  const dutchStmt = db.prepare(
    `SELECT e.word AS word, e.gender AS gender
     FROM vi_term vt JOIN eng_term et ON et.term = vt.term JOIN entry e ON e.id = et.entry_id
     WHERE vt.entry_id = ? AND vt.sense_idx = ? AND vt.rank < 3 AND et.rank < 3 AND e.form_of IS NULL AND e.pos = ?
     ORDER BY vt.rank, et.rank + et.sense_idx, e.score DESC LIMIT 30`,
  );
  for (const entry of entries) {
    entry.senses.forEach((s, i) => {
      const seen = new Set<string>();
      for (const d of dutchStmt.all(entry.id, i, entry.pos) as unknown as { word: string; gender: "DE" | "HET" | null }[]) {
        if (seen.size < 6 && !seen.has(d.word)) { seen.add(d.word); s.dutch!.push(d); }
      }
    });
  }

  const related = db
    .prepare(
      `SELECT e.word, e.pos, (SELECT gloss FROM vi_sense s WHERE s.entry_id = e.id ORDER BY idx LIMIT 1) AS gloss
       FROM vi_entry e WHERE e.norm LIKE ? ESCAPE '\\' AND e.norm <> ? ORDER BY e.score DESC, length(e.word) LIMIT 12`,
    )
    .all(`${escapeLike(norm)}%`, norm) as unknown as { word: string; pos: string; gloss: string }[];
  return { entries, related: related.map((r) => ({ ...r, gender: null })) };
}

export interface VerbPrincipalParts {
  pastSingular: string;
  pastPlural: string;
  pastParticiple: string;
}

/**
 * Past tense (singular / plural) and past participle of a Dutch verb, e.g. lopen -> liep, liepen, gelopen.
 * Returns null when the verb isn't in the dictionary or Wiktionary lists no complete set of forms.
 */
export function getVerbPrincipalParts(lemma: string): VerbPrincipalParts | null {
  const db = open();
  if (!db) return null;
  const rows = db
    .prepare("SELECT forms FROM entry WHERE norm = ? AND pos = 'verb' AND form_of IS NULL AND forms IS NOT NULL ORDER BY score DESC, id LIMIT 1")
    .all(normalize(lemma)) as unknown as { forms: string }[];
  const [pastSingular, pastPlural, pastParticiple] = rows[0]?.forms.split(" · ") ?? [];
  return pastSingular && pastPlural && pastParticiple ? { pastSingular, pastPlural, pastParticiple } : null;
}

export function searchDictionary(query: string, direction: DictionaryDirection): DictionaryResults | null {
  const db = open();
  if (!db) return null;
  const q = query.trim().slice(0, 80);
  if (!q) return { entries: [], related: [] };
  if (direction === "nl-vi" || direction === "vi-nl") {
    if (!isVietnameseAvailable()) return null;
    return direction === "nl-vi" ? dutchToVietnamese(db, q) : vietnameseToDutch(db, q);
  }
  return direction === "nl" ? dutchToEnglish(db, q) : englishToDutch(db, q);
}
