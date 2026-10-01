import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { ERROR_CATEGORY_LABELS, POS_LABELS } from "@/lib/constants";
import { displayLemma } from "@/lib/server/vocabulary";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Search" };

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{title} <span className="font-normal">({count})</span></h2>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">{children}</ul>
    </section>
  );
}

/** Global search across vocabulary, examples, grammar, reading, listening, blog and mistakes. */
export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { user } = await requireProfile();
  const { q: raw } = await searchParams;
  const q = typeof raw === "string" ? raw.trim().slice(0, 80) : "";
  const ci = { contains: q, mode: "insensitive" as const };

  const results = q.length >= 2
    ? await Promise.all([
        db.vocabularyWord.findMany({
          where: { OR: [{ lemma: ci }, { english: ci }, { plural: ci }] },
          take: 12,
          orderBy: [{ verified: "desc" }, { normalized: "asc" }],
          include: { cards: { where: { userId: user.id }, select: { id: true } } },
        }),
        db.wordExample.findMany({ where: { dutch: ci }, take: 8, include: { word: { include: { cards: { where: { userId: user.id }, select: { id: true } } } } } }),
        db.grammarTopic.findMany({ where: { published: true, OR: [{ title: ci }, { summary: ci }, { explanation: ci }] }, take: 8 }),
        db.readingExercise.findMany({ where: { published: true, OR: [{ title: ci }, { body: ci }] }, take: 8 }),
        db.listeningExercise.findMany({ where: { published: true, OR: [{ title: ci }, { segments: { some: { text: ci } } }] }, take: 8 }),
        db.blogPost.findMany({ where: { status: "PUBLISHED", OR: [{ title: ci }, { excerpt: ci }, { body: ci }] }, take: 8 }),
        db.userMistake.findMany({ where: { userId: user.id, OR: [{ original: ci }, { corrected: ci }] }, take: 8, orderBy: { createdAt: "desc" } }),
      ])
    : null;
  const total = results ? results.reduce((n, r) => n + r.length, 0) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Search" description="Words, example sentences, grammar lessons, texts, articles and your own mistakes." />
      <form role="search" className="flex gap-2">
        <label htmlFor="q" className="sr-only">Search</label>
        <Input id="q" name="q" defaultValue={q} placeholder="e.g. op, omdat, huur, perfect tense" autoFocus />
        <Button type="submit"><Search aria-hidden className="size-4" /> Search</Button>
      </form>
      {results && total === 0 && <EmptyState title={`No results for “${q}”`}>Try a different spelling, or add it as a new word from the Vocabulary page.</EmptyState>}
      {results && (
        <div className="space-y-6">
          <Section title="Vocabulary" count={results[0].length}>
            {results[0].map((w) => (
              <li key={w.id}>
                <Link href={w.cards[0] ? `/vocabulary/${w.cards[0].id}` : `/search?q=${encodeURIComponent(w.lemma)}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2/60">
                  <span><span className="font-medium" lang="nl">{displayLemma(w)}</span> <span className="text-xs text-muted">{POS_LABELS[w.partOfSpeech]}</span><span className="block text-sm text-muted">{w.english}</span></span>
                  <span className="flex items-center gap-1"><LevelBadge level={w.cefrLevel} />{w.cards[0] ? <Badge tone="success">In your deck</Badge> : null}</span>
                </Link>
              </li>
            ))}
          </Section>
          <Section title="Example sentences" count={results[1].length}>
            {results[1].map((e) => (
              <li key={e.id} className="px-4 py-3">
                <p lang="nl">{e.dutch}</p>
                <p className="text-sm text-muted">{e.english} · <span lang="nl">{displayLemma(e.word)}</span></p>
              </li>
            ))}
          </Section>
          <Section title="Grammar" count={results[2].length}>
            {results[2].map((t) => (
              <li key={t.id}><Link href={`/grammar/${t.slug}`} className="block px-4 py-3 hover:bg-surface-2/60"><span className="font-medium">{t.title}</span><span className="block text-sm text-muted">{t.summary}</span></Link></li>
            ))}
          </Section>
          <Section title="Reading" count={results[3].length}>
            {results[3].map((r) => (
              <li key={r.id}><Link href={`/reading/${r.slug}`} className="flex justify-between px-4 py-3 hover:bg-surface-2/60"><span lang="nl">{r.title}</span><LevelBadge level={r.level} /></Link></li>
            ))}
          </Section>
          <Section title="Listening" count={results[4].length}>
            {results[4].map((l) => (
              <li key={l.id}><Link href={`/listening/${l.slug}`} className="flex justify-between px-4 py-3 hover:bg-surface-2/60"><span lang="nl">{l.title}</span><LevelBadge level={l.level} /></Link></li>
            ))}
          </Section>
          <Section title="Blog" count={results[5].length}>
            {results[5].map((p) => (
              <li key={p.id}><Link href={`/blog/${p.slug}`} className="block px-4 py-3 hover:bg-surface-2/60"><span className="font-medium">{p.title}</span><span className="block text-sm text-muted">{p.excerpt}</span></Link></li>
            ))}
          </Section>
          <Section title="Your mistakes" count={results[6].length}>
            {results[6].map((m) => (
              <li key={m.id} className="px-4 py-3 text-sm">
                <span className="text-xs text-muted">{ERROR_CATEGORY_LABELS[m.category]}</span>
                <p lang="nl"><span className="line-through decoration-1 opacity-70">{m.original}</span> → <span className="font-medium">{m.corrected}</span></p>
              </li>
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}
