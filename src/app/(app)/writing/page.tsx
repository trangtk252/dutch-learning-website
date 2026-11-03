import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { NT2_TRACK_INFO, WRITING_SECTIONS, defaultTrack, isNt2Track, membersOf, sectionFor } from "@/lib/nt2";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CardLink } from "@/components/ui/card";
import { EmptyState, PageHeader, SectionTitle } from "@/components/ui/page-header";
import { Nt2Filter } from "@/components/nt2-filter";
import { getT, getLocale, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Writing");

export default async function WritingPage({ searchParams }: PageProps<"/writing">) {
  const { user, profile } = await requireProfile();
  const t = await getT();
  const dl = (await getLocale()) === "vi" ? "vi-VN" : "en-GB";
  const { track: trackParam, section } = await searchParams;
  const track = trackParam === "all" ? "all" : isNt2Track(trackParam) ? trackParam : defaultTrack(profile);
  const sectionKey = typeof section === "string" ? section : undefined;
  const taskTypes = membersOf(WRITING_SECTIONS, sectionKey);
  const [prompts, submissions] = await Promise.all([
    db.writingPrompt.findMany({
      where: {
        ...(track === "all" ? {} : { level: { in: NT2_TRACK_INFO[track].levels } }),
        ...(taskTypes ? { taskType: { in: taskTypes } } : {}),
      },
      orderBy: [{ isNt2: "desc" }, { level: "asc" }],
    }),
    db.writingSubmission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { prompt: { select: { title: true } }, feedback: true, _count: { select: { corrections: true } } },
    }),
  ]);
  return (
    <div className="space-y-8">
      <PageHeader
        title={t("Schrijven")}
        description={t("Writing tasks organised like the NT2 Staatsexamen: by programme and task type. Get corrections, explanations and a more natural version.")}
        actions={<ButtonLink href="/writing/new" size="sm">{t("Free writing")}</ButtonLink>}
      />
      <section className="space-y-4">
        <SectionTitle>{t("Writing tasks")}</SectionTitle>
        <Nt2Filter basePath="/writing" track={track} section={sectionKey} sections={WRITING_SECTIONS} skillLabel="Writing" />
        {prompts.length === 0 && <EmptyState title={t("No tasks in this section yet")}>{t("Try another programme or section, or use free writing.")}</EmptyState>}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((p) => (
            <li key={p.id}>
              <CardLink href={`/writing/new?prompt=${p.slug}`} className="flex h-full flex-col">
                <div className="flex flex-wrap gap-1.5">
                  <LevelBadge level={p.level} />
                  <Badge>{t(sectionFor(WRITING_SECTIONS, p.taskType)?.label ?? "")}</Badge>
                  <Badge tone="neutral">{t(p.register.toLowerCase())}</Badge>
                </div>
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted">{p.instructions}</p>
                <p className="mt-2 text-xs text-muted">{t("{min}–{max} words", { min: p.minWords, max: p.maxWords })}</p>
              </CardLink>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <SectionTitle>{t("Your texts")}</SectionTitle>
        {submissions.length === 0 ? (
          <EmptyState title={t("No texts yet")}>{t("Pick a task above to get started.")}</EmptyState>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {submissions.map((s) => {
              const f = s.feedback;
              const avg = f ? ((f.grammarScore + f.vocabularyScore + f.structureScore + f.registerScore + f.coherenceScore + f.taskScore) / 6).toFixed(1) : null;
              return (
                <li key={s.id}>
                  <Link href={`/writing/${s.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2/60">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.prompt?.title ?? s.taskDescription ?? t("Free writing")}</p>
                      <p className="text-xs text-muted">{s.createdAt.toLocaleDateString(dl, { day: "numeric", month: "short" })} · {t("{n} words", { n: s.wordCount })} · {t("{n} corrections", { n: s._count.corrections })}</p>
                    </div>
                    {avg && <span className="shrink-0 text-sm text-muted">{t("avg {avg}/5", { avg })}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
