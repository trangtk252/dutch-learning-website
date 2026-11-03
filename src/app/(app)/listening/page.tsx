import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { LISTENING_SECTIONS, NT2_TRACK_INFO, defaultTrack, isNt2Track, membersOf, sectionFor } from "@/lib/nt2";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { CardLink } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { Nt2Filter } from "@/components/nt2-filter";
import { ListeningTabs } from "./tabs";
import { getT, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Listening");

export default async function ListeningPage({ searchParams }: PageProps<"/listening">) {
  const { user, profile } = await requireProfile();
  const t = await getT();
  const { track: trackParam, section } = await searchParams;
  const track = trackParam === "all" ? "all" : isNt2Track(trackParam) ? trackParam : defaultTrack(profile);
  const sectionKey = typeof section === "string" ? section : undefined;
  const kinds = membersOf(LISTENING_SECTIONS, sectionKey);
  const items = await db.listeningExercise.findMany({
    where: {
      published: true,
      ownerId: null,
      ...(track === "all" ? {} : { level: { in: NT2_TRACK_INFO[track].levels } }),
      ...(kinds ? { kind: { in: kinds } } : {}),
    },
    orderBy: [{ isNt2: "desc" }, { level: "asc" }, { createdAt: "asc" }],
    include: {
      attempts: { where: { userId: user.id, completedAt: { not: null } }, orderBy: { completedAt: "desc" }, take: 1, select: { correct: true, total: true } },
      _count: { select: { questions: true } },
    },
  });
  return (
    <div className="space-y-6">
      <PageHeader title={t("Luisteren")} description={t("Listening practice organised like the NT2 Staatsexamen: by programme and fragment type, plus curated podcasts, series and films.")} />
      <ListeningTabs active="/listening" />
      <Nt2Filter basePath="/listening" track={track} section={sectionKey} sections={LISTENING_SECTIONS} skillLabel="Listening" />
      {items.length === 0 ? (
        <EmptyState title={t("No exercises in this section yet")}>{t("Try another programme or section.")}</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <li key={l.id}>
              <CardLink href={`/listening/${l.slug}`} className="flex h-full flex-col">
                <div className="flex flex-wrap gap-1.5">
                  <LevelBadge level={l.level} />
                  <Badge>{t(sectionFor(LISTENING_SECTIONS, l.kind)?.label ?? "")}</Badge>
                </div>
                <h2 className="mt-3 font-semibold" lang="nl">{l.title}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">{l.description}</p>
                <p className="mt-3 text-xs text-muted">
                  {t("~{min} min · {n} questions", { min: Math.max(1, Math.round(l.durationSec / 60)), n: l._count.questions })}
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
