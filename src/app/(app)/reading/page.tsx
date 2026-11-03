import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { READING_GENRE_LABELS } from "@/lib/constants";
import { NT2_TRACK_INFO, READING_SECTIONS, defaultTrack, isNt2Track, membersOf, sectionFor } from "@/lib/nt2";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CardLink } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { Nt2Filter } from "@/components/nt2-filter";
import { getT, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Reading");

export default async function ReadingPage({ searchParams }: PageProps<"/reading">) {
  const { user, profile } = await requireProfile();
  const t = await getT();
  const { track: trackParam, section } = await searchParams;
  const track = trackParam === "all" ? "all" : isNt2Track(trackParam) ? trackParam : defaultTrack(profile);
  const sectionKey = typeof section === "string" ? section : undefined;
  const genres = membersOf(READING_SECTIONS, sectionKey);

  const readings = await db.readingExercise.findMany({
    where: {
      published: true,
      ...(track === "all" ? {} : { level: { in: NT2_TRACK_INFO[track].levels } }),
      ...(genres ? { genre: { in: genres } } : {}),
    },
    orderBy: [{ isNt2: "desc" }, { level: "asc" }, { createdAt: "asc" }],
    include: {
      topic: true,
      attempts: { where: { userId: user.id, completedAt: { not: null } }, orderBy: { completedAt: "desc" }, take: 1, select: { correct: true, total: true } },
      _count: { select: { questions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Lezen")}
        description={t("Reading practice organised like the NT2 Staatsexamen: by programme and text type. Tap any word to see its meaning and save it.")}
        actions={<ButtonLink href="/reading/new" variant="secondary" size="sm"><Sparkles aria-hidden className="size-4" /> {t("Generate a text")}</ButtonLink>}
      />
      <Nt2Filter basePath="/reading" track={track} section={sectionKey} sections={READING_SECTIONS} skillLabel="Reading" />
      {readings.length === 0 ? (
        <EmptyState title={t("No texts in this section yet")}>{t("Try another programme or section, or generate a new text.")}</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {readings.map((r) => {
            const last = r.attempts[0];
            return (
              <li key={r.id}>
                <CardLink href={`/reading/${r.slug}`} className="flex h-full flex-col">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <LevelBadge level={r.level} />
                    <Badge>{t(sectionFor(READING_SECTIONS, r.genre)?.label ?? READING_GENRE_LABELS[r.genre])}</Badge>
                    {r.source === "AI" && <Badge tone="warning">{t("AI-generated")}</Badge>}
                  </div>
                  <h2 className="mt-3 font-semibold" lang="nl">{r.title}</h2>
                  <p className="mt-1 flex-1 text-sm text-muted">{r.summaryEn}</p>
                  <p className="mt-3 text-xs text-muted">
                    {t("{min} min read · {words} words · {n} questions", { min: r.readingMinutes, words: r.wordCount, n: r._count.questions })}
                    {last && <span className="ml-1 font-medium text-success">· {t("last score {correct}/{total}", { correct: last.correct, total: last.total })}</span>}
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
