import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Headphones, Mic, PenLine } from "lucide-react";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { daysUntil } from "@/lib/server/dates";
import { NT2_PROGRAM_LABELS, SKILL_LABELS } from "@/lib/constants";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardLink } from "@/components/ui/card";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress";

export const metadata: Metadata = { title: "NT2 preparation" };

export default async function Nt2Page() {
  const { user, profile } = await requireProfile();
  const [exams, attempts, nt2Writing, nt2Speaking] = await Promise.all([
    db.mockExam.findMany({ where: { published: true }, orderBy: [{ program: "asc" }, { skill: "asc" }], include: { _count: { select: { parts: true } } } }),
    db.attempt.findMany({
      where: { userId: user.id, kind: "MOCK_EXAM", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 30,
      include: { mockExam: { select: { title: true, skill: true, passPercent: true, slug: true } } },
    }),
    db.writingSubmission.findMany({
      where: { userId: user.id, prompt: { isNt2: true } },
      include: { feedback: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.conversation.findMany({
      where: { userId: user.id, scenario: "NT2_SPEAKING", feedback: { isNot: null } },
      include: { feedback: true },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
  ]);
  const examInDays = daysUntil(profile.examDate);
  const latestBySkill = (skill: string) => attempts.find((a) => a.mockExam?.skill === skill);
  const avg5 = (xs: number[]) => (xs.length ? Math.round(((xs.reduce((a, b) => a + b, 0) / xs.length - 1) / 4) * 100) : null);
  const readiness = [
    { skill: "READING", icon: BookOpen, value: (() => { const a = latestBySkill("READING"); return a ? Math.round((a.correct / a.total) * 100) : null; })(), note: "Latest practice exam" },
    { skill: "LISTENING", icon: Headphones, value: (() => { const a = latestBySkill("LISTENING"); return a ? Math.round((a.correct / a.total) * 100) : null; })(), note: "Latest practice exam" },
    { skill: "WRITING", icon: PenLine, value: avg5(nt2Writing.filter((w) => w.feedback).map((w) => (w.feedback!.grammarScore + w.feedback!.taskScore + w.feedback!.coherenceScore + w.feedback!.vocabularyScore) / 4)), note: "NT2-style writing tasks" },
    { skill: "SPEAKING", icon: Mic, value: avg5(nt2Speaking.map((c) => (c.feedback!.grammarScore + c.feedback!.fluencyScore + c.feedback!.vocabularyScore) / 3)), note: "NT2 speaking practice reports" },
  ] as const;

  return (
    <div className="space-y-8">
      <PageHeader
        title="NT2 preparation"
        eyebrow={profile.preparingNt2 ? NT2_PROGRAM_LABELS[profile.nt2Program] : undefined}
        description="Practise the four skills tested in the Staatsexamen NT2 with original exercises. Practice scores are estimates, not official results."
      />

      {profile.preparingNt2 && examInDays !== null && examInDays >= 0 && (
        <Card className="border-accent/40 bg-accent-soft/40">
          <p className="text-lg font-semibold">{examInDays} days until your exam</p>
          <p className="text-sm text-muted">
            {examInDays > 42 ? "Plenty of time: focus on your weakest skill and daily vocabulary." : examInDays > 14 ? "Start doing timed exam-mode practice once a week per skill." : "Final stretch: light review, timed practice, and enough sleep."}
          </p>
        </Card>
      )}

      <section>
        <SectionTitle>Practice readiness by skill</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {readiness.map((r) => (
            <Card key={r.skill}>
              <p className="flex items-center gap-2 font-medium"><r.icon aria-hidden className="size-4 text-primary" /> {SKILL_LABELS[r.skill]}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{r.value == null ? "—" : `${r.value}%`}</p>
              <ProgressBar value={r.value ?? 0} label={`${SKILL_LABELS[r.skill]} readiness`} tone="accent" className="mt-2" />
              <p className="mt-2 text-xs text-muted">{r.value == null ? "No data yet" : r.note}</p>
            </Card>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">A practice score around 60% or higher suggests you&apos;re on track. This is an estimate based on our own practice material, not a prediction of your official result.</p>
      </section>

      <section>
        <SectionTitle>Practice exams</SectionTitle>
        <ul className="grid gap-4 md:grid-cols-2">
          {exams.map((e) => {
            const best = attempts.filter((a) => a.mockExamId === e.id).sort((a, b) => b.correct / b.total - a.correct / a.total)[0];
            return (
              <li key={e.id}>
                <Card className="flex h-full flex-col">
                  <div className="flex flex-wrap gap-1.5">
                    <LevelBadge level={e.level} />
                    <Badge tone="accent">{NT2_PROGRAM_LABELS[e.program]}</Badge>
                    <Badge>{SKILL_LABELS[e.skill]}</Badge>
                  </div>
                  <h3 className="mt-3 font-semibold">{e.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted">{e.description}</p>
                  <p className="mt-2 text-xs text-muted">{e.durationMinutes} minutes in exam mode{best && ` · best ${Math.round((best.correct / best.total) * 100)}%`}</p>
                  <div className="mt-4 flex gap-2">
                    <ButtonLink href={`/nt2/${e.slug}?mode=practice`} size="sm" variant="secondary">Practice mode</ButtonLink>
                    <ButtonLink href={`/nt2/${e.slug}?mode=exam`} size="sm">Exam mode (timed)</ButtonLink>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <CardLink href="/speaking">
          <p className="flex items-center gap-2 font-semibold"><Mic aria-hidden className="size-4 text-primary" /> Speaking practice</p>
          <p className="mt-1 text-sm text-muted">Choose “NT2 speaking practice” for exam-style questions: give your opinion, describe, advise.</p>
        </CardLink>
        <CardLink href="/writing">
          <p className="flex items-center gap-2 font-semibold"><PenLine aria-hidden className="size-4 text-primary" /> Writing tasks</p>
          <p className="mt-1 text-sm text-muted">Tasks marked “NT2-style”: formal emails, complaints, opinions and forms.</p>
        </CardLink>
      </section>

      <section>
        <SectionTitle>History</SectionTitle>
        {attempts.length === 0 ? (
          <p className="text-sm text-muted">No practice exams yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Practice exam history</caption>
              <thead className="bg-surface-2 text-left text-xs text-muted">
                <tr><th scope="col" className="px-4 py-2">Date</th><th scope="col" className="px-4 py-2">Exam</th><th scope="col" className="px-4 py-2">Mode</th><th scope="col" className="px-4 py-2 text-right">Score</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {attempts.map((a) => {
                  const pct = Math.round((a.correct / a.total) * 100);
                  return (
                    <tr key={a.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{a.completedAt!.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                      <td className="px-4 py-2"><Link href={`/nt2/${a.mockExam?.slug}`} className="hover:underline">{a.mockExam?.title}</Link></td>
                      <td className="px-4 py-2">{a.mode === "EXAM" ? "Exam" : "Practice"}</td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {a.correct}/{a.total} ({pct}%) {pct >= (a.mockExam?.passPercent ?? 60) ? <span className="text-success">✓</span> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
