import type { Metadata } from "next";
import type { CefrLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { CEFR_LEVELS, visibleLevels, type Cefr } from "@/lib/constants";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { CardLink } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { LevelFilter } from "@/components/level-filter";
import { ListeningTabs } from "./tabs";

export const metadata: Metadata = { title: "Listening" };

const KIND_LABEL = { SHORT: "Short", DIALOGUE: "Dialogue", ANNOUNCEMENT: "Announcement", MONOLOGUE: "Monologue", NT2: "NT2" };

export default async function ListeningPage({ searchParams }: PageProps<"/listening">) {
  const { user, profile } = await requireProfile();
  const { level } = await searchParams;
  const recommended = visibleLevels(profile.currentLevel as Cefr).slice(-2);
  const levels: CefrLevel[] = level === "all" ? [...CEFR_LEVELS] : CEFR_LEVELS.includes(level as Cefr) ? [level as Cefr] : recommended;
  const items = await db.listeningExercise.findMany({
    where: { published: true, level: { in: levels } },
    orderBy: [{ level: "asc" }, { createdAt: "asc" }],
    include: {
      attempts: { where: { userId: user.id, completedAt: { not: null } }, orderBy: { completedAt: "desc" }, take: 1, select: { correct: true, total: true } },
      _count: { select: { questions: true } },
    },
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Listening" description="Short exercises with transcripts and questions, plus curated podcasts, series and films." />
      <ListeningTabs active="/listening" />
      <LevelFilter basePath="/listening" current={typeof level === "string" ? level : null} recommended={recommended} />
      {items.length === 0 ? (
        <EmptyState title="No exercises at this level yet" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <li key={l.id}>
              <CardLink href={`/listening/${l.slug}`} className="flex h-full flex-col">
                <div className="flex flex-wrap gap-1.5">
                  <LevelBadge level={l.level} />
                  <Badge>{KIND_LABEL[l.kind]}</Badge>
                  {l.isNt2 && <Badge tone="accent">NT2-style</Badge>}
                </div>
                <h2 className="mt-3 font-semibold" lang="nl">{l.title}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">{l.description}</p>
                <p className="mt-3 text-xs text-muted">
                  ~{Math.max(1, Math.round(l.durationSec / 60))} min · {l._count.questions} questions
                  {l.attempts[0] && <span className="ml-1 font-medium text-success">· last score {l.attempts[0].correct}/{l.attempts[0].total}</span>}
                </p>
              </CardLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
