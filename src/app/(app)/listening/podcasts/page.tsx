import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { CEFR_LEVELS, levelIndex, type Cefr } from "@/lib/constants";
import { ListeningTabs } from "../tabs";

export const metadata: Metadata = { title: "Podcasts" };

export default async function PodcastsPage() {
  const { profile } = await requireProfile();
  const podcasts = await db.podcast.findMany({ include: { episodes: true } });
  const me = levelIndex(profile.currentLevel as Cefr);
  // Recommended: the learner's level falls in range or is one below the minimum.
  const sorted = podcasts.sort((a, b) => Math.abs(levelIndex(a.levelMin as Cefr) - me) - Math.abs(levelIndex(b.levelMin as Cefr) - me));
  return (
    <div className="space-y-6">
      <PageHeader title="Listening" description="Curated Dutch podcasts and audio from legitimate sources. We link out — nothing is downloaded or re-hosted." />
      <ListeningTabs active="/listening/podcasts" />
      <ul className="grid gap-4 md:grid-cols-2">
        {sorted.map((p) => {
          const fit = me >= levelIndex(p.levelMin as Cefr) - 1 && me <= levelIndex(p.levelMax as Cefr);
          return (
            <li key={p.id}>
              <Card className="flex h-full flex-col">
                <div className="flex flex-wrap items-center gap-1.5">
                  <LevelBadge level={p.levelMin} />–<LevelBadge level={p.levelMax} />
                  {fit && <Badge tone="success">Good fit for you</Badge>}
                  {p.hasTranscripts && <Badge>Subtitles/transcripts</Badge>}
                </div>
                <h2 className="mt-3 font-semibold">{p.title}</h2>
                {p.publisher && <p className="text-xs text-muted">{p.publisher}</p>}
                <p className="mt-2 text-sm">{p.description}</p>
                {p.learningTips && <p className="mt-2 rounded-xl bg-surface-2 p-3 text-sm text-muted"><strong className="text-ink">How to use it: </strong>{p.learningTips}</p>}
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Open {p.title} <ExternalLink aria-hidden className="size-3.5" /><span className="sr-only">(opens in a new tab)</span>
                </a>
              </Card>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted">Level ranges are estimates ({CEFR_LEVELS.join(", ")}). Links were checked when added; availability can change.</p>
    </div>
  );
}
