import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { CEFR_LEVELS, PARTS_OF_SPEECH, POS_LABELS } from "@/lib/constants";
import { displayLemma } from "@/lib/server/vocabulary";
import { getCardCounts } from "@/lib/server/stats";
import { queryVocabulary, VocabFilterSchema } from "@/lib/server/vocab-query";
import { formatInterval } from "@/lib/srs/fsrs";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { LevelBadge } from "@/components/ui/badge";
import { Select, Input, Label } from "@/components/ui/form";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { QuickAdd } from "./quick-add";
import { CardStateBadge } from "./card-state";
import { StarterDecks } from "./starter-decks";
import { getT, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Vocabulary");

const STATUS_OPTIONS = [
  ["", "All cards"], ["due", "Due today"], ["new", "New"], ["learning", "Learning"], ["mature", "Mature"],
  ["difficult", "Difficult words"], ["failed", "Recently failed"], ["suspended", "Suspended"],
] as const;
const SORT_OPTIONS = [
  ["recent", "Date added"], ["alpha", "Alphabetical"], ["topic", "Topic"], ["importance", "Importance"],
  ["due", "Due date"], ["difficulty", "Difficulty"],
] as const;

export default async function VocabularyPage({ searchParams }: PageProps<"/vocabulary">) {
  const { user, profile } = await requireProfile();
  const t = await getT();
  const raw = await searchParams;
  const filters = VocabFilterSchema.parse(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
  const [counts, { rows, total, pages }, topics] = await Promise.all([
    getCardCounts(user.id, profile.timezone),
    queryVocabulary(user.id, filters, profile.timezone),
    db.topic.findMany({
      where: { words: { some: { word: { cards: { some: { userId: user.id } } } } } },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);
  const starterSlugs = ["nt2-a2", "nt2-b1"];
  const starterTopics = await db.topic.findMany({
    where: { slug: { in: starterSlugs } },
    select: {
      slug: true,
      name: true,
      _count: { select: { words: true } },
    },
  });
  const decks = await Promise.all(
    starterTopics.map(async (tp) => ({
      slug: tp.slug,
      name: tp.name,
      total: tp._count.words,
      owned: await db.vocabularyCard.count({ where: { userId: user.id, word: { topics: { some: { topic: { slug: tp.slug } } } } } }),
    })),
  );
  const now = new Date();
  const hasFilters = Boolean(filters.q || filters.level || filters.topic || filters.pos || filters.status || filters.added);
  const pageHref = (p: number) => {
    const sp = new URLSearchParams(Object.entries({ ...filters, page: String(p) }).filter(([, v]) => v != null && v !== "") as [string, string][]);
    return `/vocabulary?${sp}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Vocabulary")}
        description={t("Your personal Dutch word bank with spaced-repetition review.")}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <QuickAdd />
        <div className="rounded-2xl border border-line bg-surface p-4">
          <dl className="grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
            {[
              [t("Total"), counts.total, ""], [t("Due"), counts.due, "due"], [t("New"), counts.new, "new"],
              [t("Learning"), counts.learning, "learning"], [t("Mature"), counts.mature, "mature"], [t("Difficult"), counts.difficult, "difficult"],
            ].map(([label, n, status]) => (
              <Link key={label} href={status ? `/vocabulary?status=${status}` : "/vocabulary"} className="rounded-xl p-2 hover:bg-surface-2">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-xl font-semibold tabular-nums">{n}</dd>
              </Link>
            ))}
          </dl>
          <ButtonLink href="/vocabulary/review" className="mt-3 w-full" variant={counts.due + counts.new ? "primary" : "secondary"}>
            {counts.due ? t(counts.due === 1 ? "Review {n} due card" : "Review {n} due cards", { n: counts.due }) : counts.new ? t("Learn new cards") : t("Nothing due right now")}
          </ButtonLink>
        </div>
      </div>

      {decks.length > 0 && <StarterDecks decks={decks.sort((a, b) => a.slug.localeCompare(b.slug))} />}

      <form method="get" className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={t("Filter vocabulary")}>
        <div className="sm:col-span-2">
          <Label htmlFor="f-q">{t("Search")}</Label>
          <Input id="f-q" name="q" defaultValue={filters.q} placeholder={t("Dutch, English or note")} />
        </div>
        <div>
          <Label htmlFor="f-status">{t("Show")}</Label>
          <Select id="f-status" name="status" defaultValue={filters.status ?? ""}>
            {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{t(l)}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-level">CEFR</Label>
          <Select id="f-level" name="level" defaultValue={filters.level ?? ""}>
            <option value="">{t("Any")}</option>
            {CEFR_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-topic">{t("Topic")}</Label>
          <Select id="f-topic" name="topic" defaultValue={filters.topic ?? ""}>
            <option value="">{t("Any")}</option>
            {topics.map((tp) => <option key={tp.slug} value={tp.slug}>{tp.name}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-pos">{t("Word type")}</Label>
          <Select id="f-pos" name="pos" defaultValue={filters.pos ?? ""}>
            <option value="">{t("Any")}</option>
            {PARTS_OF_SPEECH.map((p) => <option key={p} value={p}>{t(POS_LABELS[p])}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-added">{t("Added")}</Label>
          <Select id="f-added" name="added" defaultValue={filters.added ?? ""}>
            <option value="">{t("Any time")}</option>
            <option value="7">{t("Last 7 days")}</option>
            <option value="30">{t("Last 30 days")}</option>
            <option value="90">{t("Last 90 days")}</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="f-sort">{t("Sort by")}</Label>
          <Select id="f-sort" name="sort" defaultValue={filters.sort}>
            {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{t(l)}</option>)}
          </Select>
        </div>
        <div className="flex items-end justify-end gap-2 sm:col-span-2 lg:col-span-4">
          {hasFilters && <Link href="/vocabulary" className={buttonClass("ghost", "md")}>{t("Clear")}</Link>}
          <button type="submit" className={buttonClass("secondary", "md")}>{t("Apply")}</button>
        </div>
      </form>

      <section aria-labelledby="words-heading">
        <h2 id="words-heading" className="sr-only">{t("Words")}</h2>
        <p className="mb-2 text-sm text-muted" aria-live="polite">{t(total === 1 ? "{n} word" : "{n} words", { n: total })}</p>
        {rows.length === 0 ? (
          <EmptyState title={hasFilters ? t("No words match these filters") : t("Your vocabulary is empty")}>
            {hasFilters ? t("Try clearing some filters.") : t("Add a word above, or tap words while reading and listening to save them.")}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/vocabulary/${r.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/60">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">
                      {displayLemma(r.word)}
                      <span className="ml-2 text-xs font-normal text-muted">{t(POS_LABELS[r.word.partOfSpeech])}</span>
                    </p>
                    <p className="truncate text-sm text-muted">{r.word.english}</p>
                  </div>
                  <div className="hidden shrink-0 flex-wrap justify-end gap-1 sm:flex">
                    {r.word.topics.slice(0, 2).map((tp) => (
                      <span key={tp.topic.slug} className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">{tp.topic.name}</span>
                    ))}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="flex items-center gap-1">
                      <LevelBadge level={r.word.cefrLevel} />
                      <CardStateBadge state={r.state} scheduledDays={r.scheduledDays} suspended={r.suspended} />
                    </span>
                    {r.state !== "NEW" && (
                      <span className="text-xs text-muted">{r.due <= now ? t("due now") : t("in {when}", { when: formatInterval(now, r.due) })}</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {pages > 1 && (
          <nav aria-label={t("Pagination")} className="mt-4 flex items-center justify-between text-sm">
            {filters.page > 1 ? <Link href={pageHref(filters.page - 1)} className="text-primary-strong hover:underline">{t("← Previous")}</Link> : <span />}
            <span className="text-muted">{t("Page {page} of {pages}", { page: filters.page, pages })}</span>
            {filters.page < pages ? <Link href={pageHref(filters.page + 1)} className="text-primary-strong hover:underline">{t("Next →")}</Link> : <span />}
          </nav>
        )}
      </section>
    </div>
  );
}
