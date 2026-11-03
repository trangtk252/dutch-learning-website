import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, Layers, Mic, PenLine } from "lucide-react";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { getActivitySummary } from "@/lib/server/progress";
import { getCardCounts, getDailyPlan, getNextExercises, getProgressEstimates } from "@/lib/server/stats";
import { NT2_PROGRAM_LABELS, type SkillKey } from "@/lib/constants";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardLink } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/page-header";
import { MinutesBars } from "@/components/charts/minutes-bars";
import { EstimateList } from "@/components/estimate-list";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Today") };
}

const SKILL_ICON: Record<SkillKey, typeof Layers> = { GRAMMAR: PenLine, VOCABULARY: Layers, SPEAKING: Mic, LISTENING: Headphones, READING: BookOpen, WRITING: PenLine };

function greeting(t: (s: string) => string) {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/Amsterdam" }).format(new Date()));
  return h < 12 ? t("Good morning") : h < 18 ? t("Good afternoon") : t("Good evening");
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const t = await getT();
  const { user, profile } = await requireProfile();
  const { welcome } = await searchParams;
  const [activity, cards, plan, estimates, next, lastConversation] = await Promise.all([
    getActivitySummary(user.id, profile.timezone),
    getCardCounts(user.id, profile.timezone),
    getDailyPlan(user.id, profile, t),
    getProgressEstimates(user.id, profile, t),
    getNextExercises(user.id, profile.currentLevel),
    db.conversation.findFirst({ where: { userId: user.id }, orderBy: { startedAt: "desc" }, select: { startedAt: true } }),
  ]);

  const hrefFor: Partial<Record<SkillKey, string>> = {
    VOCABULARY: "/vocabulary/review",
    SPEAKING: "/speaking",
    LISTENING: next.listening ? `/listening/${next.listening.slug}` : "/listening",
    READING: next.reading ? `/reading/${next.reading.slug}` : "/reading",
    WRITING: "/writing",
  };
  const detailFor: Partial<Record<SkillKey, string>> = {
    LISTENING: next.listening?.title,
    READING: next.reading?.title,
    SPEAKING: lastConversation ? undefined : t("Try your first conversation"),
  };


  return (
    <div className="space-y-8">
      {welcome === "1" && (
        <div role="status" className="rounded-2xl border border-primary/30 bg-primary-soft px-5 py-4 text-sm text-ink">
          <strong>{t("Your plan is ready!")}</strong> {t("Below is today's plan, built from your goals. It adapts as you practise.")}
        </div>
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            {greeting(t)}, {user.name}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{t("What to study today")}</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted">
            <LevelBadge level={profile.currentLevel} /> <ArrowRight aria-label={t("towards")} className="size-3.5" />
            <LevelBadge level={profile.targetLevel} />
            {profile.preparingNt2 && <Badge tone="accent">{t(NT2_PROGRAM_LABELS[profile.nt2Program])}</Badge>}
            {plan.examInDays != null && plan.examInDays >= 0 && <span>· {t("exam in {n} days", { n: plan.examInDays })}</span>}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="plan-title">
          <SectionTitle>
            <span id="plan-title">{t("Today's plan · {n} min", { n: plan.totalMinutes })}</span>
          </SectionTitle>
          <ol className="space-y-3">
            {plan.blocks.map((block, i) => {
              const Icon = SKILL_ICON[block.skill];
              return (
                <li key={block.skill}>
                  <CardLink href={hrefFor[block.skill] ?? "/dashboard"} className="flex items-start gap-4 p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 font-medium text-ink">
                          <span className="sr-only">{t("Step {n}:", { n: i + 1 })} </span>
                          {block.title}
                          {detailFor[block.skill] && <span className="font-normal text-muted"> · {detailFor[block.skill]}</span>}
                        </span>
                        <span className="shrink-0 text-sm tabular-nums text-muted">{block.minutes} {t("min")}</span>
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">{block.reason}</span>
                    </span>
                  </CardLink>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="space-y-6">
          <Card>
            <SectionTitle action={<Link href="/vocabulary" className="text-sm text-primary-strong hover:underline">{t("All words")}</Link>}>
              {t("Vocabulary")}
            </SectionTitle>
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs text-muted">{t("Due today")}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{cards.due}</dd>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs text-muted">{t("New")}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{cards.new}</dd>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs text-muted">{t("Learning")}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{cards.learning}</dd>
              </div>
            </dl>
            <ButtonLink href="/vocabulary/review" className="mt-4 w-full" variant={cards.due + cards.new > 0 ? "primary" : "secondary"}>
              {cards.due > 0 ? t(cards.due === 1 ? "Review {n} card" : "Review {n} cards", { n: cards.due }) : cards.new > 0 ? t("Learn new words") : t("Nothing due — add words")}
            </ButtonLink>
          </Card>

          <Card>
            <MinutesBars days={activity.last7} goal={profile.dailyMinutes} title={t("Minutes studied · last 7 days")} />
            <p className="mt-3 text-xs text-muted">
              {t("{a} of {b} active days this week · {xp} XP", { a: activity.activeDaysThisWeek, b: profile.weeklyGoalDays, xp: activity.totalXp })}
            </p>
          </Card>
        </div>
      </div>

      <section aria-labelledby="progress-title">
        <SectionTitle action={<Link href="/progress" className="text-sm text-primary-strong hover:underline">{t("Details")}</Link>}>
          <span id="progress-title">{t("Progress estimates")}</span>
        </SectionTitle>
        <Card>
          <EstimateList items={estimates} />
          <p className="mt-5 border-t border-line pt-3 text-xs text-muted">
            {t("These are estimates based on your practice in this app. They can't determine your official CEFR level or predict an NT2 result.")}
          </p>
        </Card>
      </section>
    </div>
  );
}
