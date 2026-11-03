import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { purgeExpiredTranscripts } from "@/lib/server/retention";
import { CEFR_LEVELS, SCENARIOS, SCENARIO_INFO } from "@/lib/constants";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/form";
import { EmptyState, PageHeader, SectionTitle } from "@/components/ui/page-header";
import { NT2_TRACKS, NT2_TRACK_INFO, SPEAKING_TASKS, defaultTrack } from "@/lib/nt2";
import { startConversationAction, startNt2SpeakingAction } from "./actions";
import { ClearAllConversations, DeleteConversationButton } from "./delete-buttons";
import { getT, getLocale, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Speaking");

const ERRORS: Record<string, string> = {
  refused: "The tutor couldn't start this conversation. Please try another scenario.",
  rate_limited: "The AI service is busy. Please try again in a moment.",
  unavailable: "The AI tutor is unavailable right now. Please try again later.",
};

export default async function SpeakingPage({ searchParams }: PageProps<"/speaking">) {
  const { user, profile } = await requireProfile();
  const t = await getT();
  const dl = (await getLocale()) === "vi" ? "vi-VN" : "en-GB";
  const { error } = await searchParams;
  await purgeExpiredTranscripts(user.id);
  const conversations = await db.conversation.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    take: 15,
    include: { _count: { select: { messages: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("Spreken")}
        description={t("Talk with Sanne, your Dutch conversation partner — by voice or by typing. She answers in Dutch, corrects your mistakes on the side, and explains in English when you ask.")}
      />
      {typeof error === "string" && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-2 text-sm text-danger">{t(ERRORS[error] ?? ERRORS.unavailable)}</p>}

      <form action={startNt2SpeakingAction} className="space-y-4 rounded-2xl border border-primary/30 bg-primary-soft/40 p-5">
        <div>
          <h2 className="text-lg font-semibold">{t("Spreken — NT2 Staatsexamen practice")}</h2>
          <p className="text-sm text-muted">{t("Exam-style speaking tasks at the level of your programme. Sanne asks one question at a time, like an examiner.")}</p>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t("Task type")}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SPEAKING_TASKS.map((task, i) => (
              <label key={task.key} className="cursor-pointer rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2 has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40">
                <input type="radio" name="task" value={task.key} defaultChecked={i === 0} className="sr-only" />
                <span className="block font-medium" lang="nl">{task.label}</span>
                <span className="block text-sm text-muted">{t(task.hint)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="track">{t("Programme")}</Label>
            <Select id="track" name="track" defaultValue={defaultTrack(profile)} className="w-56">
              {NT2_TRACKS.map((tr) => <option key={tr} value={tr}>{t(NT2_TRACK_INFO[tr].label)}</option>)}
            </Select>
          </div>
          <Button type="submit" size="lg">{t("Start NT2 speaking task")}</Button>
        </div>
      </form>

      <form action={startConversationAction} className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-lg font-semibold">{t("Or practise a real-life situation")}</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SCENARIOS.filter((s) => s !== "NT2_SPEAKING").map((s, i) => (
              <label key={s} className="cursor-pointer rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2 has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40">
                <input type="radio" name="scenario" value={s} defaultChecked={i === 0} className="sr-only" />
                <span className="block font-medium">{t(SCENARIO_INFO[s].label)}</span>
                <span className="block text-sm text-muted" lang="nl">{SCENARIO_INFO[s].dutch}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="level">{t("Difficulty")}</Label>
            <Select id="level" name="level" defaultValue={profile.currentLevel} className="w-32">
              {CEFR_LEVELS.filter((l) => l !== "A1").map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
          <Button type="submit" size="lg">{t("Start conversation")}</Button>
        </div>
        <p className="text-xs text-muted">
          {t("Privacy: we never store audio. Voice input is transcribed by your browser's speech recognition (in Chrome this uses Google's service).")}
          {" "}{profile.storeConversations
            ? profile.conversationRetentionDays
              ? t("Text transcripts are kept for {n} days", { n: profile.conversationRetentionDays })
              : t("Text transcripts are kept for an unlimited number of days")
            : t("Transcripts are deleted when you finish a conversation")}
          {" "}— {t("change this in")} <Link href="/settings" className="text-primary-strong underline">{t("Settings")}</Link>.
        </p>
      </form>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionTitle>{t("Previous conversations")}</SectionTitle>
          {conversations.length > 0 && <ClearAllConversations />}
        </div>
        {conversations.length === 0 ? (
          <EmptyState title={t("No conversations yet")}>{t("Pick a situation above — start with something familiar, like small talk.")}</EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {conversations.map((c) => {
              return (
                <li key={c.id} className="relative">
                  <DeleteConversationButton id={c.id} title={t(c.title)} />
                  <Link href={`/speaking/${c.id}`} className="block rounded-2xl border border-line bg-surface p-4 pr-12 hover:bg-surface-2/60">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{t(c.title)}</span>
                      <LevelBadge level={c.level} />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {c.startedAt.toLocaleDateString(dl, { day: "numeric", month: "short" })} · {t("{n} messages", { n: c._count.messages })}
                    </p>
                    {!c.endedAt && <Badge tone="primary" className="mt-2">{t("In progress")}</Badge>}
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
