import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { getMistakeSummary } from "@/lib/server/mistakes";
import { CEFR_LEVELS, levelIndex, type Cefr } from "@/lib/constants";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { CardLink } from "@/components/ui/card";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Grammar" };

const AREA_LABEL: Record<string, string> = {
  WORD_ORDER: "Word order", ARTICLES: "Articles", NOUNS: "Nouns", PRONOUNS: "Pronouns", VERBS: "Verbs",
  MODAL_VERBS: "Modal verbs", PERFECT_TENSE: "Perfect tense", IMPERFECT_TENSE: "Imperfect tense", FUTURE: "Future",
  SEPARABLE_VERBS: "Separable verbs", SUBORDINATE_CLAUSES: "Subordinate clauses", CONJUNCTIONS: "Conjunctions",
  PREPOSITIONS: "Prepositions", ADJECTIVES: "Adjectives", RELATIVE_CLAUSES: "Relative clauses",
  PASSIVE_VOICE: "Passive voice", CONDITIONALS: "Conditional sentences",
};

export default async function GrammarPage() {
  const { user, profile } = await requireProfile();
  const [topics, best, mistakes] = await Promise.all([
    db.grammarTopic.findMany({ where: { published: true }, orderBy: [{ order: "asc" }] }),
    db.attempt.groupBy({
      by: ["grammarTopicId"],
      where: { userId: user.id, kind: "GRAMMAR", completedAt: { not: null } },
      _max: { correct: true, total: true },
    }),
    getMistakeSummary(user.id),
  ]);
  const bestById = new Map(best.map((b) => [b.grammarTopicId, b._max]));
  const weak = new Set(mistakes.filter((m) => m.recent > 0).map((m) => m.category));
  const recommended = topics.filter((t) => t.remedies.some((r) => weak.has(r)));
  const myMax = levelIndex(profile.currentLevel as Cefr) + 1;

  const byLevel = CEFR_LEVELS.map((level) => ({ level, topics: topics.filter((t) => t.level === level) })).filter((g) => g.topics.length);

  const TopicCard = ({ t }: { t: (typeof topics)[number] }) => {
    const b = bestById.get(t.id);
    const pct = b?.total ? Math.round(((b.correct ?? 0) / b.total) * 100) : null;
    return (
      <CardLink href={`/grammar/${t.slug}`} className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-1.5">
          <LevelBadge level={t.level} />
          <Badge>{AREA_LABEL[t.area]}</Badge>
          {pct != null && <Badge tone={pct >= 80 ? "success" : "warning"}>best {pct}%</Badge>}
        </div>
        <h3 className="mt-3 font-semibold">{t.title}</h3>
        <p className="mt-1 text-sm text-muted">{t.summary}</p>
      </CardLink>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Grammar library" description="Clear explanations in English with Dutch examples, common mistakes, a mini exercise and a quiz for every topic." />
      {recommended.length > 0 && (
        <section>
          <SectionTitle>Recommended for you</SectionTitle>
          <p className="-mt-2 mb-3 text-sm text-muted">Based on your recent mistakes.</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.slice(0, 3).map((t) => <li key={t.id}><TopicCard t={t} /></li>)}
          </ul>
        </section>
      )}
      {byLevel.map(({ level, topics: ts }) => (
        <section key={level}>
          <SectionTitle>
            {level} topics {levelIndex(level) > myMax && <span className="ml-2 text-sm font-normal text-muted">— ahead of your current level</span>}
          </SectionTitle>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ts.map((t) => <li key={t.id}><TopicCard t={t} /></li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}
