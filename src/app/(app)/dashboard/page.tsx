import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Flame, GraduationCap, Headphones, Layers, Library, Mic, PenLine } from "lucide-react";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { getActivitySummary } from "@/lib/server/progress";
import { getCardCounts, getDailyPlan, getNextExercises, getProgressEstimates, getRecommendedGrammar } from "@/lib/server/stats";
import { ERROR_CATEGORY_LABELS, NT2_PROGRAM_LABELS, type SkillKey } from "@/lib/constants";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardLink } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress";
import { MinutesBars } from "@/components/charts/minutes-bars";
import { EstimateList } from "@/components/estimate-list";

export const metadata: Metadata = { title: "Today" };

const SKILL_ICON = { VOCABULARY: Layers, GRAMMAR: Library, SPEAKING: Mic, LISTENING: Headphones, READING: BookOpen, WRITING: PenLine };

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/Amsterdam" }).format(new Date()));
  return h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { user, profile } = await requireProfile();
  const { welcome } = await searchParams;
  const [activity, cards, plan, estimates, grammar, next, lastConversation] = await Promise.all([
    getActivitySummary(user.id, profile.timezone),
    getCardCounts(user.id, profile.timezone),
    getDailyPlan(user.id, profile),
    getProgressEstimates(user.id, profile),
    getRecommendedGrammar(user.id, profile.currentLevel),
    getNextExercises(user.id, profile.currentLevel),
    db.conversation.findFirst({ where: { userId: user.id }, orderBy: { startedAt: "desc" }, select: { startedAt: true } }),
  ]);

  const hrefFor: Record<SkillKey, string> = {
    VOCABULARY: "/vocabulary/review",
    SPEAKING: "/speaking",
    LISTENING: next.listening ? `/listening/${next.listening.slug}` : "/listening",
    READING: next.reading ? `/reading/${next.reading.slug}` : "/reading",
    GRAMMAR: grammar ? `/grammar/${grammar.topic.slug}` : "/grammar",
    WRITING: "/writing",
  };
  const detailFor: Partial<Record<SkillKey, string>> = {
    LISTENING: next.listening?.title,
    READING: next.reading?.title,
    GRAMMAR: grammar?.topic.title,
    SPEAKING: lastConversation ? undefined : "Try your first conversation",
  };

  const goalPct = Math.min(100, Math.round((activity.todayMinutes / profile.dailyMinutes) * 100));

  return (
    <div className="space-y-8">
      {welcome === "1" && (
        <div role="status" className="rounded-2xl border border-primary/30 bg-primary-soft px-5 py-4 text-sm text-ink">
          <strong>Je plan staat klaar!</strong> Below is today&apos;s plan, built from your goals. It adapts as you practise.
        </div>
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            {greeting()}, {user.name}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">What to study today</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted">
            <LevelBadge level={profile.currentLevel} /> <ArrowRight aria-label="towards" className="size-3.5" />
            <LevelBadge level={profile.targetLevel} />
            {profile.preparingNt2 && <Badge tone="accent">{NT2_PROGRAM_LABELS[profile.nt2Program]}</Badge>}
            {plan.examInDays != null && plan.examInDays >= 0 && <span>· exam in {plan.examInDays} days</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl border border-line bg-surface px-4 py-3">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Flame aria-hidden className="size-4 text-accent" /> Streak
            </p>
            <p className="text-xl font-semibold tabular-nums">
              {activity.streak} <span className="text-sm font-normal text-muted">{activity.streak === 1 ? "day" : "days"}</span>
            </p>
          </div>
          <div className="min-w-36 rounded-2xl border border-line bg-surface px-4 py-3">
            <p className="text-xs text-muted">Today</p>
            <p className="text-xl font-semibold tabular-nums">
              {activity.todayMinutes}
              <span className="text-sm font-normal text-muted"> / {profile.dailyMinutes} min</span>
            </p>
            <ProgressBar value={goalPct} label="Daily goal progress" className="mt-1.5 h-1.5" tone="success" />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="plan-title">
          <SectionTitle>
            <span id="plan-title">Today&apos;s plan · {plan.totalMinutes} min</span>
          </SectionTitle>
          <ol className="space-y-3">
            {plan.blocks.map((block, i) => {
              const Icon = SKILL_ICON[block.skill];
              return (
                <li key={block.skill}>
                  <CardLink href={hrefFor[block.skill]} className="flex items-start gap-4 p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 font-medium text-ink">
                          <span className="sr-only">Step {i + 1}: </span>
                          {block.title}
                          {detailFor[block.skill] && <span className="font-normal text-muted"> · {detailFor[block.skill]}</span>}
                        </span>
                        <span className="shrink-0 text-sm tabular-nums text-muted">{block.minutes} min</span>
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">{block.reason}</span>
                    </span>
                  </CardLink>
                </li>
              );
            })}
          </ol>
          {plan.suggestMockExam && (
            <CardLink href="/nt2" className="mt-3 flex items-center gap-4 border-accent/40 bg-accent-soft/50 p-4">
              <GraduationCap aria-hidden className="size-6 text-accent" />
              <span>
                <span className="font-medium">Your exam is close</span>
                <span className="block text-sm text-muted">Take a timed practice exam this week to check your readiness.</span>
              </span>
            </CardLink>
          )}
        </section>

        <div className="space-y-6">
          <Card>
            <SectionTitle action={<Link href="/vocabulary" className="text-sm text-primary hover:underline">All words</Link>}>
              Vocabulary
            </SectionTitle>
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs text-muted">Due today</dt>
                <dd className="text-2xl font-semibold tabular-nums">{cards.due}</dd>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs text-muted">New</dt>
                <dd className="text-2xl font-semibold tabular-nums">{cards.new}</dd>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs text-muted">Learning</dt>
                <dd className="text-2xl font-semibold tabular-nums">{cards.learning}</dd>
              </div>
            </dl>
            <ButtonLink href="/vocabulary/review" className="mt-4 w-full" variant={cards.due + cards.new > 0 ? "primary" : "secondary"}>
              {cards.due > 0 ? `Review ${cards.due} card${cards.due === 1 ? "" : "s"}` : cards.new > 0 ? "Learn new words" : "Nothing due — add words"}
            </ButtonLink>
          </Card>

          {grammar && (
            <Card>
              <SectionTitle>Recommended lesson</SectionTitle>
              <Link href={`/grammar/${grammar.topic.slug}`} className="group block">
                <p className="font-medium text-ink group-hover:text-primary">{grammar.topic.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {grammar.reason
                    ? `You made ${grammar.reason.count} recent mistake${grammar.reason.count === 1 ? "" : "s"} with “${ERROR_CATEGORY_LABELS[grammar.reason.category]}”.`
                    : grammar.topic.summary}
                </p>
              </Link>
            </Card>
          )}

          <Card>
            <MinutesBars days={activity.last7} goal={profile.dailyMinutes} title="Minutes studied · last 7 days" />
            <p className="mt-3 text-xs text-muted">
              {activity.activeDaysThisWeek} of {profile.weeklyGoalDays} active days this week · {activity.totalXp} XP
            </p>
          </Card>
        </div>
      </div>

      <section aria-labelledby="progress-title">
        <SectionTitle action={<Link href="/progress" className="text-sm text-primary hover:underline">Details</Link>}>
          <span id="progress-title">Progress estimates</span>
        </SectionTitle>
        <Card>
          <EstimateList items={estimates} />
          <p className="mt-5 border-t border-line pt-3 text-xs text-muted">
            These are estimates based on your practice in this app. They can&apos;t determine your official CEFR level or
            predict an NT2 result.
          </p>
        </Card>
      </section>
    </div>
  );
}
