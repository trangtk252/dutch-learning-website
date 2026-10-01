/**
 * Client-safe constants and labels mirroring the Prisma enums.
 * Keep in sync with prisma/schema.prisma.
 */

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
export type Cefr = (typeof CEFR_LEVELS)[number];

export const CEFR_DESCRIPTIONS: Record<Cefr, string> = {
  A1: "Beginner — simple phrases about yourself",
  A2: "Elementary — everyday situations, short texts",
  B1: "Intermediate — work, study, opinions; NT2 Programma I",
  B2: "Upper-intermediate — complex texts; NT2 Programma II",
  C1: "Advanced — fluent, nuanced, academic & professional",
};

export function levelIndex(level: Cefr): number {
  return CEFR_LEVELS.indexOf(level);
}

/**
 * Levels a learner at `current` should be offered: up to one level above their
 * current level (i+1), so an A2 learner never lands in C1 material.
 */
export function visibleLevels(current: Cefr): Cefr[] {
  return CEFR_LEVELS.slice(0, Math.min(CEFR_LEVELS.length - 1, levelIndex(current) + 1) + 1);
}

export const SKILLS = ["VOCABULARY", "GRAMMAR", "SPEAKING", "LISTENING", "READING", "WRITING"] as const;
export type SkillKey = (typeof SKILLS)[number];
export const SKILL_LABELS: Record<SkillKey, string> = {
  VOCABULARY: "Vocabulary",
  GRAMMAR: "Grammar",
  SPEAKING: "Speaking",
  LISTENING: "Listening",
  READING: "Reading",
  WRITING: "Writing",
};

export const PARTS_OF_SPEECH = [
  "NOUN", "VERB", "ADJECTIVE", "ADVERB", "PREPOSITION", "CONJUNCTION",
  "PRONOUN", "ARTICLE", "NUMERAL", "INTERJECTION", "PHRASE", "OTHER",
] as const;
export type Pos = (typeof PARTS_OF_SPEECH)[number];
export const POS_LABELS: Record<Pos, string> = {
  NOUN: "noun", VERB: "verb", ADJECTIVE: "adjective", ADVERB: "adverb",
  PREPOSITION: "preposition", CONJUNCTION: "conjunction", PRONOUN: "pronoun",
  ARTICLE: "article", NUMERAL: "numeral", INTERJECTION: "interjection",
  PHRASE: "phrase", OTHER: "other",
};

export const ERROR_CATEGORIES = [
  "WORD_ORDER", "VERB_CONJUGATION", "SEPARABLE_VERBS", "ARTICLES", "DE_HET",
  "PREPOSITIONS", "PERFECT_TENSE", "PAST_TENSE", "ADJECTIVE_ENDINGS", "MODAL_VERBS",
  "SUBORDINATE_CLAUSES", "RELATIVE_CLAUSES", "PRONOUNS", "PLURALS", "NEGATION",
  "VOCABULARY_CHOICE", "SPELLING", "REGISTER", "PRONUNCIATION", "OTHER",
] as const;
export type ErrorCategoryKey = (typeof ERROR_CATEGORIES)[number];
export const ERROR_CATEGORY_LABELS: Record<ErrorCategoryKey, string> = {
  WORD_ORDER: "Word order",
  VERB_CONJUGATION: "Verb conjugation",
  SEPARABLE_VERBS: "Separable verbs",
  ARTICLES: "Articles",
  DE_HET: "de / het",
  PREPOSITIONS: "Prepositions",
  PERFECT_TENSE: "Perfect tense",
  PAST_TENSE: "Past tense (imperfectum)",
  ADJECTIVE_ENDINGS: "Adjective endings",
  MODAL_VERBS: "Modal verbs",
  SUBORDINATE_CLAUSES: "Word order in subordinate clauses",
  RELATIVE_CLAUSES: "Relative clauses",
  PRONOUNS: "Pronouns",
  PLURALS: "Plurals",
  NEGATION: "Negation (niet / geen)",
  VOCABULARY_CHOICE: "Vocabulary choice",
  SPELLING: "Spelling",
  REGISTER: "Register (formal / informal)",
  PRONUNCIATION: "Pronunciation",
  OTHER: "Other",
};

export const SCENARIOS = [
  "CASUAL", "SUPERMARKET", "WORK", "DOCTOR", "RESTAURANT", "APPOINTMENTS", "SMALL_TALK",
  "JOB_INTERVIEW", "BUREAUCRACY", "RENTING", "TRAVEL", "NT2_SPEAKING", "FREE",
] as const;
export type ScenarioKey = (typeof SCENARIOS)[number];
export const SCENARIO_INFO: Record<ScenarioKey, { label: string; dutch: string; setup: string }> = {
  CASUAL: { label: "Casual conversation", dutch: "Gewoon kletsen", setup: "a friendly chat between acquaintances about everyday life" },
  SUPERMARKET: { label: "At the supermarket", dutch: "In de supermarkt", setup: "the learner is a customer in a Dutch supermarket; you are an employee" },
  WORK: { label: "At work", dutch: "Op het werk", setup: "the learner and you are colleagues at a Dutch office; talk about tasks, meetings and planning" },
  DOCTOR: { label: "At the doctor", dutch: "Bij de huisarts", setup: "you are a Dutch GP (huisarts); the learner is a patient describing symptoms" },
  RESTAURANT: { label: "At a restaurant", dutch: "In het restaurant", setup: "you are a waiter; the learner orders food and drinks and pays" },
  APPOINTMENTS: { label: "Making appointments", dutch: "Een afspraak maken", setup: "the learner phones to make, move or cancel an appointment; you are the receptionist" },
  SMALL_TALK: { label: "Small talk", dutch: "Small talk", setup: "light small talk with a neighbour about the weather, weekend and plans" },
  JOB_INTERVIEW: { label: "Job interview", dutch: "Sollicitatiegesprek", setup: "you interview the learner for a job; ask about experience, motivation and strengths" },
  BUREAUCRACY: { label: "Dutch bureaucracy", dutch: "Bij de gemeente", setup: "you are a municipal (gemeente) employee; the learner registers an address or asks about a permit or DigiD" },
  RENTING: { label: "Renting an apartment", dutch: "Een woning huren", setup: "you are a landlord or rental agent; the learner asks about an apartment, rent, deposit and viewing" },
  TRAVEL: { label: "Travel", dutch: "Op reis", setup: "the learner is travelling by train or asking for directions; you are a helpful local or NS employee" },
  NT2_SPEAKING: { label: "NT2 speaking practice", dutch: "Staatsexamen spreken", setup: "NT2-style speaking practice: ask one exam-style question at a time (give opinions, describe situations, give advice, explain advantages and disadvantages) and wait for the answer" },
  FREE: { label: "Free conversation", dutch: "Vrij gesprek", setup: "open conversation about any topic the learner brings up" },
};

export const READING_GENRE_LABELS = {
  STORY: "Short story", NEWS: "News-style", EVERYDAY: "Everyday situation", EMAIL: "Email",
  WORKPLACE: "Workplace", CULTURE: "Dutch culture", OPINION: "Opinion", FORMAL: "Formal text",
} as const;

export const NT2_PROGRAM_LABELS = {
  NONE: "Not preparing for NT2",
  PROGRAMMA_I: "NT2 Programma I (B1)",
  PROGRAMMA_II: "NT2 Programma II (B2)",
} as const;

/** Cookie mirroring the profile's font-scale setting so the root layout can apply it. */
export const FONT_SCALE_COOKIE = "font-scale";
