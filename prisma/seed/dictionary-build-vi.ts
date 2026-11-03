/**
 * Adds Vietnamese to the local dictionary (prisma/dictionary.db) so you can look words up
 * Dutch -> Vietnamese and Vietnamese -> Dutch. The data is the Vietnamese-word list of English
 * Wiktionary (kaikki.org, CC BY-SA 4.0); Vietnamese and Dutch are linked through their shared
 * English meanings, so results are only as exact as those English glosses.
 *
 *   npm run db:build:dictionary:vi                 # downloads the export if it is missing
 *   npm run db:build:dictionary:vi -- path/to.jsonl
 *
 * Needs the Dutch dictionary first (`npm run db:build:dictionary`); re-running this only replaces
 * the vi_* tables. Rebuilding the Dutch dictionary wipes the file, so run this again afterwards.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { DatabaseSync } from "node:sqlite";
import { englishTerms } from "./dictionary-shared";

const SOURCE_URL = "https://kaikki.org/dictionary/Vietnamese/kaikki.org-dictionary-Vietnamese.jsonl";
const SOURCE_PATH = process.argv[2] ?? path.join("prisma", "dictionary-source", "kaikki-vietnamese.jsonl");
const DB_PATH = path.join("prisma", "dictionary.db");

const SKIP_POS = new Set(["character", "symbol", "punct", "romanization", "syllable", "affix", "counter"]);
const MAX_SENSES = 8;

interface Sense {
  glosses?: string[];
  links?: [string, string][];
  tags?: string[];
  form_of?: { word: string }[];
  alt_of?: { word: string }[];
}
interface Entry {
  word: string;
  pos: string;
  sounds?: { ipa?: string; tags?: string[] }[];
  senses?: Sense[];
}

/** Vietnamese without tone marks / vowel marks (đ -> d), so "nha" finds "nhà". Mirror of the one in dictionary-db.ts. */
const viNormalize = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

async function ensureSource() {
  if (fs.existsSync(SOURCE_PATH)) return;
  console.log(`Downloading ${SOURCE_URL} ...`);
  fs.mkdirSync(path.dirname(SOURCE_PATH), { recursive: true });
  const res = await fetch(SOURCE_URL);
  if (!res.ok || !res.body) throw new Error(`Download failed: ${res.status}`);
  fs.writeFileSync(SOURCE_PATH, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  if (!fs.existsSync(DB_PATH)) throw new Error("prisma/dictionary.db is missing. Run `npm run db:build:dictionary` first.");
  await ensureSource();
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = OFF; PRAGMA synchronous = OFF;
    DROP TABLE IF EXISTS vi_entry; DROP TABLE IF EXISTS vi_sense; DROP TABLE IF EXISTS vi_term;
    CREATE TABLE vi_entry (
      id INTEGER PRIMARY KEY, word TEXT NOT NULL, lw TEXT NOT NULL, norm TEXT NOT NULL, pos TEXT NOT NULL,
      ipa TEXT, score INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE vi_sense (entry_id INTEGER NOT NULL, idx INTEGER NOT NULL, gloss TEXT NOT NULL, tags TEXT);
    CREATE TABLE vi_term (term TEXT NOT NULL, entry_id INTEGER NOT NULL, rank INTEGER NOT NULL, sense_idx INTEGER NOT NULL);
  `);
  const insEntry = db.prepare("INSERT INTO vi_entry (word, lw, norm, pos, ipa, score) VALUES (?,?,?,?,?,?)");
  const insSense = db.prepare("INSERT INTO vi_sense (entry_id, idx, gloss, tags) VALUES (?,?,?,?)");
  const insTerm = db.prepare("INSERT INTO vi_term (term, entry_id, rank, sense_idx) VALUES (?,?,?,?)");

  const rl = readline.createInterface({ input: fs.createReadStream(SOURCE_PATH), crlfDelay: Infinity });
  let entries = 0, terms = 0;
  db.exec("BEGIN");
  for await (const line of rl) {
    if (!line) continue;
    const e = JSON.parse(line) as Entry;
    if (!e.word || SKIP_POS.has(e.pos) || /[㐀-鿿]/.test(e.word)) continue;
    // Spelling variants and inflected-form stubs say nothing about meaning: keep real senses only.
    const senses = (e.senses ?? []).filter((s) => s.glosses?.[0] && !s.form_of?.length && !s.alt_of?.length).slice(0, MAX_SENSES);
    if (!senses.length) continue;

    const ipa = (e.sounds?.find((s) => s.ipa && s.tags?.includes("Hà-Nội")) ?? e.sounds?.find((s) => s.ipa))?.ipa ?? null;
    const score = (e.pos === "name" ? -5 : 0) + Math.min(senses.length, 5);
    const id = Number(insEntry.run(e.word, e.word.normalize("NFC").toLowerCase(), viNormalize(e.word), e.pos, ipa, score).lastInsertRowid);
    entries++;

    senses.forEach((s, i) => {
      const tags = (s.tags ?? []).filter((t) => t !== "no-gloss").join(", ") || null;
      insSense.run(id, i, s.glosses!.join("; "), tags);
    });
    const seen = new Map<string, { rank: number; idx: number }>();
    senses.forEach((s, idx) => {
      for (const { term, rank } of englishTerms(s)) {
        const prev = seen.get(term);
        if (!prev || prev.rank + prev.idx > rank + idx) seen.set(term, { rank, idx });
      }
    });
    for (const [term, { rank, idx }] of seen) { insTerm.run(term, id, rank, idx); terms++; }
  }
  db.exec("COMMIT");
  db.exec(`
    CREATE INDEX vi_entry_norm ON vi_entry (norm);
    CREATE INDEX vi_sense_entry ON vi_sense (entry_id, idx);
    CREATE INDEX vi_term_term ON vi_term (term);
    CREATE INDEX vi_term_entry ON vi_term (entry_id);
    VACUUM;
  `);
  db.close();
  const mb = (fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(1);
  console.log(`Done: ${entries} Vietnamese entries, ${terms} English terms -> ${DB_PATH} (${mb} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
