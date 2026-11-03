/**
 * Curated external media. We only link to legitimate sources and never host or
 * redistribute audio/video. Streaming availability changes over time, so film
 * and series entries link to a JustWatch search (a legal availability guide)
 * in addition to any official broadcaster page.
 */

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export interface SeedPodcast {
  slug: string;
  title: string;
  publisher: string;
  description: string;
  url: string;
  levelMin: Level;
  levelMax: Level;
  topics: string[];
  hasTranscripts: boolean;
  learningTips: string;
}

export const PODCASTS: SeedPodcast[] = [
  {
    slug: "nos-jeugdjournaal",
    title: "NOS Jeugdjournaal",
    publisher: "NOS",
    description: "The daily children's news programme of the Dutch public broadcaster. Clear, slow-ish speech, short items and simple explanations of current events.",
    url: "https://nos.nl/jeugdjournaal",
    levelMin: "A2",
    levelMax: "B1",
    topics: ["news", "society"],
    hasTranscripts: false,
    learningTips: "Watch the same item twice: first for the main idea, then with Dutch subtitles (via NPO Start, where available) for details. Write down three new words per item.",
  },
  {
    slug: "easy-dutch",
    title: "Easy Dutch (YouTube)",
    publisher: "Easy Languages",
    description: "Street interviews with Dutch speakers about everyday topics, with Dutch and English subtitles on screen.",
    url: "https://www.youtube.com/results?search_query=Easy+Dutch+Easy+Languages",
    levelMin: "A2",
    levelMax: "B2",
    topics: ["everyday", "culture"],
    hasTranscripts: true,
    learningTips: "Great for hearing real, spontaneous speech with regional accents. Pause after each answer and repeat it out loud (shadowing).",
  },
  {
    slug: "het-klokhuis",
    title: "Het Klokhuis",
    publisher: "NTR / NPO",
    description: "Educational programme for children (and curious adults) that explains how things work — from cheese making to the Dutch parliament.",
    url: "https://www.hetklokhuis.nl",
    levelMin: "B1",
    levelMax: "B2",
    topics: ["science", "society", "culture"],
    hasTranscripts: false,
    learningTips: "Pick episodes on topics you already know in English; your background knowledge will help you follow faster speech.",
  },
  {
    slug: "nos-journaal",
    title: "NOS Journaal",
    publisher: "NOS",
    description: "The main Dutch TV news. Formal register and a fast pace — good preparation for NT2 Programma II listening.",
    url: "https://nos.nl",
    levelMin: "B2",
    levelMax: "C1",
    topics: ["news", "politics", "society"],
    hasTranscripts: false,
    learningTips: "Read the matching article on nos.nl first, then watch the item. Notice the passive voice and formal linking words.",
  },
  {
    slug: "npo-radio-1-podcasts",
    title: "NPO Radio 1 podcasts (e.g. De Dag)",
    publisher: "NPO Radio 1 / NOS",
    description: "News and background podcasts in natural, fluent Dutch. 'De Dag' covers one news story in depth in about 15–20 minutes.",
    url: "https://www.nporadio1.nl/podcasts",
    levelMin: "B2",
    levelMax: "C1",
    topics: ["news", "society", "politics"],
    hasTranscripts: false,
    learningTips: "Listen at 0.9× speed at first. Summarise the episode in three Dutch sentences afterwards — excellent NT2 speaking practice.",
  },
];

export interface SeedMedia {
  slug: string;
  title: string;
  kind: "FILM" | "SERIES" | "YOUTUBE" | "NEWS" | "KIDS" | "DOCUMENTARY";
  genre: string;
  levelMin: Level;
  levelMax: Level;
  vocabDifficulty: number;
  description: string;
  dutchSubtitles: boolean;
  englishSubtitles: boolean;
  learningTips: string;
  providers: { name: string; url: string; access?: string }[];
}

const justWatch = (title: string) => ({
  name: "Check availability (JustWatch NL)",
  url: `https://www.justwatch.com/nl/zoeken?q=${encodeURIComponent(title)}`,
  access: "Varies",
});

export const MEDIA: SeedMedia[] = [
  {
    slug: "jeugdjournaal-video",
    title: "NOS Jeugdjournaal",
    kind: "NEWS",
    genre: "News for young people",
    levelMin: "A2",
    levelMax: "B1",
    vocabDifficulty: 2,
    description: "Ten-minute daily news bulletin explained for children.",
    dutchSubtitles: true,
    englishSubtitles: false,
    learningTips: "Ideal first step into authentic Dutch. Use Dutch subtitles (teletekst/ondertiteling) where available.",
    providers: [{ name: "NOS", url: "https://nos.nl/jeugdjournaal", access: "Free" }],
  },
  {
    slug: "flikken-maastricht",
    title: "Flikken Maastricht",
    kind: "SERIES",
    genre: "Police drama",
    levelMin: "B1",
    levelMax: "B2",
    vocabDifficulty: 3,
    description: "Long-running police series set in Maastricht. Clear dialogue, everyday situations and recurring vocabulary — plus a hint of a southern accent.",
    dutchSubtitles: true,
    englishSubtitles: false,
    learningTips: "Episodes follow a predictable structure, which makes it easier to guess meaning from context. Note phrases used in interviews and interrogations.",
    providers: [justWatch("Flikken Maastricht")],
  },
  {
    slug: "undercover",
    title: "Undercover",
    kind: "SERIES",
    genre: "Crime thriller",
    levelMin: "B2",
    levelMax: "C1",
    vocabDifficulty: 4,
    description: "Belgian-Dutch crime series about an undercover operation. Mix of Flemish and Netherlands Dutch — great for getting used to both.",
    dutchSubtitles: true,
    englishSubtitles: true,
    learningTips: "Switch from English to Dutch subtitles once you know the characters. Listen for differences between Flemish and Netherlands Dutch.",
    providers: [justWatch("Undercover")],
  },
  {
    slug: "alles-is-liefde",
    title: "Alles is Liefde",
    kind: "FILM",
    genre: "Romantic comedy",
    levelMin: "B1",
    levelMax: "B2",
    vocabDifficulty: 3,
    description: "Ensemble romantic comedy set around Sinterklaas. Everyday conversations and lots of Dutch culture.",
    dutchSubtitles: true,
    englishSubtitles: true,
    learningTips: "Great for learning informal expressions and Sinterklaas vocabulary. Watch in two sittings and summarise each half.",
    providers: [justWatch("Alles is Liefde")],
  },
  {
    slug: "zwartboek",
    title: "Zwartboek (Black Book)",
    kind: "FILM",
    genre: "War drama",
    levelMin: "B2",
    levelMax: "C1",
    vocabDifficulty: 4,
    description: "Paul Verhoeven's drama set in the occupied Netherlands during the Second World War. Includes some German and English.",
    dutchSubtitles: true,
    englishSubtitles: true,
    learningTips: "Read a short Dutch summary of the historical background first. Useful for NT2 topics such as history and society.",
    providers: [justWatch("Zwartboek")],
  },
  {
    slug: "het-klokhuis-video",
    title: "Het Klokhuis",
    kind: "KIDS",
    genre: "Educational",
    levelMin: "B1",
    levelMax: "B2",
    vocabDifficulty: 2,
    description: "Short educational episodes on science, culture and society.",
    dutchSubtitles: true,
    englishSubtitles: false,
    learningTips: "Each episode focuses on one topic — perfect for building topic vocabulary.",
    providers: [{ name: "Het Klokhuis", url: "https://www.hetklokhuis.nl", access: "Free" }],
  },
];
