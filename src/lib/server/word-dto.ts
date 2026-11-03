import type { WordWithDetails } from "./vocabulary";
import { displayLemma } from "./vocabulary";

/** Compact, serialisable word info for popovers and cards (client-safe shape). */
export interface WordSummary {
  id: string;
  display: string;
  lemma: string;
  english: string;
  partOfSpeech: string;
  article: string | null;
  plural: string | null;
  ipa: string | null;
  cefrLevel: string | null;
  participle: string | null;
  example: { dutch: string; english: string } | null;
  verified: boolean;
  source: string;
}

export function toWordSummary(w: WordWithDetails): WordSummary {
  return {
    id: w.id,
    display: displayLemma(w),
    lemma: w.lemma,
    english: w.english,
    partOfSpeech: w.partOfSpeech,
    article: w.article,
    plural: w.plural,
    ipa: w.ipa,
    cefrLevel: w.cefrLevel,
    participle: w.verb ? `${w.verb.auxiliary === "ZIJN" ? "is" : w.verb.auxiliary === "HEBBEN_ZIJN" ? "heeft/is" : "heeft"} ${w.verb.pastParticiple}` : null,
    example: w.examples[0] ? { dutch: w.examples[0].dutch, english: w.examples[0].english } : null,
    verified: w.verified,
    source: w.source,
  };
}
