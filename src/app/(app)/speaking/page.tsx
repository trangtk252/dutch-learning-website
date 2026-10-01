import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { purgeExpiredTranscripts } from "@/lib/server/retention";
import { CEFR_LEVELS, SCENARIOS, SCENARIO_INFO } from "@/lib/constants";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/form";
import { EmptyState, PageHeader, SectionTitle } from "@/components/ui/page-header";
import { startConversationAction } from "./actions";

export const metadata: Metadata = { title: "Speaking" };

const ERRORS: Record<string, string> = {
  refused: "The tutor couldn't start this conversation. Please try another scenario.",
  rate_limited: "The AI service is busy. Please try again in a moment.",
  unavailable: "The AI tutor is unavailable right now. Please try again later.",
};

export default async function SpeakingPage({ searchParams }: PageProps<"/speaking">) {
  const { user, profile } = await requireProfile();
  const { error } = await searchParams;
  await purgeExpiredTranscripts(user.id);
  const conversations = await db.conversation.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    take: 15,
    include: { feedback: { select: { grammarScore: true, vocabularyScore: true, fluencyScore: true, accuracyScore: true, naturalnessScore: true } }, _count: { select: { messages: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Speaking practice"
        description="Talk with Sanne, your Dutch conversation partner — by voice or by typing. She answers in Dutch, corrects your mistakes on the side, and explains in English when you ask."
      />
      {typeof error === "string" && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-2 text-sm text-danger">{ERRORS[error] ?? ERRORS.unavailable}</p>}

      <form action={startConversationAction} className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-lg font-semibold">Choose a situation</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SCENARIOS.map((s, i) => (
              <label key={s} className="cursor-pointer rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2 has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40">
                <input type="radio" name="scenario" value={s} defaultChecked={i === 0} className="sr-only" />
                <span className="block font-medium">{SCENARIO_INFO[s].label}</span>
                <span className="block text-sm text-muted" lang="nl">{SCENARIO_INFO[s].dutch}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="level">Difficulty</Label>
            <Select id="level" name="level" defaultValue={profile.currentLevel} className="w-32">
              {CEFR_LEVELS.filter((l) => l !== "A1").map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
          <Button type="submit" size="lg">Start conversation</Button>
        </div>
        <p className="text-xs text-muted">
          Privacy: we never store audio. Voice input is transcribed by your browser&apos;s speech recognition (in Chrome this uses Google&apos;s service).
          {profile.storeConversations
            ? ` Text transcripts are kept for ${profile.conversationRetentionDays || "an unlimited number of"} days`
            : " Transcripts are deleted when you finish a conversation"}
          {" "}— change this in <Link href="/settings" className="text-primary underline">Settings</Link>.
        </p>
      </form>

      <section>
        <SectionTitle>Previous conversations</SectionTitle>
        {conversations.length === 0 ? (
          <EmptyState title="No conversations yet">Pick a situation above — start with something familiar, like small talk.</EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {conversations.map((c) => {
              const f = c.feedback;
              const avg = f ? ((f.grammarScore + f.vocabularyScore + f.fluencyScore + f.accuracyScore + f.naturalnessScore) / 5).toFixed(1) : null;
              return (
                <li key={c.id}>
                  <Link href={`/speaking/${c.id}`} className="block rounded-2xl border border-line bg-surface p-4 hover:bg-surface-2/60">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{c.title}</span>
                      <LevelBadge level={c.level} />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {c.startedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {c._count.messages} messages
                      {avg && ` · report avg ${avg}/5`}
                    </p>
                    {!c.endedAt && <Badge tone="primary" className="mt-2">In progress</Badge>}
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
