import { mc, tf, type SeedQuestion } from "./questions";

export const WRITING_PROMPTS = [
  {
    slug: "email-verhuurder-lekkage",
    title: "Email to your landlord: a leak",
    level: "A2" as const,
    taskType: "EMAIL" as const,
    register: "FORMAL" as const,
    minWords: 50,
    maxWords: 100,
    isNt2: false,
    instructions:
      "There is a leak in your bathroom ceiling. Write an email to your landlord (meneer/mevrouw De Groot). Say what the problem is, since when, and ask when someone can come to repair it. Mention when you are at home.",
  },
  {
    slug: "bericht-collega-ziek",
    title: "Message to a colleague: you're ill",
    level: "A2" as const,
    taskType: "MESSAGE" as const,
    register: "INFORMAL" as const,
    minWords: 30,
    maxWords: 70,
    isNt2: false,
    instructions:
      "You are ill and can't come to work tomorrow. Write a short message to your colleague Tim. Explain that you're ill, ask him to tell the team, and say which task he could take over for you.",
  },
  {
    slug: "klacht-webshop",
    title: "Complaint to a web shop",
    level: "B1" as const,
    taskType: "COMPLAINT" as const,
    register: "FORMAL" as const,
    minWords: 80,
    maxWords: 150,
    isNt2: true,
    instructions:
      "Two weeks ago you ordered a coffee machine online. It arrived damaged and the customer service hasn't replied to your first email. Write a formal complaint: describe what happened, what you have already done, and what you want (repair, new machine or refund).",
  },
  {
    slug: "mening-thuiswerken",
    title: "Your opinion: working from home",
    level: "B1" as const,
    taskType: "OPINION" as const,
    register: "NEUTRAL" as const,
    minWords: 100,
    maxWords: 180,
    isNt2: true,
    instructions:
      "Your local newspaper asks readers: 'Moet iedereen minstens drie dagen per week op kantoor werken?' Write a short reaction. Give your opinion, at least two arguments, and a conclusion. Use linking words (ten eerste, bovendien, daarom, kortom).",
  },
  {
    slug: "formulier-cursus",
    title: "Registration: explain your motivation",
    level: "B1" as const,
    taskType: "FORM" as const,
    register: "FORMAL" as const,
    minWords: 50,
    maxWords: 100,
    isNt2: true,
    instructions:
      "You want to sign up for a free evening course at the library ('Digitale vaardigheden'). On the registration form, explain in a few sentences why you want to take the course and what you hope to learn.",
  },
  {
    slug: "betoog-duurzaamheid",
    title: "Short essay: sustainability at work",
    level: "B2" as const,
    taskType: "ESSAY" as const,
    register: "FORMAL" as const,
    minWords: 200,
    maxWords: 300,
    isNt2: true,
    instructions:
      "Write a short essay for your company newsletter: 'Hoe kan ons bedrijf duurzamer worden?' Describe the current situation, propose at least two concrete measures with their advantages and disadvantages, and end with a recommendation.",
  },
];

/** Mock exams reuse NT2-style readings/listening and add exam-only questions per part. */
export const MOCK_EXAMS: {
  slug: string;
  title: string;
  program: "PROGRAMMA_I" | "PROGRAMMA_II";
  skill: "READING" | "LISTENING";
  level: "B1" | "B2";
  description: string;
  durationMinutes: number;
  passPercent: number;
  parts: { reading?: string; listening?: string; instructions: string; questions: SeedQuestion[] }[];
}[] = [
  {
    slug: "programma-1-lezen-oefenexamen-1",
    title: "Programma I · Reading practice exam 1",
    program: "PROGRAMMA_I",
    skill: "READING",
    level: "B1",
    description: "Two B1 texts with multiple-choice questions, modelled on the skills tested in the NT2 reading exam: main idea, details and the writer's intention. Original material — not real exam questions.",
    durationMinutes: 20,
    passPercent: 60,
    parts: [
      {
        reading: "thuiswerken-voor-en-nadelen",
        instructions: "Read the text and answer the questions.",
        questions: [
          mc("Voor wie is deze tekst vooral bedoeld?", ["Voor werkgevers die een kantoor zoeken", "Voor lezers die willen weten wat werknemers van thuiswerken vinden", "Voor mensen die een nieuwe baan zoeken"], 1, "The text presents two employees' views on working from home."),
          mc("Wat vindt Petra van haar werkdagen op kantoor?", ["Overbodig", "Belangrijk voor het contact met collega's", "Vermoeiend"], 1, "She goes to the office for contact with colleagues."),
          tf("Daan vindt online vergaderen prettig.", false, "'Online vergaderingen vind ik vermoeiend.'"),
          mc("Welke zin past het best als titel voor de laatste alinea?", ["Iedereen wil thuiswerken", "De gouden middenweg", "Kantoren gaan dicht"], 1, "Most workers prefer a combination — a middle way."),
        ],
      },
      {
        reading: "vrijwilligerswerk-in-de-bibliotheek",
        instructions: "Read the text and answer the questions.",
        questions: [
          mc("Wie kan zich aanmelden als deelnemer?", ["Alleen mensen met een taalcursus", "Iedereen die Nederlands wil oefenen", "Alleen vrijwilligers"], 1, "Participants who want to practise Dutch can sign up at the desk."),
          mc("Wat krijgen vrijwilligers vooraf?", ["Een betaling", "Een training van twee avonden", "Een boek over grammatica"], 1, "'Vooraf krijgen ze een korte training van twee avonden.'"),
          mc("Wat zou Fatima Bakker het belangrijkst vinden bij een taalmaatje?", ["Dat hij alle fouten verbetert", "Dat er ontspannen wordt gepraat", "Dat er huiswerk wordt gemaakt"], 1, "'Het gaat om luisteren, praten en samen lachen.'"),
        ],
      },
    ],
  },
  {
    slug: "programma-1-luisteren-oefenexamen-1",
    title: "Programma I · Listening practice exam 1",
    program: "PROGRAMMA_I",
    skill: "LISTENING",
    level: "B1",
    description: "Two B1 audio fragments (spoken by text-to-speech) with questions. Each fragment may be played twice. Original material — not real exam questions.",
    durationMinutes: 15,
    passPercent: 60,
    parts: [
      {
        listening: "een-sollicitatiegesprek",
        instructions: "Listen to the conversation (max. 2×) and answer the questions.",
        questions: [
          mc("Waarom solliciteert de kandidaat?", ["Hij wil meer verdienen.", "Hij werkt graag met mensen.", "Hij wil in Zeeland wonen."], 1, "'Ik werk graag met mensen…'"),
          mc("Wat moet de kandidaat in de nieuwe baan ook doen?", ["In het weekend werken", "In diensten werken, ook 's avonds", "Reizen naar andere hotels"], 1, "'Bij ons werkt u in diensten, ook 's avonds.'"),
        ],
      },
      {
        listening: "radio-fietsenstalling",
        instructions: "Listen to the radio item (max. 2×) and answer the questions.",
        questions: [
          mc("Wat is het onderwerp van het bericht?", ["Een nieuwe fietsenstalling bij het station", "Fietsendiefstal in Middenburg", "Een nieuw station"], 0, "The item is about the new underground bike parking."),
          mc("Wat gebeurt er met fietsen die buiten de rekken blijven staan?", ["Ze krijgen een boete.", "Ze worden verwijderd.", "Ze worden in de stalling gezet."], 1, "'…worden binnenkort door de gemeente verwijderd.'"),
        ],
      },
    ],
  },
  {
    slug: "programma-2-lezen-oefenexamen-1",
    title: "Programma II · Reading practice exam 1",
    program: "PROGRAMMA_II",
    skill: "READING",
    level: "B2",
    description: "A B2 news-analysis text with questions on structure, argumentation and vocabulary in context. Original material — not real exam questions.",
    durationMinutes: 15,
    passPercent: 60,
    parts: [
      {
        reading: "de-woningmarkt",
        instructions: "Read the text and answer the questions.",
        questions: [
          mc("Welke functie heeft de tweede alinea?", ["Ze beschrijft oplossingen.", "Ze noemt oorzaken van het probleem.", "Ze geeft de mening van de schrijver."], 1, "Paragraph 2 lists causes (ten eerste, ten tweede, daarnaast)."),
          mc("Wat bedoelt de schrijver met 'pleiten voor'?", ["Zich verzetten tegen", "Een voorstel steunen", "Iets onderzoeken"], 1, "'Pleiten voor' = to argue in favour of."),
          mc("Welke uitspraak past bij de tekst?", ["De woningnood is binnen een jaar opgelost.", "Er zijn meerdere oorzaken en meerdere mogelijke oplossingen.", "Alleen beleggers zijn verantwoordelijk."], 1, "Multiple causes and differing views on solutions."),
        ],
      },
    ],
  },
];

export const BLOG_CATEGORIES = [
  ["learning-dutch", "Learning Dutch", "How to learn Dutch effectively as an English speaker."],
  ["grammar", "Dutch grammar", "Clear explanations of tricky grammar points."],
  ["vocabulary", "Vocabulary", "Word lists, memory tips and useful expressions."],
  ["speaking", "Speaking", "Building confidence and fluency in conversation."],
  ["listening", "Listening", "Understanding real-life Dutch."],
  ["reading", "Reading", "Getting more out of Dutch texts."],
  ["nt2", "NT2 preparation", "Strategies for the Staatsexamen NT2."],
  ["study-strategies", "Study strategies", "Routines, motivation and spaced repetition."],
  ["culture", "Dutch culture", "The culture behind the language."],
  ["common-mistakes", "Common mistakes", "Errors English speakers make — and how to fix them."],
  ["resources", "Resources", "Recommended books, podcasts, shows and tools."],
] as const;

export const ACHIEVEMENTS = [
  ["first-word", "First word saved", "You saved your first word to your vocabulary."],
  ["words-50", "50 words", "You have 50 words in your vocabulary."],
  ["reviews-100", "100 reviews", "You completed 100 flashcard reviews."],
  ["streak-7", "One week streak", "You studied 7 days in a row."],
  ["first-conversation", "First conversation", "You finished your first speaking session."],
  ["first-writing", "First text", "You submitted your first writing task."],
  ["first-mock-exam", "Exam practice", "You completed your first NT2 practice exam."],
] as const;
