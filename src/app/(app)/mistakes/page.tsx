import type { Metadata } from "next";
import Link from "next/link";
import type { ErrorCategory, MistakeSource } from "@prisma/client";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { ERROR_CATEGORY_LABELS } from "@/lib/constants";
import { getMistakeSummary, masteryFor, type Mastery } from "@/lib/server/mistakes";
import { addDays, relativeDays } from "@/lib/server/dates";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { AnalyzeButton, ClearMistakes, DeleteMistake } from "./controls";

export const metadata: Metadata = { title: "My mistakes" };

const MASTERY: Record<Mastery, { label: string; tone: "danger" | "warning" | "success" }> = {
  "needs-practice": { label: "Needs practice", tone: "danger" },
  improving: { label: "Improving", tone: "warning" },
  good: { label: "Looking good", tone: "success" },
};
const SOURCES: MistakeSource[] = ["SPEAKING", "WRITING", "QUIZ", "GRAMMAR", "READING", "LISTENING", "VOCABULARY"];

export default async function MistakesPage({ searchParams }: PageProps<"/mistakes">) {
  const { user } = await requireProfile();
  const { source } = await searchParams;
  const sourceFilter = SOURCES.includes(source as MistakeSource) ? (source as MistakeSource) : undefined;

  const [summary, recent, topics, grammarAttempts] = await Promise.all([
    getMistakeSummary(user.id),
    db.userMistake.findMany({
      where: { userId: user.id, ...(sourceFilter ? { source: sourceFilter } : {}) },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    db.grammarTopic.findMany({ where: { published: true }, select: { slug: true, title: true, remedies: true }, orderBy: { order: "asc" } }),
    db.attempt.findMany({
      where: { userId: user.id, kind: "GRAMMAR", completedAt: { gte: addDays(new Date(), -30) } },
      select: { correct: true, total: true, grammarTopic: { select: { remedies: true } } },
    }),
  ]);

  const accuracyFor = (cat: ErrorCategory) => {
    const rel = grammarAttempts.filter((a) => a.grammarTopic?.remedies.includes(cat));
    const total = rel.reduce((n, a) => n + a.total, 0);
    return total ? rel.reduce((n, a) => n + a.correct, 0) / total : null;
  };

  const rows = summary
    .filter((s) => !sourceFilter || recent.some((m) => m.category === s.category))
    .map((s) => ({
      ...s,
      mastery: masteryFor(s.recent, s.total, accuracyFor(s.category)),
      topic: topics.find((t) => t.remedies.includes(s.category)),
      examples: recent.filter((m) => m.category === s.category).slice(0, 5),
      shown: sourceFilter ? recent.filter((m) => m.category === s.category).length : s.total,
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My mistakes"
        description="Every correction from speaking, writing and quizzes, grouped so you can see patterns — and fix them with targeted practice."
        actions={rows.length > 0 ? <AnalyzeButton /> : undefined}
      />

      <nav aria-label="Filter by source" className="flex flex-wrap gap-2 text-sm">
        <Link href="/mistakes" aria-current={!sourceFilter ? "page" : undefined} className={!sourceFilter ? "rounded-full bg-primary px-3 py-1 text-primary-ink" : "rounded-full border border-line px-3 py-1 text-muted"}>All</Link>
        {SOURCES.map((s) => (
          <Link key={s} href={`/mistakes?source=${s}`} aria-current={sourceFilter === s ? "page" : undefined} className={sourceFilter === s ? "rounded-full bg-primary px-3 py-1 text-primary-ink" : "rounded-full border border-line px-3 py-1 text-muted hover:text-ink"}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState title="No mistakes recorded">
          Mistakes appear here automatically when the speaking tutor, writing feedback or a quiz corrects you. Making mistakes is how you learn!
        </EmptyState>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.category}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{ERROR_CATEGORY_LABELS[r.category]}</h2>
                    <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                      <div><dt className="inline">Mistakes: </dt><dd className="inline font-medium text-ink">{r.shown}</dd></div>
                      <div><dt className="inline">Last 14 days: </dt><dd className="inline font-medium text-ink">{r.recent}</dd></div>
                      {r.lastAt && <div><dt className="inline">Last mistake: </dt><dd className="inline font-medium text-ink">{relativeDays(r.lastAt)}</dd></div>}
                    </dl>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={MASTERY[r.mastery].tone}>{MASTERY[r.mastery].label}</Badge>
                    {r.topic && <ButtonLink href={`/grammar/${r.topic.slug}`} size="sm" variant={r.mastery === "needs-practice" ? "primary" : "secondary"}>Practise</ButtonLink>}
                  </div>
                </div>
                {r.examples.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-primary">Show recent examples</summary>
                    <ul className="mt-2 space-y-2 text-sm">
                      {r.examples.map((m) => (
                        <li key={m.id} className="flex items-start justify-between gap-2 rounded-xl bg-surface-2 p-3">
                          <div>
                            <p lang="nl"><span className="line-through decoration-1 opacity-70">{m.original}</span> → <span className="font-medium">{m.corrected}</span></p>
                            {m.explanation && <p className="text-muted">{m.explanation}</p>}
                            <p className="mt-1 text-xs text-muted">{m.source.toLowerCase()} · {relativeDays(m.createdAt)}</p>
                          </div>
                          <DeleteMistake id={m.id} />
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {r.topic && <p className="mt-3 text-xs text-muted">Recommended: <Link href={`/grammar/${r.topic.slug}`} className="text-primary hover:underline">{r.topic.title}</Link> — read the explanation, then do the mini exercise and quiz.</p>}
              </Card>
            </li>
          ))}
        </ul>
      )}
      {rows.length > 0 && <ClearMistakes />}
    </div>
  );
}
