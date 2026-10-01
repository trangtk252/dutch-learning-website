import type { Metadata } from "next";
import Link from "next/link";
import { Download, Upload } from "lucide-react";
import { db } from "@/lib/db";
import { isAiMock } from "@/lib/ai";
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

export const metadata: Metadata = { title: "Vocabulary" };

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
  const now = new Date();
  const hasFilters = Boolean(filters.q || filters.level || filters.topic || filters.pos || filters.status || filters.added);
  const pageHref = (p: number) => {
    const sp = new URLSearchParams(Object.entries({ ...filters, page: String(p) }).filter(([, v]) => v != null && v !== "") as [string, string][]);
    return `/vocabulary?${sp}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vocabulary"
        description="Your personal Dutch word bank with spaced-repetition review."
        actions={
          <>
            <ButtonLink href="/vocabulary/import" variant="secondary" size="sm"><Upload aria-hidden className="size-4" /> Import</ButtonLink>
            <a href="/api/vocabulary/export" className={buttonClass("secondary", "sm")}><Download aria-hidden className="size-4" /> Export CSV</a>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <QuickAdd aiMock={isAiMock()} />
        <div className="rounded-2xl border border-line bg-surface p-4">
          <dl className="grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
            {[
              ["Total", counts.total, ""], ["Due", counts.due, "due"], ["New", counts.new, "new"],
              ["Learning", counts.learning, "learning"], ["Mature", counts.mature, "mature"], ["Difficult", counts.difficult, "difficult"],
            ].map(([label, n, status]) => (
              <Link key={label} href={status ? `/vocabulary?status=${status}` : "/vocabulary"} className="rounded-xl p-2 hover:bg-surface-2">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-xl font-semibold tabular-nums">{n}</dd>
              </Link>
            ))}
          </dl>
          <ButtonLink href="/vocabulary/review" className="mt-3 w-full" variant={counts.due + counts.new ? "primary" : "secondary"}>
            {counts.due ? `Review ${counts.due} due card${counts.due === 1 ? "" : "s"}` : counts.new ? "Learn new cards" : "Nothing due right now"}
          </ButtonLink>
        </div>
      </div>

      <form method="get" className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Filter vocabulary">
        <div className="sm:col-span-2">
          <Label htmlFor="f-q">Search</Label>
          <Input id="f-q" name="q" defaultValue={filters.q} placeholder="Dutch, English or note" />
        </div>
        <div>
          <Label htmlFor="f-status">Show</Label>
          <Select id="f-status" name="status" defaultValue={filters.status ?? ""}>
            {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-level">CEFR</Label>
          <Select id="f-level" name="level" defaultValue={filters.level ?? ""}>
            <option value="">Any</option>
            {CEFR_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-topic">Topic</Label>
          <Select id="f-topic" name="topic" defaultValue={filters.topic ?? ""}>
            <option value="">Any</option>
            {topics.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-pos">Word type</Label>
          <Select id="f-pos" name="pos" defaultValue={filters.pos ?? ""}>
            <option value="">Any</option>
            {PARTS_OF_SPEECH.map((p) => <option key={p} value={p}>{POS_LABELS[p]}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-added">Added</Label>
          <Select id="f-added" name="added" defaultValue={filters.added ?? ""}>
            <option value="">Any time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="f-sort">Sort by</Label>
          <Select id="f-sort" name="sort" defaultValue={filters.sort}>
            {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </div>
        <div className="flex items-end justify-end gap-2 sm:col-span-2 lg:col-span-4">
          {hasFilters && <Link href="/vocabulary" className={buttonClass("ghost", "md")}>Clear</Link>}
          <button type="submit" className={buttonClass("secondary", "md")}>Apply</button>
        </div>
      </form>

      <section aria-labelledby="words-heading">
        <h2 id="words-heading" className="sr-only">Words</h2>
        <p className="mb-2 text-sm text-muted" aria-live="polite">{total} word{total === 1 ? "" : "s"}</p>
        {rows.length === 0 ? (
          <EmptyState title={hasFilters ? "No words match these filters" : "Your vocabulary is empty"}>
            {hasFilters ? "Try clearing some filters." : "Add a word above, or tap words while reading and listening to save them."}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/vocabulary/${r.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/60">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">
                      {displayLemma(r.word)}
                      <span className="ml-2 text-xs font-normal text-muted">{POS_LABELS[r.word.partOfSpeech]}</span>
                    </p>
                    <p className="truncate text-sm text-muted">{r.word.english}</p>
                  </div>
                  <div className="hidden shrink-0 flex-wrap justify-end gap-1 sm:flex">
                    {r.word.topics.slice(0, 2).map((t) => (
                      <span key={t.topic.slug} className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">{t.topic.name}</span>
                    ))}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="flex items-center gap-1">
                      <LevelBadge level={r.word.cefrLevel} />
                      <CardStateBadge state={r.state} scheduledDays={r.scheduledDays} suspended={r.suspended} />
                    </span>
                    {r.state !== "NEW" && (
                      <span className="text-xs text-muted">{r.due <= now ? "due now" : `in ${formatInterval(now, r.due)}`}</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
            {filters.page > 1 ? <Link href={pageHref(filters.page - 1)} className="text-primary hover:underline">← Previous</Link> : <span />}
            <span className="text-muted">Page {filters.page} of {pages}</span>
            {filters.page < pages ? <Link href={pageHref(filters.page + 1)} className="text-primary hover:underline">Next →</Link> : <span />}
          </nav>
        )}
      </section>
    </div>
  );
}
