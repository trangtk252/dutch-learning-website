import type { Metadata } from "next";
import { Award } from "lucide-react";
import type { AttemptKind } from "@prisma/client";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { addDays } from "@/lib/server/dates";
import { awardAchievements, getActivitySummary, getDailyMinutes } from "@/lib/server/progress";
import { getProgressEstimates } from "@/lib/server/stats";
import { Card } from "@/components/ui/card";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { MinutesBars } from "@/components/charts/minutes-bars";
import { EstimateList } from "@/components/estimate-list";
import { getT, getLocale, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Progress");

export default async function ProgressPage() {
  const { user, profile } = await requireProfile();
  const t = await getT();
  const dl = (await getLocale()) === "vi" ? "vi-VN" : "en-GB";
  const activity = await getActivitySummary(user.id, profile.timezone);
  await awardAchievements(user.id, activity.streak);
  const since30 = addDays(new Date(), -30);

  const accuracy = async (kind: AttemptKind) => {
    const agg = await db.attempt.aggregate({ where: { userId: user.id, kind, completedAt: { not: null } }, _sum: { correct: true, total: true }, _count: true });
    return { count: agg._count, pct: agg._sum.total ? Math.round(((agg._sum.correct ?? 0) / agg._sum.total) * 100) : null };
  };

  const [estimates, days30, learned, reviewsTotal, reviews30, failed30, conversations, corrections, writing, studyTime, listening, reading, grammar, exams, achievements] = await Promise.all([
    getProgressEstimates(user.id, profile, t),
    getDailyMinutes(user.id, profile.timezone, 30),
    db.vocabularyCard.count({ where: { userId: user.id, state: "REVIEW" } }),
    db.review.count({ where: { userId: user.id } }),
    db.review.count({ where: { userId: user.id, reviewedAt: { gte: since30 }, stateBefore: "REVIEW" } }),
    db.review.count({ where: { userId: user.id, reviewedAt: { gte: since30 }, stateBefore: "REVIEW", rating: "AGAIN" } }),
    db.conversation.count({ where: { userId: user.id } }),
    db.userMistake.count({ where: { userId: user.id, source: "SPEAKING" } }),
    db.writingSubmission.count({ where: { userId: user.id } }),
    db.dailyActivity.aggregate({ where: { userId: user.id }, _sum: { minutes: true } }),
    accuracy("LISTENING"),
    accuracy("READING"),
    accuracy("GRAMMAR"),
    accuracy("MOCK_EXAM"),
    db.achievement.findMany({ include: { users: { where: { userId: user.id } } } }),
  ]);
  const retention = reviews30 ? Math.round(((reviews30 - failed30) / reviews30) * 100) : null;
  const hours = Math.floor((studyTime._sum.minutes ?? 0) / 60);
  const mins = (studyTime._sum.minutes ?? 0) % 60;

  const tiles: [string, string, string?][] = [
    [t("Words learned"), String(learned), t("cards in long-term review")],
    [t("Reviews"), String(reviewsTotal), t("all time")],
    [t("SRS retention"), retention == null ? "—" : `${retention}%`, t("mature-card recall, last 30 days")],
    [t("Study streak"), t("{n} d", { n: activity.streak }), t("{n} active days this week", { n: activity.activeDaysThisWeek })],
    [t("Study time"), `${hours}h ${mins}m`, t("all time")],
    [t("Speaking sessions"), String(conversations), t("{n} corrections received", { n: corrections })],
    [t("Listening accuracy"), listening.pct == null ? "—" : `${listening.pct}%`, t("{n} exercises", { n: listening.count })],
    [t("Reading accuracy"), reading.pct == null ? "—" : `${reading.pct}%`, t("{n} exercises", { n: reading.count })],
    [t("Grammar accuracy"), grammar.pct == null ? "—" : `${grammar.pct}%`, t("{n} quizzes", { n: grammar.count })],
    [t("Writing"), String(writing), t("texts submitted")],
    [t("Practice exams"), exams.count ? `${exams.pct}%` : "—", t("{n} completed", { n: exams.count })],
    ["XP", String(activity.totalXp), t("last 400 days")],
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={t("Progress")} description={t("How your practice adds up. Level estimates are based on in-app activity — they are not official CEFR results.")} />
      <Card><MinutesBars days={days30} goal={profile.dailyMinutes} title={t("Minutes studied · last 30 days")} /></Card>
      <section>
        <SectionTitle>{t("At a glance")}</SectionTitle>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map(([label, value, hint]) => (
            <div key={label} className="rounded-2xl border border-line bg-surface p-4">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
              {hint && <dd className="mt-0.5 text-xs text-muted">{hint}</dd>}
            </div>
          ))}
        </dl>
      </section>
      <section>
        <SectionTitle>{t("Estimated progress toward {target}", { target: profile.targetLevel })}</SectionTitle>
        <Card><EstimateList items={estimates} /></Card>
      </section>
      <section>
        <SectionTitle>{t("Milestones")}</SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => {
            const earned = a.users[0];
            return (
              <li key={a.id} className={earned ? "flex gap-3 rounded-2xl border border-line bg-surface p-4" : "flex gap-3 rounded-2xl border border-dashed border-line p-4 opacity-60"}>
                <Award aria-hidden className={earned ? "size-6 shrink-0 text-accent" : "size-6 shrink-0 text-muted"} />
                <div>
                  <p className="font-medium">{t(a.title)}</p>
                  <p className="text-sm text-muted">{t(a.description)}</p>
                  <p className="mt-1 text-xs text-muted">{earned ? t("Earned {date}", { date: earned.earnedAt.toLocaleDateString(dl, { day: "numeric", month: "short" }) }) : t("Not yet")}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
