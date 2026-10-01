import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { SCENARIO_INFO, type ScenarioKey } from "@/lib/constants";
import { getKnownForms } from "@/lib/server/known-forms";
import { LevelBadge } from "@/components/ui/badge";
import { Chat } from "./chat";
import { SpeakingReport } from "./report";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: PageProps<"/speaking/[id]">) {
  const { user } = await requireProfile();
  const { id } = await params;
  const conv = await db.conversation.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" }, include: { corrections: true } }, feedback: true },
  });
  if (!conv) notFound();
  const knownForms = await getKnownForms(user.id, conv.messages.filter((m) => m.role === "ASSISTANT").map((m) => m.content));
  const info = SCENARIO_INFO[conv.scenario as ScenarioKey];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/speaking" className="text-sm text-primary hover:underline">← Speaking</Link>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{info.label}</h1>
          <p className="text-sm text-muted" lang="nl">{info.dutch}</p>
        </div>
        <LevelBadge level={conv.level} />
      </header>
      {conv.feedback && <SpeakingReport feedback={conv.feedback} corrections={conv.messages.flatMap((m) => m.corrections)} conversationId={conv.id} />}
      {conv.messages.length > 0 ? (
        <Chat
          conversationId={conv.id}
          ended={Boolean(conv.endedAt)}
          knownForms={knownForms}
          initial={conv.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            english: m.english,
            corrections: m.corrections.map((c) => ({ original: c.original, corrected: c.corrected, category: c.category, explanation: c.explanation })),
          }))}
        />
      ) : (
        <p className="rounded-xl bg-surface-2 p-4 text-sm text-muted">The transcript of this conversation has been deleted according to your privacy settings. The report is kept.</p>
      )}
    </div>
  );
}
