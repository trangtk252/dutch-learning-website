import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { POS_LABELS } from "@/lib/constants";
import { displayLemma, wordInclude } from "@/lib/server/vocabulary";
import { getVerbPrincipalParts } from "@/lib/server/dictionary-db";
import { formatInterval, retrievability, isDifficult } from "@/lib/srs/fsrs";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SpeakButton } from "@/components/voice/speak-button";
import { CardStateBadge } from "../card-state";
import { CardControls } from "./card-controls";
import { WordEditForm } from "./word-edit-form";
import { getT, getLocale, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Word");

const AUX = { HEBBEN: "hebben", ZIJN: "zijn", HEBBEN_ZIJN: "hebben / zijn" };

export default async function WordPage({ params, searchParams }: PageProps<"/vocabulary/[id]">) {
  const { user } = await requireProfile();
  const t = await getT();
  const locale = await getLocale();
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
  // Verbs without a full conjugation table get their past tense and participle from the dictionary.
  const verbParts = w.partOfSpeech === "VERB" && !w.verb ? getVerbPrincipalParts(w.lemma) : null;
  const needsReview =!w.verified && (w.source === "AI" || w.english.startsWith("(meaning unavailable"));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/vocabulary" className="text-sm text-primary-strong hover:underline">{t("← All words")}</Link>

      {added === "1" && (
        <p role="status" className="rounded-xl bg-success-soft px-4 py-2 text-sm text-success">
          {t("Saved to your vocabulary. It will appear in your next review session.")}
        </p>
      )}
      {needsReview && (
        <p role="note" className="rounded-xl bg-warning-soft px-4 py-2 text-sm text-warning">
          {w.english.startsWith("(")
            ? t("This entry was generated automatically in offline mode and is incomplete. Check it against a dictionary")
            : t("This entry was generated automatically. Check it against a dictionary")}
          {canEdit ? t(" and edit it below if needed.") : "."}
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
            <span>{t(POS_LABELS[w.partOfSpeech])}</span>
            {w.ipa && <span lang="nl">/{w.ipa}/</span>}
            <LevelBadge level={w.cefrLevel} />
            <Badge tone={w.verified ? "success" : "neutral"}>
              {w.verified ? t("Curated") : w.source === "AI" ? t("AI-generated") : w.source === "IMPORTED" ? t("Imported") : t("Unverified")}
            </Badge>
            {w.topics.map((tp) => (
              <Link key={tp.topicId} href={`/vocabulary?topic=${tp.topic.slug}`} className="rounded-full bg-surface-2 px-2 py-0.5 text-xs hover:text-ink">
                {tp.topic.name}
              </Link>
            ))}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {w.notes && (
            <Card>
              <h2 className="mb-1 text-sm font-semibold text-muted">{t("Usage note")}</h2>
              <p>{w.notes}</p>
            </Card>
          )}

          {(w.partOfSpeech === "NOUN" && (w.plural || w.diminutive)) && (
            <Card>
              <h2 className="mb-3 font-semibold">{t("Forms")}</h2>
              <table className="w-full text-sm" lang="nl">
                <tbody className="divide-y divide-line">
                  <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">{t("Singular")}</th><td>{displayLemma(w)}</td></tr>
                  {w.plural && <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">{t("Plural")}</th><td>de {w.plural}</td></tr>}
                  {w.diminutive && <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">{t("Diminutive")}</th><td>het {w.diminutive}</td></tr>}
                </tbody>
              </table>
            </Card>
          )}

          {verbParts && (
            <Card>
              <h2 className="mb-3 font-semibold">{t("Forms")}</h2>
              <table className="w-full text-sm" lang="nl">
                <tbody className="divide-y divide-line">
                  <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">{t("Infinitive")}</th><td className="font-medium">{w.lemma}</td></tr>
                  <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">{t("Past tense (sg.)")}</th><td className="font-medium">{verbParts.pastSingular}</td></tr>
                  <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">{t("Past tense (pl.)")}</th><td className="font-medium">{verbParts.pastPlural}</td></tr>
                  <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">{t("Past participle (PII)")}</th><td className="font-medium">{verbParts.pastParticiple}</td></tr>
                </tbody>
              </table>
            </Card>
          )}

          {w.verb && (
            <Card>
              <h2 className="mb-3 flex flex-wrap items-center gap-2 font-semibold">
                {t("Conjugation")}
                {w.verb.irregular && <Badge tone="warning">{t("irregular")}</Badge>}
                {w.verb.separable && <Badge tone="primary">{t("separable ({prefix}-)", { prefix: w.verb.separablePrefix ?? "" })}</Badge>}
                {w.verb.reflexive && <Badge>{t("reflexive")}</Badge>}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2" lang="nl">
                <table className="text-sm">
                  <caption className="mb-1 text-left text-xs font-medium text-muted">{t("Present")}</caption>
                  <tbody>
                    {[["ik", w.verb.presentIk], ["jij / u", w.verb.presentJij], ["hij / zij", w.verb.presentHij], ["wij / jullie / zij", w.verb.presentWij]].map(([p, f]) => (
                      <tr key={p}><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">{p}</th><td className="font-medium">{f}</td></tr>
                    ))}
                  </tbody>
                </table>
                <table className="text-sm">
                  <caption className="mb-1 text-left text-xs font-medium text-muted">{t("Past")}</caption>
                  <tbody>
                    <tr><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">{t("imperfect (sg.)")}</th><td className="font-medium">{w.verb.pastSingular}</td></tr>
                    <tr><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">{t("imperfect (pl.)")}</th><td className="font-medium">{w.verb.pastPlural}</td></tr>
                    <tr><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">{t("participle")}</th><td className="font-medium">{w.verb.pastParticiple}</td></tr>
                    <tr><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">{t("perfect")}</th><td className="font-medium">ik {w.verb.auxiliary === "ZIJN" ? "ben" : "heb"} {w.verb.pastParticiple}</td></tr>
                    <tr><th scope="row" className="py-1 pr-4 text-left font-normal text-muted">{t("auxiliary")}</th><td>{AUX[w.verb.auxiliary]}</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {w.adjective && (
            <Card>
              <h2 className="mb-3 font-semibold">{t("Forms")}</h2>
              <table className="w-full text-sm" lang="nl">
                <tbody className="divide-y divide-line">
                  <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">{t("Basic")}</th><td>{w.lemma}</td></tr>
                  <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">{t("With -e")}</th><td>{w.adjective.inflected}</td></tr>
                  {w.adjective.comparative && <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">{t("Comparative")}</th><td>{w.adjective.comparative}</td></tr>}
                  {w.adjective.superlative && <tr><th scope="row" className="py-1.5 pr-4 text-left font-normal text-muted">{t("Superlative")}</th><td>{w.adjective.superlative}</td></tr>}
                </tbody>
              </table>
            </Card>
          )}

          {w.examples.length > 0 && (
            <Card>
              <h2 className="mb-3 font-semibold">{t("Examples")}</h2>
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
                  <h2 className="mb-2 font-semibold">{t("Common combinations")}</h2>
                  <ul className="mb-4 space-y-1 text-sm">
                    {w.collocations.map((c) => (
                      <li key={c.id}><span lang="nl" className="font-medium">{c.phrase}</span> <span className="text-muted">— {c.english}</span></li>
                    ))}
                  </ul>
                </>
              )}
              {synonyms.length > 0 && <p className="text-sm"><span className="text-muted">{t("Synonyms:")}</span> <span lang="nl">{synonyms.map((s) => s.text).join(", ")}</span></p>}
              {antonyms.length > 0 && <p className="mt-1 text-sm"><span className="text-muted">{t("Opposites:")}</span> <span lang="nl">{antonyms.map((s) => s.text).join(", ")}</span></p>}
            </Card>
          )}

          {canEdit && <WordEditForm cardId={card.id} word={{ english: w.english, partOfSpeech: w.partOfSpeech, article: w.article, plural: w.plural, cefrLevel: w.cefrLevel, notes: w.notes, example: w.examples[0]?.dutch ?? "", exampleEnglish: w.examples[0]?.english ?? "" }} />}
        </div>

        <aside className="space-y-6">
          <Card>
            <h2 className="mb-3 flex items-center justify-between font-semibold">
              {t("Review status")} <CardStateBadge state={card.state} scheduledDays={card.scheduledDays} suspended={card.suspended} />
            </h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted">{t("Next review")}</dt>
              <dd>{card.state === "NEW" ? t("Not studied yet") : card.due <= now ? t("Due now") : t("in {when}", { when: formatInterval(now, card.due) })}</dd>
              <dt className="text-muted">{t("Reviews")}</dt><dd>{card._count.reviews}</dd>
              <dt className="text-muted">{t("Correct / wrong")}</dt><dd>{card.correctCount} / {card.incorrectCount}</dd>
              <dt className="text-muted">{t("Interval")}</dt><dd>{t(card.scheduledDays === 1 ? "{n} day" : "{n} days", { n: card.scheduledDays })}</dd>
              {r != null && (<><dt className="text-muted">{t("Recall chance now")}</dt><dd>{Math.round(r * 100)}%</dd></>)}
              <dt className="text-muted">{t("Added")}</dt><dd>{card.createdAt.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</dd>
            </dl>
            {isDifficult(card) && <p className="mt-3 text-xs text-warning">{t("This is one of your difficult words — try writing your own example sentence.")}</p>}
          </Card>
          {card.contextSentence && (
            <Card>
              <h2 className="mb-1 text-sm font-semibold text-muted">{t("Where you found it")}</h2>
              <p lang="nl" className="italic">“{card.contextSentence}”</p>
            </Card>
          )}
          <CardControls cardId={card.id} note={card.personalNote ?? ""} importance={card.importance} suspended={card.suspended} />
        </aside>
      </div>
    </div>
  );
}
