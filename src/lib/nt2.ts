/**
 * NT2 Staatsexamen structure used to organise the four skills.
 * Programma I ≈ B1, Programma II ≈ B2; A2 is "Voorbereiding" (the step before).
 * Section names are modelled on the exam's task types — they are practice
 * categories, not the official exam parts.
 */
import type { CefrLevel, ListeningKind, ReadingGenre, WritingTaskType } from "@prisma/client";

export const NT2_TRACKS = ["VOORBEREIDING", "PROGRAMMA_I", "PROGRAMMA_II"] as const;
export type Nt2Track = (typeof NT2_TRACKS)[number];

export const NT2_TRACK_INFO: Record<Nt2Track, { label: string; short: string; levels: CefrLevel[]; blurb: string }> = {
  VOORBEREIDING: { label: "Voorbereiding (A2)", short: "A2", levels: ["A1", "A2"], blurb: "Build the basics before Programma I." },
  PROGRAMMA_I: { label: "Programma I (B1)", short: "B1", levels: ["B1"], blurb: "Staatsexamen NT2 Programma I: everyday and work situations." },
  PROGRAMMA_II: { label: "Programma II (B2)", short: "B2", levels: ["B2", "C1"], blurb: "Staatsexamen NT2 Programma II: study and professional situations." },
};

export const NT2_SKILLS = ["LEZEN", "LUISTEREN", "SCHRIJVEN", "SPREKEN"] as const;
export type Nt2Skill = (typeof NT2_SKILLS)[number];

export function isNt2Track(v: unknown): v is Nt2Track {
  return typeof v === "string" && (NT2_TRACKS as readonly string[]).includes(v);
}

/** The track a learner starts on: their NT2 programme if set, otherwise from their level. */
export function defaultTrack(profile: { preparingNt2: boolean; nt2Program: string; currentLevel: string }): Nt2Track {
  if (profile.preparingNt2 && profile.nt2Program === "PROGRAMMA_II") return "PROGRAMMA_II";
  if (profile.preparingNt2 && profile.nt2Program === "PROGRAMMA_I") return "PROGRAMMA_I";
  if (profile.currentLevel === "A1" || profile.currentLevel === "A2") return "VOORBEREIDING";
  return profile.currentLevel === "B1" ? "PROGRAMMA_I" : "PROGRAMMA_II";
}

export function trackForLevel(level: string): Nt2Track {
  if (level === "A1" || level === "A2") return "VOORBEREIDING";
  return level === "B1" ? "PROGRAMMA_I" : "PROGRAMMA_II";
}

/** A section: a named group of the underlying genres / kinds / task types. */
export interface Nt2Section<T extends string> {
  key: string;
  label: string;
  hint: string;
  members: T[];
}

export const READING_SECTIONS: Nt2Section<ReadingGenre>[] = [
  { key: "dagelijks", label: "Dagelijks leven", hint: "Notices, stories and everyday situations", members: ["EVERYDAY", "STORY"] },
  { key: "werk", label: "Werk & opleiding", hint: "Workplace and study texts", members: ["WORKPLACE"] },
  { key: "brieven", label: "Brieven & formele teksten", hint: "Emails, letters and official texts", members: ["EMAIL", "FORMAL"] },
  { key: "nieuws", label: "Nieuws & opinie", hint: "News, culture and opinion pieces", members: ["NEWS", "CULTURE", "OPINION"] },
];

export const LISTENING_SECTIONS: Nt2Section<ListeningKind>[] = [
  { key: "kort", label: "Korte fragmenten", hint: "Announcements and short messages", members: ["SHORT", "ANNOUNCEMENT"] },
  { key: "gesprekken", label: "Gesprekken", hint: "Dialogues between two people", members: ["DIALOGUE"] },
  { key: "lang", label: "Lange fragmenten", hint: "Monologues, talks and exam-length items", members: ["MONOLOGUE", "NT2"] },
];

export const WRITING_SECTIONS: Nt2Section<WritingTaskType>[] = [
  { key: "kort", label: "Korte berichten", hint: "Messages and forms", members: ["MESSAGE", "FORM"] },
  { key: "brieven", label: "E-mails & brieven", hint: "Emails and complaints", members: ["EMAIL", "COMPLAINT"] },
  { key: "mening", label: "Mening & betoog", hint: "Opinions and essays", members: ["OPINION", "ESSAY"] },
];

/** Speaking (Spreken) task types practised with the tutor. */
export const SPEAKING_TASKS = [
  { key: "beschrijven", label: "Beschrijven", hint: "Describe a situation, place or experience", prompt: "ask the learner to describe a situation, person, place or experience in detail (what, where, when, how it felt)" },
  { key: "mening", label: "Mening geven", hint: "Give and defend an opinion", prompt: "ask for the learner's opinion on an everyday or social topic, then ask them to justify it and respond to a counter-argument" },
  { key: "situatie", label: "Reageren in een situatie", hint: "Role-play a practical situation", prompt: "set up a practical situation (a complaint, a request, a problem at work, an appointment) and have the learner react appropriately in the right register" },
  { key: "advies", label: "Advies & voor- en nadelen", hint: "Give advice, weigh pros and cons", prompt: "present a problem or choice and ask the learner to give advice and explain the advantages and disadvantages of the options" },
] as const;
export type SpeakingTaskKey = (typeof SPEAKING_TASKS)[number]["key"];

/** NT2 speaking conversations are titled "<track> · <task>"; recover the task from the title. */
export function speakingTaskFromTitle(title: string) {
  return SPEAKING_TASKS.find((t) => title.endsWith(` · ${t.label}`));
}

export function sectionFor<T extends string>(sections: Nt2Section<T>[], member: T) {
  return sections.find((s) => s.members.includes(member));
}

export function membersOf<T extends string>(sections: Nt2Section<T>[], key: string | undefined): T[] | undefined {
  return sections.find((s) => s.key === key)?.members;
}
