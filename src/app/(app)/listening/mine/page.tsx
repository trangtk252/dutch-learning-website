import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { CardLink } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { ListeningTabs } from "../tabs";
import { AddMediaForm } from "./form";
import { getT, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("My listening library");

const TYPE_LABEL = { PODCAST: "Podcast", VIDEO: "Video", FILM_TV: "Film / TV" };

export default async function MyLibraryPage() {
  const { user } = await requireProfile();
  const t = await getT();
  const items = await db.listeningExercise.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      attempts: { where: { userId: user.id, completedAt: { not: null } }, orderBy: { completedAt: "desc" }, take: 1, select: { correct: true, total: true } },
      _count: { select: { questions: true } },
    },
  });
  return (
    <div className="space-y-6">
      <PageHeader title={t("Luisteren")} description={t("Add a podcast, video, film or TV show by link. You get a transcript, a summary and a short listening quiz.")} />
      <ListeningTabs active="/listening/mine" />
      <AddMediaForm />
      {items.length === 0 ? (
        <EmptyState title={t("Nothing here yet")}>{t("Paste a link above to add your first podcast, video or show.")}</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <li key={l.id}>
              <CardLink href={`/listening/${l.slug}`} className="flex h-full flex-col">
                <div className="flex flex-wrap gap-1.5">
                  {!l.needsTranscript && <LevelBadge level={l.level} />}
                  <Badge>{t(l.mediaType ? TYPE_LABEL[l.mediaType] : "Media")}</Badge>
                  {l.needsTranscript && <Badge tone="warning">{t("Needs transcript")}</Badge>}
                </div>
                <h2 className="mt-3 font-semibold" lang="nl">{l.title}</h2>
                {l.summary && <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted">{l.summary}</p>}
                <p className="mt-3 text-xs text-muted">
                  {l.durationSec > 0 && <>{t("~{min} min", { min: Math.max(1, Math.round(l.durationSec / 60)) })} · </>}{t("{n} questions", { n: l._count.questions })}
                  {l.attempts[0] && <span className="ml-1 font-medium text-success">· {t("last score {correct}/{total}", { correct: l.attempts[0].correct, total: l.attempts[0].total })}</span>}
                </p>
              </CardLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
