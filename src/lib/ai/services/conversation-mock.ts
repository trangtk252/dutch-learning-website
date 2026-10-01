import type { ScenarioKey } from "../../constants";

/** Scripted, level-neutral turns used only by the offline mock provider. */

type Turn = { reply: string; newWords: { dutch: string; english: string }[] };

const OPENINGS: Partial<Record<ScenarioKey, Turn>> = {
  SUPERMARKET: { reply: "Goedemiddag! Kan ik u ergens mee helpen?", newWords: [{ dutch: "ergens mee helpen", english: "help with something" }] },
  DOCTOR: { reply: "Goedemorgen, gaat u zitten. Wat kan ik voor u doen?", newWords: [{ dutch: "gaat u zitten", english: "please sit down" }] },
  RESTAURANT: { reply: "Goedenavond, welkom! Heeft u gereserveerd?", newWords: [{ dutch: "reserveren", english: "to book, reserve" }] },
  WORK: { reply: "Hoi! Hoe was je weekend? En ben je klaar voor de vergadering van vanmiddag?", newWords: [{ dutch: "de vergadering", english: "the meeting" }] },
  APPOINTMENTS: { reply: "Goedemorgen, met de praktijk van dokter De Vries. Waarmee kan ik u helpen?", newWords: [{ dutch: "de praktijk", english: "the (medical) practice" }] },
  JOB_INTERVIEW: { reply: "Welkom! Fijn dat u er bent. Kunt u eerst iets over uzelf vertellen?", newWords: [{ dutch: "iets over uzelf vertellen", english: "tell something about yourself" }] },
  BUREAUCRACY: { reply: "Goedemorgen. U heeft een afspraak bij de gemeente. Waarvoor komt u vandaag?", newWords: [{ dutch: "de gemeente", english: "the municipality" }] },
  RENTING: { reply: "Hallo, u belt over het appartement aan de Kerkstraat, toch? Wat wilt u graag weten?", newWords: [{ dutch: "het appartement", english: "the apartment" }] },
  TRAVEL: { reply: "Hallo! Kan ik je helpen? Waar wil je naartoe?", newWords: [{ dutch: "naartoe", english: "to (a destination)" }] },
  NT2_SPEAKING: { reply: "We beginnen met de eerste vraag. Wat doet u graag in uw vrije tijd, en waarom?", newWords: [{ dutch: "de vrije tijd", english: "free time" }] },
  SMALL_TALK: { reply: "Hé buurman! Lekker weertje vandaag, hè? Heb je nog plannen voor het weekend?", newWords: [{ dutch: "lekker weertje", english: "nice weather" }] },
};

const FOLLOW_UPS = [
  { reply: "Wat interessant! Kun je daar iets meer over vertellen?", newWords: [{ dutch: "iets meer vertellen", english: "tell a bit more" }] },
  { reply: "Ik begrijp het. En hoe voel je je daarover?", newWords: [{ dutch: "zich voelen", english: "to feel" }] },
  { reply: "Goed zo. Wat ga je daarna doen?", newWords: [{ dutch: "daarna", english: "after that" }] },
  { reply: "Dat klinkt goed! Waarom vind je dat belangrijk?", newWords: [{ dutch: "belangrijk", english: "important" }] },
  { reply: "Oké, duidelijk. Heb je nog een vraag voor mij?", newWords: [{ dutch: "duidelijk", english: "clear" }] },
];

export function mockOpening(scenario: ScenarioKey): Turn {
  return OPENINGS[scenario] ?? { reply: "Hoi! Leuk je te spreken. Hoe gaat het met je vandaag?", newWords: [{ dutch: "leuk", english: "nice, fun" }] };
}

export function mockFollowUp(_scenario: ScenarioKey, turnIndex: number): Turn {
  return FOLLOW_UPS[(turnIndex - 1 + FOLLOW_UPS.length) % FOLLOW_UPS.length];
}

export function wantsEnglishHelp(text: string): boolean {
  return /\b(i don'?t understand|what does|what is|in english|help)\b|ik begrijp (het )?niet|wat betekent|wat bedoel/i.test(text);
}
