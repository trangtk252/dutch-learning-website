import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { levelIndex, type Cefr } from "@/lib/constants";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CardLink } from "@/components/ui/card";
import { EmptyState, PageHeader, SectionTitle } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Writing" };

const TASK = { EMAIL: "Email", MESSAGE: "Message", FORM: "Form", OPINION: "Opinion", ESSAY: "Essay", COMPLAINT: "Complaint" };

export default async function WritingPage() {
  const { user, profile } = await requireProfile();
  const max = levelIndex(profile.currentLevel as Cefr) + 1;
  const [prompts, submissions] = await Promise.all([
    db.writingPrompt.findMany({ orderBy: [{ level: "asc" }] }),
    db.writingSubmission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { prompt: { select: { title: true } }, feedback: true, _count: { select: { corrections: true } } },
    }),
  ]);
  const suitable = prompts.filter((p) => levelIndex(p.level as Cefr) <= max);
  const ahead = prompts.filter((p) => levelIndex(p.level as Cefr) > max);
  return (
    <div className="space-y-8">
      <PageHeader
        title="Writing"
        description="Write emails, messages and opinions. Get corrections, explanations and a more natural version."
        actions={<ButtonLink href="/writing/new" size="sm">Free writing</ButtonLink>}
      />
      <section>
        <SectionTitle>Writing tasks</SectionTitle>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...suitable, ...ahead].map((p) => (
            <li key={p.id}>
              <CardLink href={`/writing/new?prompt=${p.slug}`} className="flex h-full flex-col">
                <div className="flex flex-wrap gap-1.5">
                  <LevelBadge level={p.level} />
                  <Badge>{TASK[p.taskType]}</Badge>
                  <Badge tone="neutral">{p.register.toLowerCase()}</Badge>
                  {p.isNt2 && <Badge tone="accent">NT2-style</Badge>}
                </div>
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted">{p.instructions}</p>
                <p className="mt-2 text-xs text-muted">{p.minWords}–{p.maxWords} words</p>
              </CardLink>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <SectionTitle>Your texts</SectionTitle>
        {submissions.length === 0 ? (
          <EmptyState title="No texts yet">Pick a task above to get started.</EmptyState>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {submissions.map((s) => {
              const f = s.feedback;
              const avg = f ? ((f.grammarScore + f.vocabularyScore + f.structureScore + f.registerScore + f.coherenceScore + f.taskScore) / 6).toFixed(1) : null;
              return (
                <li key={s.id}>
                  <Link href={`/writing/${s.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2/60">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.prompt?.title ?? s.taskDescription ?? "Free writing"}</p>
                      <p className="text-xs text-muted">{s.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {s.wordCount} words · {s._count.corrections} corrections</p>
                    </div>
                    {avg && <span className="shrink-0 text-sm text-muted">avg {avg}/5</span>}
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
