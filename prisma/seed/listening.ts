import { dictation, heard, mc, tf, fill, type SeedQuestion } from "./questions";

export interface SeedListening {
  slug: string;
  title: string;
  level: "A2" | "B1" | "B2";
  kind: "SHORT" | "DIALOGUE" | "ANNOUNCEMENT" | "MONOLOGUE" | "NT2";
  topic: string;
  description: string;
  isNt2?: boolean;
  /** Segments are voiced by text-to-speech; speakers get different voices where available. */
  segments: [speaker: string | null, text: string][];
  words: string[];
  questions: SeedQuestion[];
}

/** Original scripts. Durations are computed from text length at seed time. */
export const LISTENING: SeedListening[] = [
  {
    slug: "op-het-station",
    title: "Op het station",
    level: "A2",
    kind: "ANNOUNCEMENT",
    topic: "travel",
    description: "A station announcement about a delayed train and a platform change.",
    words: ["de trein", "de vertraging", "overstappen", "het station"],
    segments: [
      [null, "Goedemiddag reizigers. De intercity naar Den Haag Centraal van veertien uur zeven heeft ongeveer tien minuten vertraging."],
      [null, "Deze trein vertrekt vandaag niet van spoor vijf, maar van spoor acht."],
      [null, "Reizigers naar Leiden kunnen ook de sprinter van veertien uur twaalf nemen en in Schiphol overstappen."],
      [null, "Onze excuses voor het ongemak."],
    ],
    questions: [
      mc("Hoeveel vertraging heeft de trein naar Den Haag?", ["Vijf minuten", "Tien minuten", "Twaalf minuten"], 1, "'…ongeveer tien minuten vertraging.'", { focus: "DETAIL" }),
      mc("Van welk spoor vertrekt de trein?", ["Spoor 5", "Spoor 7", "Spoor 8"], 2, "'…niet van spoor vijf, maar van spoor acht.'", { focus: "DETAIL" }),
      tf("Reizigers naar Leiden moeten in Schiphol overstappen als ze de sprinter nemen.", true, "'…de sprinter … nemen en in Schiphol overstappen.'", { focus: "DETAIL" }),
      heard(["spoor acht", "spoor vijf", "spoor zes"], 0, "The new platform is 'spoor acht'."),
    ],
  },
  {
    slug: "in-de-bakkerij",
    title: "In de bakkerij",
    level: "A2",
    kind: "DIALOGUE",
    topic: "shopping",
    description: "A short conversation at the bakery: ordering bread and paying.",
    words: ["pinnen", "betalen", "lekker"],
    segments: [
      ["Verkoper", "Goedemorgen, wie mag ik helpen?"],
      ["Klant", "Goedemorgen. Ik wil graag een volkoren brood, gesneden alstublieft."],
      ["Verkoper", "Een heel of een half brood?"],
      ["Klant", "Een half. En vier krentenbollen."],
      ["Verkoper", "Anders nog iets?"],
      ["Klant", "Nee, dat was het. Kan ik pinnen?"],
      ["Verkoper", "Natuurlijk. Dat is dan zes euro veertig."],
      ["Klant", "Alstublieft. Dank u wel, fijne dag!"],
    ],
    questions: [
      mc("Wat koopt de klant?", ["Een heel wit brood", "Een half volkoren brood en vier krentenbollen", "Vier volkoren broden"], 1, "Half a wholemeal loaf and four currant buns.", { focus: "MAIN_IDEA" }),
      mc("Hoeveel moet de klant betalen?", ["€ 4,60", "€ 6,40", "€ 6,14"], 1, "'…zes euro veertig.'", { focus: "DETAIL" }),
      tf("De klant betaalt contant.", false, "'Kan ik pinnen?' — 'Natuurlijk.'", { focus: "DETAIL" }),
      fill("Anders nog ___?", ["iets"], "'Anders nog iets?' = Anything else?", { focus: "VOCABULARY" }),
    ],
  },
  {
    slug: "voicemail-van-de-tandarts",
    title: "Een voicemail van de tandarts",
    level: "A2",
    kind: "SHORT",
    topic: "health",
    description: "A voicemail message about moving an appointment.",
    words: ["de afspraak", "opbellen"],
    segments: [
      ["Assistente", "Goedemiddag, u spreekt met Marloes van tandartspraktijk Het Zonnetje. Ik bel over uw afspraak van donderdag om negen uur."],
      ["Assistente", "Helaas is de tandarts die dag ziek. Kunt u in plaats daarvan op maandag om half vier komen?"],
      ["Assistente", "Wilt u ons even terugbellen om dit te bevestigen? Ons nummer is nul-tien, twee-drie-vier, vijf-zes-zeven-acht. Dank u wel en tot ziens."],
    ],
    questions: [
      mc("Waarom belt de tandartspraktijk?", ["Om een nieuwe patiënt te verwelkomen", "Om een afspraak te verzetten", "Om een rekening te sturen"], 1, "The dentist is ill, so the appointment must move.", { focus: "MAIN_IDEA" }),
      mc("Wat is de nieuwe afspraak?", ["Donderdag om 9.00", "Maandag om 15.30", "Maandag om 13.30"], 1, "'half vier' = 15:30.", { focus: "DETAIL" }),
      dictation("Kunt u op maandag om half vier komen?"),
    ],
  },
  {
    slug: "een-sollicitatiegesprek",
    title: "Een sollicitatiegesprek",
    level: "B1",
    kind: "DIALOGUE",
    topic: "work",
    description: "Part of a job interview for a job at a hotel reception.",
    isNt2: true,
    words: ["solliciteren", "de ervaring", "verantwoordelijk", "de collega"],
    segments: [
      ["Manager", "Fijn dat u er bent. Vertel eens, waarom heeft u gesolliciteerd naar deze functie?"],
      ["Kandidaat", "Ik werk graag met mensen en ik vind het leuk om gasten te helpen. Ik heb twee jaar ervaring aan de receptie van een camping in Zeeland."],
      ["Manager", "Wat deed u daar precies?"],
      ["Kandidaat", "Ik was verantwoordelijk voor het inchecken van gasten en het beantwoorden van e-mails. In het hoogseizoen werkte ik ook in het weekend."],
      ["Manager", "Hoe gaat u om met een gast die boos is?"],
      ["Kandidaat", "Ik luister eerst rustig naar het probleem. Daarna probeer ik samen met de gast een oplossing te vinden. Als ik het zelf niet kan oplossen, vraag ik een collega om hulp."],
      ["Manager", "Dat klinkt goed. Bij ons werkt u in diensten, ook 's avonds. Is dat een probleem?"],
      ["Kandidaat", "Nee, dat is geen probleem. Ik heb geen kinderen en ik woon vlakbij."],
    ],
    questions: [
      mc("Waar heeft de kandidaat eerder gewerkt?", ["In een hotel in Zeeland", "Bij de receptie van een camping", "In een restaurant"], 1, "'…aan de receptie van een camping in Zeeland.'", { focus: "DETAIL" }),
      mc("Wat doet de kandidaat als een gast boos is?", ["Hij roept meteen de manager.", "Hij luistert eerst rustig en zoekt een oplossing.", "Hij geeft de gast korting."], 1, "He listens calmly and looks for a solution together.", { focus: "DETAIL" }),
      tf("Werken in de avond is voor de kandidaat een probleem.", false, "'Nee, dat is geen probleem.'", { focus: "DETAIL" }),
      mc("Waarom kan de kandidaat makkelijk 's avonds werken?", ["Hij woont dichtbij en heeft geen kinderen.", "Hij heeft een auto.", "Hij werkt overdag ergens anders."], 0, "'Ik heb geen kinderen en ik woon vlakbij.'", { focus: "INFERENCE" }),
    ],
  },
  {
    slug: "radio-fietsenstalling",
    title: "Radiobericht: nieuwe fietsenstalling",
    level: "B1",
    kind: "MONOLOGUE",
    topic: "travel",
    description: "A short local radio news item about a new underground bicycle parking.",
    isNt2: true,
    words: ["de fiets", "het station", "de gemeente"],
    segments: [
      ["Nieuwslezer", "Bij het station van Middenburg is vandaag een nieuwe ondergrondse fietsenstalling geopend. Er is plaats voor ruim vijfduizend fietsen."],
      ["Nieuwslezer", "De eerste vierentwintig uur parkeren is gratis. Daarna betalen fietsers vijfenzeventig cent per dag."],
      ["Nieuwslezer", "Volgens de gemeente was de stalling hard nodig: rond het station stonden vaak honderden fietsen op de stoep, waardoor voetgangers er nauwelijks langs konden."],
      ["Nieuwslezer", "Fietsen die na de opening nog buiten de rekken staan, worden binnenkort door de gemeente verwijderd."],
    ],
    questions: [
      mc("Hoeveel fietsen passen er in de nieuwe stalling?", ["Ongeveer 500", "Ruim 5.000", "Ruim 15.000"], 1, "'…plaats voor ruim vijfduizend fietsen.'", { focus: "DETAIL" }),
      mc("Hoeveel kost parkeren na de eerste 24 uur?", ["Niets", "€ 0,75 per dag", "€ 1,75 per dag"], 1, "'…vijfenzeventig cent per dag.'", { focus: "DETAIL" }),
      mc("Waarom was de stalling nodig?", ["Er werden veel fietsen gestolen.", "Fietsen stonden op de stoep in de weg.", "Het oude station werd gesloten."], 1, "Bikes on the pavement blocked pedestrians.", { focus: "MAIN_IDEA" }),
      tf("Fietsen die buiten de rekken staan, mogen daar blijven staan.", false, "They will be removed by the municipality.", { focus: "DETAIL" }),
    ],
  },
  {
    slug: "podcastfragment-slapen",
    title: "Fragment: genoeg slaap?",
    level: "B2",
    kind: "MONOLOGUE",
    topic: "health",
    description: "A short, podcast-style monologue about sleep and screen use (original script).",
    words: ["het onderzoek", "gezond", "de gewoonte"],
    segments: [
      ["Presentator", "Welkom terug. Vandaag hebben we het over slaap — iets waar we allemaal ongeveer een derde van ons leven aan besteden, maar waar we zelden echt bij stilstaan."],
      ["Presentator", "Volgens slaaponderzoekers hebben de meeste volwassenen tussen de zeven en negen uur slaap nodig. Toch blijkt uit enquêtes dat een groot deel van de mensen structureel minder slaapt."],
      ["Presentator", "Een veelgenoemde boosdoener is de telefoon. Het is niet alleen het licht van het scherm; het is vooral de prikkel. Je leest nog even een bericht, en voor je het weet ben je weer klaarwakker."],
      ["Presentator", "Wat helpt? Experts adviseren vaste tijden aan te houden, ook in het weekend, en het laatste uur voor het slapengaan geen schermen te gebruiken. Klinkt simpel, maar zoals iedereen weet: gewoontes veranderen is allesbehalve makkelijk."],
    ],
    questions: [
      mc("Hoeveel slaap hebben volwassenen volgens onderzoekers nodig?", ["Vijf tot zeven uur", "Zeven tot negen uur", "Negen tot elf uur"], 1, "'…tussen de zeven en negen uur…'", { focus: "DETAIL" }),
      mc("Wat is volgens de presentator het grootste probleem van de telefoon?", ["Het licht van het scherm", "De prikkel om berichten te lezen", "Het geluid van meldingen"], 1, "'Het is niet alleen het licht…; het is vooral de prikkel.'", { focus: "INFERENCE" }),
      mc("Welk advies wordt gegeven?", ["In het weekend uitslapen", "Vaste slaaptijden en geen schermen in het laatste uur", "Melatonine gebruiken"], 1, "Fixed times and no screens the last hour before bed.", { focus: "DETAIL" }),
      mc("Wat bedoelt de presentator met 'allesbehalve makkelijk'?", ["Heel makkelijk", "Helemaal niet makkelijk", "Een beetje makkelijk"], 1, "'Allesbehalve' = anything but.", { focus: "VOCABULARY" }),
    ],
  },
];
