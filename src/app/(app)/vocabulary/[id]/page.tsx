import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { POS_LABELS } from "@/lib/constants";
import { displayLemma, wordInclude } from "@/lib/server/vocabulary";
import { formatInterval, retrievability, isDifficult } from "@/lib/srs/fsrs";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SpeakButton } from "@/components/voice/speak-button";
import { CardStateBadge } from "../card-state";
import { CardControls } from "./card-controls";
import { WordEditForm } from "./word-edit-form";

export const metadata: Metadata = { title: "Word" };

const AUX = { HEBBEN: "hebben", ZIJN: "zijn", HEBBEN_ZIJN: "hebben / zijn" };

export default async function WordPage({ params, searchParams }: PageProps<"/vocabulary/[id]">) {
  const { user } = await requireProfile();
  const { id } = await params;
  const { added } = await searchParams;
  const card = await db.vocabularyCard.findFirst({
    where: { id, userId: user.id },
    include: { word: { include: wordInclude }, _count: { select: { reviews: true } } },
  });
  if (!card) notFound();
  const w = card.word;
  const me = await db.user.findUnique({ where: { id: user.id }, select: { role: true } });
  const canEdit = me?.role === "ADMIN" || (!w.verified && w.createdById === user.id);
  const now = new Date();
  const r = retrievability(card, now);
  const synonyms = w.relations.filter((x) => x.type === "SYNONYM");
  const antonyms = w.relations.filter((x) => x.type === "ANTONYM");
  const needsReview = !w.verified && (w.source === "AI" || w.english.startsWith("(meaning unavailable"));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/vocabulary" className="text-sm text-primary hover:underline">← All words</Link>

      {added === "1" && (
        <p role="status" className="rounded-xl bg-success-soft px-4 py-2 text-sm text-success">
          Saved to your vocabulary. It will appear in your next review session.
        </p>
      )}
      {needsReview && (
        <p role="note" className="rounded-xl bg-warning-soft px-4 py-2 text-sm text-warning">
          This entry was generated automatically{w.english.startsWith("(") ? " in offline mode and is incomplete" : ""}. Check it against a dictionary
          {canEdit ? " and edit it below if needed." : "."}
        </p>
      )}

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight" lang="nl">{displayLemma(w)}</h1>
            <SpeakButton text={displayLemma(w)} className="size-10" />
          </div>
          <p className="mt-1 text-lg text-ink">{w.english}</p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>{POS_LABELS[w.partOfSpeech]}</span>
            {w.ipa && <span lang="nl">/{w.ipa}/</span>}
            <LevelBadge level={w.cefrLevel} />
            <Badge tone={w.verified ? "success" : "neutral"}>
              {w.verified ? "Curated" : w.source === "AI" ? "AI-generated" : w.source === "IMPORTED" ? "Imported" : "Unverified"}
            </Badge>
            {w.topics.map((t) => (
              <Link key={t.topicId} href={`/vocabulary?topic=${t.topic.slug}`} className="rounded-full bg-surface-2 px-2 py-0.5 text-xs hover:text-ink">
                {t.topic.name}
              </Link>
            ))}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {w.notes && (
            <Card>
              <h2 className="mb-1 text-sm font-semibold text-muted">Usage note</h2>
              <p>{w.notes}</p>
            </Card>
          )}

          {(w.partOfSpeech === "NOUN" && (w.plural || w.diminutive)) && (
            <Card>
              <h2 className="mb-3 font-semibold">Forms</h2>
              <table className="w-full text-sm" lang="nl">
                <tbody className="divide-y divide-line">
                  <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">Singular</th><td>{displayLemma(w)}</td></tr>
                  {w.plural && <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">Plural</th><td>de {w.plural}</td></tr>}
                  {w.diminutive && <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">Diminutive</th><td>het {w.diminutive}</td></tr>}
                </tbody>
              </table>
            </Card>
          )}

          {w.verb && (
            <Card>
              <h2 className="mb-3 flex flex-wrap items-center gap-2 font-semibold">
                Conjugation
                {w.verb.irregular && <Badge tone="warning">irregular</Badge>}
                {w.verb.separable && <Badge tone="primary">separable ({w.verb.separablePrefix}-)</Badge>}
                {w.verb.reflexive && <Badge>reflexive</Badge>}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2" lang="nl">
                <table className="text-sm">
                  <caption className="mb-1 text-left text-xs font-medium text-muted">Present</caption>
                  <tbody>
                    {[["ik", w.verb.presentIk], ["jij / u", w.verb.presentJij], ["hij / zij", w.verb.presentHij], ["wij / jullie / zij", w.verb.presentWij]].map(([p, f]) => (
                      <tr key={p}><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">{p}</th><td className="font-medium">{f}</td></tr>
                    ))}
                  </tbody>
                </table>
                <table className="text-sm">
                  <caption className="mb-1 text-left text-xs font-medium text-muted">Past</caption>
                  <tbody>
                    <tr><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">imperfect (sg.)</th><td className="font-medium">{w.verb.pastSingular}</td></tr>
                    <tr><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">imperfect (pl.)</th><td className="font-medium">{w.verb.pastPlural}</td></tr>
                    <tr><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">participle</th><td className="font-medium">{w.verb.pastParticiple}</td></tr>
                    <tr><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">perfect</th><td className="font-medium">ik {w.verb.auxiliary === "ZIJN" ? "ben" : "heb"} {w.verb.pastParticiple}</td></tr>
                    <tr><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">auxiliary</th><td>{AUX[w.verb.auxiliary]}</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {w.adjective && (
            <Card>
              <h2 className="mb-3 font-semibold">Forms</h2>
              <table className="w-full text-sm" lang="nl">
                <tbody className="divide-y divide-line">
                  <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">Basic</th><td>{w.lemma}</td></tr>
                  <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">With -e</th><td>{w.adjective.inflected}</td></tr>
                  {w.adjective.comparative && <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">Comparative</th><td>{w.adjective.comparative}</td></tr>}
                  {w.adjective.superlative && <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">Superlative</th><td>{w.adjective.superlative}</td></tr>}
                </tbody>
              </table>
            </Card>
          )}

          {w.examples.length > 0 && (
            <Card>
              <h2 className="mb-3 font-semibold">Examples</h2>
              <ul className="space-y-3">
                {w.examples.map((e) => (
                  <li key={e.id} className="flex items-start gap-2">
                    <SpeakButton text={e.dutch} />
                    <div>
                      <p lang="nl">{e.dutch}</p>
                      {e.english && <p className="text-sm text-muted">{e.english}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {(w.collocations.length > 0 || synonyms.length > 0 || antonyms.length > 0) && (
            <Card>
              {w.collocations.length > 0 && (
                <>
                  <h2 className="mb-2 font-semibold">Common combinations</h2>
                  <ul className="mb-4 space-y-1 text-sm">
                    {w.collocations.map((c) => (
                      <li key={c.id}><span lang="nl" className="font-medium">{c.phrase}</span> <span className="text-muted">— {c.english}</span></li>
                    ))}
                  </ul>
                </>
              )}
              {synonyms.length > 0 && <p className="text-sm"><span className="text-muted">Synonyms:</span> <span lang="nl">{synonyms.map((s) => s.text).join(", ")}</span></p>}
              {antonyms.length > 0 && <p className="mt-1 text-sm"><span className="text-muted">Opposites:</span> <span lang="nl">{antonyms.map((s) => s.text).join(", ")}</span></p>}
            </Card>
          )}

          {canEdit && <WordEditForm cardId={card.id} word={{ english: w.english, partOfSpeech: w.partOfSpeech, article: w.article, plural: w.plural, cefrLevel: w.cefrLevel, notes: w.notes, example: w.examples[0]?.dutch ?? "", exampleEnglish: w.examples[0]?.english ?? "" }} />}
        </div>

        <aside className="space-y-6">
          <Card>
            <h2 className="mb-3 flex items-center justify-between font-semibold">
              Review status <CardStateBadge state={card.state} scheduledDays={card.scheduledDays} suspended={card.suspended} />
            </h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted">Next review</dt>
              <dd>{card.state === "NEW" ? "Not studied yet" : card.due <= now ? "Due now" : `in ${formatInterval(now, card.due)}`}</dd>
              <dt className="text-muted">Reviews</dt><dd>{card._count.reviews}</dd>
              <dt className="text-muted">Correct / wrong</dt><dd>{card.correctCount} / {card.incorrectCount}</dd>
              <dt className="text-muted">Interval</dt><dd>{card.scheduledDays} day{card.scheduledDays === 1 ? "" : "s"}</dd>
              {r != null && (<><dt className="text-muted">Recall chance now</dt><dd>{Math.round(r * 100)}%</dd></>)}
              <dt className="text-muted">Added</dt><dd>{card.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</dd>
            </dl>
            {isDifficult(card) && <p className="mt-3 text-xs text-warning">This is one of your difficult words — try writing your own example sentence.</p>}
          </Card>
          {card.contextSentence && (
            <Card>
              <h2 className="mb-1 text-sm font-semibold text-muted">Where you found it</h2>
              <p lang="nl" className="italic">“{card.contextSentence}”</p>
            </Card>
          )}
          <CardControls cardId={card.id} note={card.personalNote ?? ""} importance={card.importance} suspended={card.suspended} />
        </aside>
      </div>
    </div>
  );
}
