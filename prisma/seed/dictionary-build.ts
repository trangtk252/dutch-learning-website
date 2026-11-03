/**
 * Builds the local Dutch<->English dictionary (prisma/dictionary.db) from the Wiktionary
 * export published by kaikki.org (Wiktextract, CC BY-SA 4.0).
 *
 *   npm run db:build:dictionary                 # downloads the export if it is missing
 *   npm run db:build:dictionary -- path/to.jsonl
 *
 * The dictionary lives in its own SQLite file, separate from the learner data (dev.db).
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { DatabaseSync } from "node:sqlite";
import { englishTerms, normalize } from "./dictionary-shared";

const SOURCE_URL = "https://kaikki.org/dictionary/Dutch/kaikki.org-dictionary-Dutch.jsonl";
const SOURCE_PATH = process.argv[2] ?? path.join("prisma", "dictionary-source", "kaikki-dutch.jsonl");
const DB_PATH = path.join("prisma", "dictionary.db");

const SKIP_POS = new Set(["character", "symbol", "punct"]);
const MAX_SENSES = 12;
const NOISE_TAGS = new Set(["form-of", "alt-of", "no-gloss"]);

interface Sense {
  glosses?: string[];
  tags?: string[];
  links?: [string, string][];
  form_of?: { word: string }[];
  alt_of?: { word: string }[];
  examples?: { text?: string; translation?: string; english?: string }[];
}
interface Entry {
  word: string;
  pos: string;
  head_templates?: { expansion?: string }[];
  forms?: { form: string; tags?: string[] }[];
  sounds?: { ipa?: string }[];
  senses?: Sense[];
}

async function ensureSource() {
  if (fs.existsSync(SOURCE_PATH)) return;
  console.log(`Downloading ${SOURCE_URL} ...`);
  fs.mkdirSync(path.dirname(SOURCE_PATH), { recursive: true });
  const res = await fetch(SOURCE_URL);
  if (!res.ok || !res.body) throw new Error(`Download failed: ${res.status}`);
  fs.writeFileSync(SOURCE_PATH, Buffer.from(await res.arrayBuffer()));
}

const hasTags = (f: { tags?: string[] }, ...tags: string[]) => tags.every((t) => f.tags?.includes(t));

function nounInfo(e: Entry) {
  const head = e.head_templates?.[0]?.expansion ?? "";
  const m = head.match(/^\S+ ([mfnc])(?: or [mfnc])*(?: |$)/u);
  const gender = m ? (m[1] === "n" ? "HET" : "DE") : null;
  const plural = e.forms?.find((f) => hasTags(f, "plural") && !hasTags(f, "diminutive"))?.form ?? null;
  const diminutive = e.forms?.find((f) => hasTags(f, "diminutive"))?.form ?? null;
  return { gender, plural, diminutive };
}

/** Short "principal parts" line: verbs "liep · liepen · gelopen", adjectives "groter · grootst". */
function formsLine(e: Entry): string | null {
  const forms = e.forms ?? [];
  const first = (...tags: string[]) => forms.find((f) => hasTags(f, ...tags) && /^[\p{L}'-]+$/u.test(f.form))?.form;
  if (e.pos === "verb") {
    const parts = [first("past", "singular", "first-person"), first("past", "plural"), first("participle", "past")];
    return parts.every(Boolean) ? parts.join(" · ") : null;
  }
  if (e.pos === "adj") {
    const parts = [first("comparative"), first("superlative")].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  }
  return null;
}

async function main() {
  await ensureSource();
  fs.rmSync(DB_PATH, { force: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = OFF; PRAGMA synchronous = OFF;
    CREATE TABLE entry (
      id INTEGER PRIMARY KEY, word TEXT NOT NULL, norm TEXT NOT NULL, pos TEXT NOT NULL,
      gender TEXT, plural TEXT, diminutive TEXT, forms TEXT, ipa TEXT,
      form_of TEXT, score INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE sense (
      entry_id INTEGER NOT NULL, idx INTEGER NOT NULL, gloss TEXT NOT NULL, tags TEXT,
      example_nl TEXT, example_en TEXT
    );
    CREATE TABLE eng_term (term TEXT NOT NULL, entry_id INTEGER NOT NULL, rank INTEGER NOT NULL, sense_idx INTEGER NOT NULL);
  `);

  const insEntry = db.prepare(
    "INSERT INTO entry (word, norm, pos, gender, plural, diminutive, forms, ipa, form_of, score) VALUES (?,?,?,?,?,?,?,?,?,?)",
  );
  const insSense = db.prepare("INSERT INTO sense (entry_id, idx, gloss, tags, example_nl, example_en) VALUES (?,?,?,?,?,?)");
  const insTerm = db.prepare("INSERT INTO eng_term (term, entry_id, rank, sense_idx) VALUES (?,?,?,?)");

  const rl = readline.createInterface({ input: fs.createReadStream(SOURCE_PATH), crlfDelay: Infinity });
  let entries = 0, terms = 0;
  db.exec("BEGIN");
  for await (const line of rl) {
    if (!line) continue;
    const e = JSON.parse(line) as Entry;
    if (!e.word || SKIP_POS.has(e.pos)) continue;
    const senses = (e.senses ?? []).filter((s) => s.glosses?.[0]);
    if (!senses.length) continue;

    const allForms = senses.every((s) => s.form_of?.length || s.alt_of?.length);
    const formOf = allForms ? (senses[0].form_of?.[0] ?? senses[0].alt_of?.[0])?.word ?? null : null;
    const realSenses = senses.filter((s) => !s.form_of?.length && !s.alt_of?.length);
    const used = (allForms ? senses : realSenses).slice(0, MAX_SENSES);

    const noun = e.pos === "noun" ? nounInfo(e) : { gender: null, plural: null, diminutive: null };
    const hasExample = used.some((s) => s.examples?.some((x) => x.text));
    const score = (allForms ? -3 : 0) + (e.pos === "name" ? -5 : 0) + Math.min(realSenses.length, 5) + (hasExample ? 2 : 0);

    const id = Number(
      insEntry.run(
        e.word, normalize(e.word), e.pos, noun.gender, noun.plural, noun.diminutive,
        formsLine(e), e.sounds?.find((s) => s.ipa)?.ipa ?? null, formOf, score,
      ).lastInsertRowid,
    );
    entries++;

    used.forEach((s, i) => {
      const ex = s.examples?.find((x) => x.text);
      const tags = (s.tags ?? []).filter((t) => !NOISE_TAGS.has(t)).join(", ") || null;
      insSense.run(id, i, s.glosses![0], tags, ex?.text ?? null, ex?.translation ?? ex?.english ?? null);
    });

    if (!allForms) {
      // Keep the best (lowest rank + sense position) match per term.
      const seen = new Map<string, { rank: number; idx: number }>();
      realSenses.forEach((s, idx) => {
        for (const { term, rank } of englishTerms(s)) {
          const prev = seen.get(term);
          if (!prev || prev.rank + prev.idx > rank + idx) seen.set(term, { rank, idx });
        }
      });
      for (const [term, { rank, idx }] of seen) { insTerm.run(term, id, rank, idx); terms++; }
    }
    if (entries % 20000 === 0) console.log(`  ${entries} entries ...`);
  }
  db.exec("COMMIT");
  db.exec(`
    CREATE INDEX entry_norm ON entry (norm);
    CREATE INDEX entry_word ON entry (word);
    CREATE INDEX entry_form_of ON entry (form_of);
    CREATE INDEX sense_entry ON sense (entry_id, idx);
    CREATE INDEX eng_term_term ON eng_term (term);
    CREATE INDEX eng_term_entry ON eng_term (entry_id);
    VACUUM;
  `);
  db.close();
  const mb = (fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(1);
  console.log(`Done: ${entries} entries, ${terms} English terms -> ${DB_PATH} (${mb} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
