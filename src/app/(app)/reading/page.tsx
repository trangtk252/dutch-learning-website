import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import type { CefrLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { CEFR_LEVELS, READING_GENRE_LABELS, visibleLevels, type Cefr } from "@/lib/constants";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CardLink } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { LevelFilter } from "@/components/level-filter";

export const metadata: Metadata = { title: "Reading" };

export default async function ReadingPage({ searchParams }: PageProps<"/reading">) {
  const { user, profile } = await requireProfile();
  const { level } = await searchParams;
  const recommended = visibleLevels(profile.currentLevel as Cefr).slice(-2);
  const levels: CefrLevel[] =
    level === "all" ? [...CEFR_LEVELS] : CEFR_LEVELS.includes(level as Cefr) ? [level as Cefr] : recommended;

  const readings = await db.readingExercise.findMany({
    where: { published: true, level: { in: levels } },
    orderBy: [{ level: "asc" }, { createdAt: "asc" }],
    include: {
      topic: true,
      attempts: { where: { userId: user.id, completedAt: { not: null } }, orderBy: { completedAt: "desc" }, take: 1, select: { correct: true, total: true } },
      _count: { select: { questions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reading"
        description="Short texts with tap-to-translate. Tap any word to see its meaning and save it."
        actions={<ButtonLink href="/reading/new" variant="secondary" size="sm"><Sparkles aria-hidden className="size-4" /> Generate a text</ButtonLink>}
      />
      <LevelFilter basePath="/reading" current={typeof level === "string" ? level : null} recommended={recommended} />
      {readings.length === 0 ? (
        <EmptyState title="No texts at this level yet">Try another level, or generate a new text.</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {readings.map((r) => {
            const last = r.attempts[0];
            return (
              <li key={r.id}>
                <CardLink href={`/reading/${r.slug}`} className="flex h-full flex-col">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <LevelBadge level={r.level} />
                    <Badge>{READING_GENRE_LABELS[r.genre]}</Badge>
                    {r.isNt2 && <Badge tone="accent">NT2-style</Badge>}
                    {r.source === "AI" && <Badge tone="warning">AI-generated</Badge>}
                  </div>
                  <h2 className="mt-3 font-semibold" lang="nl">{r.title}</h2>
                  <p className="mt-1 flex-1 text-sm text-muted">{r.summaryEn}</p>
                  <p className="mt-3 text-xs text-muted">
                    {r.readingMinutes} min read · {r.wordCount} words · {r._count.questions} questions
                    {last && <span className="ml-1 font-medium text-success">· last score {last.correct}/{last.total}</span>}
                  </p>
                </CardLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
