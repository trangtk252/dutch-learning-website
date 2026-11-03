import Link from "next/link";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { normalizeWord } from "@/lib/dutch/text";
import { isDictionaryAvailable, isVietnameseAvailable, searchDictionary, type DictionaryDirection, type DictionaryEntry } from "@/lib/server/dictionary-db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";
import { getLocale, getT, pageTitle } from "@/lib/i18n/server";
import type { TFunction } from "@/lib/i18n/translate";
import { SaveButton } from "./save-button";

export const generateMetadata = pageTitle("Dictionary");

const POS_NAMES: Record<string, string> = {
  noun: "noun", verb: "verb", adj: "adjective", adv: "adverb", prep: "preposition", conj: "conjunction",
  pron: "pronoun", det: "determiner", num: "numeral", intj: "interjection", name: "proper noun", article: "article",
  phrase: "phrase", prep_phrase: "phrase", proverb: "proverb", prefix: "prefix", suffix: "suffix", particle: "particle",
  contraction: "contraction",
};

const pill = (active: boolean) =>
  cn("rounded-full border px-3 py-1 text-sm", active ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface text-muted hover:text-ink");

const headword = (e: Pick<DictionaryEntry, "word" | "gender">) => `${e.gender ? `${e.gender === "HET" ? "het" : "de"} ` : ""}${e.word}`;
const href = (q: string, dir: DictionaryDirection) => `/dictionary?q=${encodeURIComponent(q)}&dir=${dir}`;

const DIRECTIONS: { dir: DictionaryDirection; label: string }[] = [
  { dir: "nl", label: "Dutch → English" },
  { dir: "en", label: "English → Dutch" },
  { dir: "nl-vi", label: "Dutch → Vietnamese" },
  { dir: "vi-nl", label: "Vietnamese → Dutch" },
];
const FIELD: Record<DictionaryDirection, { label: string; lang: string; placeholder: string }> = {
  nl: { label: "Dutch word", lang: "nl", placeholder: "e.g. huis, liep, mooier" },
  en: { label: "English word", lang: "en", placeholder: "e.g. house, to run, beautiful" },
  "nl-vi": { label: "Dutch word", lang: "nl", placeholder: "e.g. huis, liep, mooier" },
  "vi-nl": { label: "Vietnamese word", lang: "vi", placeholder: "e.g. nhà, chạy, đẹp" },
};

function EntryCard({ entry, cardId, dir, t }: { entry: DictionaryEntry; cardId: string | null; dir: DictionaryDirection; t: TFunction }) {
  const first = entry.senses[0];
  const example = entry.senses.find((s) => s.exampleNl);
  // Saving from Dutch -> Vietnamese keeps the Vietnamese words in the meaning, with the English gloss for context.
  const viFirst = first?.vietnamese?.length ? first.vietnamese.join(", ") : null;
  const meaning = dir === "nl-vi" && viFirst && first ? `${viFirst} — ${first.gloss}`.slice(0, 300) : first?.gloss;
  const details = [
    entry.plural && `${t("plural")}: ${entry.plural}`,
    entry.diminutive && `${t("diminutive")}: ${entry.diminutive}`,
    entry.forms,
  ].filter(Boolean);
  return (
    <li className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-xl font-semibold text-ink" lang={dir === "vi-nl" ? "vi" : "nl"}>{headword(entry)}</h2>
        <Badge>{t(POS_NAMES[entry.pos] ?? entry.pos)}</Badge>
        {entry.ipa && <span className="text-sm text-muted">{entry.ipa}</span>}
      </div>
      {details.length > 0 && <p className="mt-1 text-sm text-muted">{details.join(" · ")}</p>}
      {entry.formOf && (
        <p className="mt-2 text-sm">
          {t("Form of")} <Link className="font-medium text-primary-strong hover:underline" href={href(entry.formOf, "nl")}>{entry.formOf}</Link>
        </p>
      )}
      <ol className="mt-3 space-y-2.5">
        {entry.senses.map((s, i) => (
          <li key={i} className="flex gap-2.5 text-sm">
            <span className="w-4 shrink-0 text-right text-muted">{i + 1}.</span>
            <span>
              {s.vietnamese && s.vietnamese.length > 0 && (
                <span className="mb-0.5 block font-medium text-ink" lang="vi">{s.vietnamese.join(", ")}</span>
              )}
              {s.dutch && s.dutch.length > 0 && (
                <span className="mb-0.5 block font-medium text-ink" lang="nl">
                  {s.dutch.map((d, j) => (
                    <span key={d.word}>
                      {j > 0 && ", "}
                      <Link className="text-primary-strong hover:underline" href={href(d.word, "nl-vi")}>{headword(d)}</Link>
                    </span>
                  ))}
                </span>
              )}
              <span className={s.vietnamese || s.dutch ? "text-muted" : "text-ink"}>{s.gloss}</span>
              {s.tags && <span className="ml-2 text-xs text-muted">{s.tags}</span>}
              {s.exampleNl && (
                <span className="mt-0.5 block text-muted">
                  <span lang="nl" className="italic">{s.exampleNl}</span>
                  {s.exampleEn && <> — {s.exampleEn}</>}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
      {!entry.formOf && first && meaning && dir !== "vi-nl" && (
        <div className="mt-4">
          <SaveButton word={entry.word} gender={entry.gender} meaning={meaning} example={example?.exampleNl ?? null} cardId={cardId} />
        </div>
      )}
    </li>
  );
}

export default async function DictionaryPage({ searchParams }: PageProps<"/dictionary">) {
  const { user } = await requireProfile();
  const { q: rawQ, dir: rawDir } = await searchParams;
  const q = typeof rawQ === "string" ? rawQ.trim().slice(0, 80) : "";
  // Vietnamese interface: Dutch <-> Vietnamese only. Any other interface: Dutch <-> English only.
  const vietnameseUi = (await getLocale()) === "vi";
  const directions = DIRECTIONS.filter((d) => (d.dir === "nl-vi" || d.dir === "vi-nl") === vietnameseUi);
  const t = await getT();
  const dir: DictionaryDirection = directions.find((d) => d.dir === rawDir)?.dir ?? directions[0].dir;
  const wantsVietnamese = dir === "nl-vi" || dir === "vi-nl";

  const available = isDictionaryAvailable();
  const viMissing = available && wantsVietnamese && !isVietnameseAvailable();
  const results = available && !viMissing && q ? searchDictionary(q, dir) : null;

  // Which of the shown words are already flashcards for this learner?
  const norms = dir === "vi-nl" ? [] : [...new Set((results?.entries ?? []).map((e) => normalizeWord(e.word)))];
  const cards = norms.length
    ? await db.vocabularyCard.findMany({
        where: { userId: user.id, word: { normalized: { in: norms } } },
        select: { id: true, word: { select: { normalized: true } } },
      })
    : [];
  const cardByWord = new Map(cards.map((c) => [c.word.normalized, c.id]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={t("Dictionary")} description={vietnameseUi ? t("Look up Dutch words (including inflected forms like “liep”), or translate between Dutch and Vietnamese.") : t("Look up Dutch words (including inflected forms like “liep”), or translate between Dutch and English.")} />

      <form role="search" className="space-y-3">
        <input type="hidden" name="dir" value={dir} />
        <div className="flex gap-2">
          <label htmlFor="q" className="sr-only">{t(FIELD[dir].label)}</label>
          <Input
            id="q" name="q" defaultValue={q} autoFocus autoComplete="off" lang={FIELD[dir].lang}
            placeholder={t(FIELD[dir].placeholder)}
          />
          <Button type="submit"><Search aria-hidden className="size-4" /> {t("Search")}</Button>
        </div>
        <nav aria-label={t("Direction")} className="flex flex-wrap gap-2">
          {directions.map((d) => (
            <Link key={d.dir} href={href(q, d.dir)} aria-current={dir === d.dir ? "page" : undefined} className={pill(dir === d.dir)}>{t(d.label)}</Link>
          ))}
        </nav>
      </form>

      {!available && (
        <EmptyState title={t("The dictionary isn't set up yet")}>{t("Run")} <code>npm run db:build:dictionary</code> {t("once, then reload this page.")}</EmptyState>
      )}

      {viMissing && (
        <EmptyState title={t("Vietnamese isn't set up yet")}>{t("Run")} <code>npm run db:build:dictionary:vi</code> {t("once, then reload this page.")}</EmptyState>
      )}

      {available && !viMissing && !q && <p className="text-sm text-muted">{t("Type a word above. Plurals, verb forms and comparatives point you to the base word.")}</p>}

      {results && results.entries.length === 0 && results.related.length === 0 && (
        <EmptyState title={t("No results for “{q}”", { q })}>
          {wantsVietnamese ? t("Check the spelling (Vietnamese is matched with or without tone marks), or try another direction.") : t("Check the spelling, or try another direction.")}{" "}
          {!wantsVietnamese && (
            <Link className="font-medium text-primary-strong hover:underline" href={href(q, dir === "nl" ? "en" : "nl")}>
              {dir === "nl" ? t("Search English → Dutch") : t("Search Dutch → English")}
            </Link>
          )}
        </EmptyState>
      )}

      {results && results.entries.length > 0 && (
        <ul className="space-y-4">
          {results.entries.map((e) => (
            <EntryCard key={e.id} entry={e} cardId={dir === "vi-nl" ? null : (cardByWord.get(normalizeWord(e.word)) ?? null)} dir={dir} t={t} />
          ))}
        </ul>
      )}

      {results && results.related.length > 0 && (
        <section aria-labelledby="related-title">
          <h2 id="related-title" className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            {results.entries.length > 0 ? t("Related words") : t("Did you mean")}
          </h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {results.related.map((r, i) => (
              <li key={`${r.word}-${r.pos}-${i}`}>
                <Link href={href(r.word, dir === "en" ? "nl" : dir)} className="flex items-baseline gap-3 px-4 py-2.5 text-sm hover:bg-surface-2">
                  <span className="font-medium text-ink">{headword(r)}</span>
                  <span className="text-xs text-muted">{t(POS_NAMES[r.pos] ?? r.pos)}</span>
                  <span className="truncate text-muted">{r.gloss}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-muted">
        {t("Dictionary data from")} <a className="underline" href="https://en.wiktionary.org" target="_blank" rel="noreferrer">Wiktionary</a>{" "}
        ({t("extracted by")} <a className="underline" href="https://kaikki.org" target="_blank" rel="noreferrer">kaikki.org</a>),
        {t("licensed")} <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>.
        {wantsVietnamese && ` ${t("Vietnamese is linked to Dutch through their shared English meanings, so check the English gloss shown with each result.")}`}
      </p>
    </div>
  );
}
