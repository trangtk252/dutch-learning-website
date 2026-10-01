import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { levelIndex, type Cefr } from "@/lib/constants";
import { ListeningTabs } from "../tabs";

export const metadata: Metadata = { title: "Dutch through film & TV" };

const KIND = { FILM: "Film", SERIES: "Series", YOUTUBE: "YouTube", NEWS: "News", KIDS: "Children's TV", DOCUMENTARY: "Documentary" };

export default async function WatchPage() {
  const { profile } = await requireProfile();
  const me = levelIndex(profile.currentLevel as Cefr);
  const media = await db.mediaRecommendation.findMany({ include: { providers: true }, orderBy: [{ levelMin: "asc" }, { vocabDifficulty: "asc" }] });
  return (
    <div className="space-y-6">
      <PageHeader title="Dutch through film & TV" description="Series, films and programmes to build listening stamina. We only link to legitimate providers." />
      <ListeningTabs active="/listening/watch" />
      <ul className="grid gap-4 md:grid-cols-2">
        {media.map((m) => {
          const tooHard = levelIndex(m.levelMin as Cefr) > me + 1;
          return (
            <li key={m.id}>
              <Card className="flex h-full flex-col">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge>{KIND[m.kind]}</Badge>
                  <LevelBadge level={m.levelMin} />–<LevelBadge level={m.levelMax} />
                  {tooHard && <Badge tone="warning">Challenging for now</Badge>}
                </div>
                <h2 className="mt-3 font-semibold">{m.title}</h2>
                <p className="text-xs text-muted">{m.genre}</p>
                <p className="mt-2 text-sm">{m.description}</p>
                <dl className="mt-3 grid grid-cols-2 gap-1 text-xs">
                  <dt className="text-muted">Vocabulary difficulty</dt>
                  <dd><span aria-hidden>{"●".repeat(m.vocabDifficulty)}{"○".repeat(5 - m.vocabDifficulty)}</span><span className="sr-only">{m.vocabDifficulty} out of 5</span></dd>
                  <dt className="text-muted">Subtitles</dt>
                  <dd>{[m.dutchSubtitles && "Dutch", m.englishSubtitles && "English"].filter(Boolean).join(", ") || "Varies"}</dd>
                </dl>
                <p className="mt-3 rounded-xl bg-surface-2 p-3 text-sm text-muted"><strong className="text-ink">Learning tip: </strong>{m.learningTips}</p>
                <ul className="mt-4 space-y-1">
                  {m.providers.map((p) => (
                    <li key={p.id}>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        {p.name} <ExternalLink aria-hidden className="size-3.5" /><span className="sr-only">(opens in a new tab)</span>
                      </a>
                      {p.access && <span className="ml-2 text-xs text-muted">{p.access}</span>}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted">Streaming availability differs per country and changes over time — JustWatch shows where a title is currently available legally.</p>
    </div>
  );
}
