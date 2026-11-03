import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { NT2_TRACKS, NT2_TRACK_INFO, defaultTrack, isNt2Track } from "@/lib/nt2";
import { buttonClass } from "@/components/ui/button";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { CardLink } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";
import { getT, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Grammar");

const pill = (active: boolean) =>
  cn("rounded-full border px-3 py-1 text-sm", active ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface text-muted hover:text-ink");

export default async function GrammarPage({ searchParams }: PageProps<"/grammar">) {
  const { user, profile } = await requireProfile();
  const t = await getT();
  const { track: trackParam } = await searchParams;
  const track = trackParam === "all" ? "all" : isNt2Track(trackParam) ? trackParam : defaultTrack(profile);

  const topics = await db.grammarTopic.findMany({
    where: { published: true, OR: [{ ownerId: null }, { ownerId: user.id }], ...(track === "all" ? {} : { level: { in: NT2_TRACK_INFO[track].levels } }) },
    orderBy: [{ level: "asc" }, { order: "asc" }],
    include: {
      notes: { where: { userId: user.id }, select: { userId: true } },
      attempts: { where: { userId: user.id, completedAt: { not: null } }, orderBy: { completedAt: "desc" }, take: 1, select: { correct: true, total: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Grammar")}
        description={t("Grammar topics by NT2 programme. Each one has an explanation, examples, a short quiz and a place for your own notes.")}
        actions={<Link href="/grammar/new" className={buttonClass("primary", "sm")}>{t("+ Add my own grammar")}</Link>}
      />
      <div className="space-y-3">
        <nav aria-label={t("NT2 programme")} className="flex flex-wrap gap-2">
          {NT2_TRACKS.map((tr) => (
            <Link key={tr} href={`/grammar?track=${tr}`} aria-current={track === tr ? "page" : undefined} className={pill(track === tr)}>
              {t(NT2_TRACK_INFO[tr].label)}
            </Link>
          ))}
          <Link href="/grammar?track=all" aria-current={track === "all" ? "page" : undefined} className={pill(track === "all")}>{t("All levels")}</Link>
        </nav>
        {track !== "all" && <p className="text-sm text-muted">{t(NT2_TRACK_INFO[track].blurb)}</p>}
      </div>
      {topics.length === 0 ? (
        <EmptyState title={t("No grammar topics in this programme yet")}>{t("Try another programme.")}</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((tp) => {
            const last = tp.attempts[0];
            return (
              <li key={tp.id}>
                <CardLink href={`/grammar/${tp.slug}`} className="flex h-full flex-col">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <LevelBadge level={tp.level} />
                    {tp.ownerId && <Badge tone="primary">{t("Mine")}</Badge>}
                    {tp.notes.length > 0 && <Badge tone="accent">{t("Has notes")}</Badge>}
                  </div>
                  <h2 className="mt-3 font-semibold">{tp.title}</h2>
                  <p className="mt-1 flex-1 text-sm text-muted">{tp.summary}</p>
                  {last && <p className="mt-3 text-xs font-medium text-success">{t("Last quiz score {correct}/{total}", { correct: last.correct, total: last.total })}</p>}
                </CardLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
