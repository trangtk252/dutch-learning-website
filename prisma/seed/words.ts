/**
 * Curated, human-written dictionary entries (source HUMAN, verified).
 * Focus: high-frequency A2–B1 words plus some B2 words used in the readings.
 */

export interface SeedWord {
  lemma: string;
  english: string;
  pos: "NOUN" | "VERB" | "ADJECTIVE" | "ADVERB" | "PREPOSITION" | "CONJUNCTION" | "PHRASE" | "PRONOUN";
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  topics: string[];
  article?: "DE" | "HET" | "DE_HET";
  plural?: string;
  diminutive?: string;
  ipa?: string;
  notes?: string;
  verb?: {
    present: [string, string, string, string]; // ik, jij, hij, wij
    past: [string, string]; // singular, plural
    participle: string;
    aux: "HEBBEN" | "ZIJN" | "HEBBEN_ZIJN";
    separable?: string; // prefix
    irregular?: boolean;
    reflexive?: boolean;
  };
  adjective?: { inflected: string; comparative?: string; superlative?: string };
  examples: [string, string][];
  collocations?: [string, string][];
  synonyms?: string[];
  antonyms?: string[];
}

export const WORDS: SeedWord[] = [
  // ── Feelings & social life ──
  {
    lemma: "gezellig", english: "cosy; pleasant; convivial", pos: "ADJECTIVE", level: "A2", topics: ["social-life", "culture"],
    ipa: "ɣəˈzɛləx",
    notes: "A key Dutch cultural word with no exact English equivalent: it describes a warm, friendly, relaxed atmosphere — a place, an evening, or a person.",
    adjective: { inflected: "gezellige", comparative: "gezelliger", superlative: "gezelligst" },
    examples: [
      ["Het was een heel gezellige avond.", "It was a really nice, cosy evening."],
      ["Wat gezellig dat je er bent!", "How lovely that you're here!"],
    ],
    collocations: [["gezellig samenzijn", "a pleasant get-together"], ["het is gezellig druk", "it's pleasantly busy"]],
    synonyms: ["knus", "prettig"], antonyms: ["ongezellig"],
  },
  {
    lemma: "blij", english: "happy, glad", pos: "ADJECTIVE", level: "A1", topics: ["emotions"],
    ipa: "blɛi", adjective: { inflected: "blije", comparative: "blijer", superlative: "blijst" },
    examples: [["Ik ben blij met mijn nieuwe baan.", "I'm happy with my new job."], ["Ze is blij dat je komt.", "She's glad that you're coming."]],
    collocations: [["blij zijn met", "to be happy with"], ["blij verrast", "pleasantly surprised"]],
    synonyms: ["gelukkig", "vrolijk"], antonyms: ["verdrietig"],
  },
  {
    lemma: "moe", english: "tired", pos: "ADJECTIVE", level: "A1", topics: ["health", "emotions"],
    ipa: "mu", adjective: { inflected: "moede", comparative: "moeër", superlative: "moest" },
    notes: "Usually used predicatively: 'ik ben moe'. The inflected form 'moede' is rare; say 'een vermoeide man'.",
    examples: [["Ik ben moe na het werk.", "I'm tired after work."]],
    collocations: [["doodmoe", "dead tired"]], synonyms: ["vermoeid"], antonyms: ["uitgerust"],
  },
  {
    lemma: "zich voelen", english: "to feel", pos: "VERB", level: "A2", topics: ["emotions", "health"],
    verb: { present: ["voel", "voelt", "voelt", "voelen"], past: ["voelde", "voelden"], participle: "gevoeld", aux: "HEBBEN", reflexive: true },
    examples: [["Ik voel me niet zo lekker.", "I don't feel very well."], ["Hoe voel je je vandaag?", "How do you feel today?"]],
    collocations: [["zich thuis voelen", "to feel at home"]],
  },
  {
    lemma: "afspreken", english: "to arrange, to agree (to meet)", pos: "VERB", level: "A2", topics: ["social-life", "planning"],
    verb: { present: ["spreek af", "spreekt af", "spreekt af", "spreken af"], past: ["sprak af", "spraken af"], participle: "afgesproken", aux: "HEBBEN", separable: "af", irregular: true },
    notes: "Separable verb: 'Wij spreken morgen af', but 'Ik wil morgen afspreken' and 'We hebben afgesproken'.",
    examples: [["Zullen we zaterdag afspreken?", "Shall we meet up on Saturday?"], ["We hebben om acht uur afgesproken.", "We agreed to meet at eight."]],
    collocations: [["met iemand afspreken", "to arrange to meet someone"]],
  },
  {
    lemma: "de afspraak", english: "appointment; agreement", pos: "NOUN", level: "A2", topics: ["planning", "health"],
    article: "DE", plural: "afspraken", diminutive: "afspraakje",
    examples: [["Ik heb morgen een afspraak bij de tandarts.", "I have a dentist appointment tomorrow."], ["Een afspraak is een afspraak.", "A deal is a deal."]],
    collocations: [["een afspraak maken", "to make an appointment"], ["een afspraak afzeggen", "to cancel an appointment"], ["zich aan de afspraak houden", "to stick to the agreement"]],
  },
  // ── Everyday verbs ──
  {
    lemma: "gaan", english: "to go", pos: "VERB", level: "A1", topics: ["movement"],
    verb: { present: ["ga", "gaat", "gaat", "gaan"], past: ["ging", "gingen"], participle: "gegaan", aux: "ZIJN", irregular: true },
    notes: "Perfect tense with 'zijn': 'Ik ben naar huis gegaan'. Also used for the near future: 'Ik ga morgen werken'.",
    examples: [["Ik ga morgen naar Utrecht.", "I'm going to Utrecht tomorrow."], ["Hoe gaat het?", "How are you?"]],
    collocations: [["naar huis gaan", "to go home"], ["op vakantie gaan", "to go on holiday"]],
  },
  {
    lemma: "komen", english: "to come", pos: "VERB", level: "A1", topics: ["movement"],
    verb: { present: ["kom", "komt", "komt", "komen"], past: ["kwam", "kwamen"], participle: "gekomen", aux: "ZIJN", irregular: true },
    examples: [["Waar kom je vandaan?", "Where do you come from?"], ["Hij is te laat gekomen.", "He came too late."]],
    collocations: [["te laat komen", "to be late"], ["op tijd komen", "to be on time"]],
  },
  {
    lemma: "blijven", english: "to stay, to remain", pos: "VERB", level: "A2", topics: ["movement"],
    verb: { present: ["blijf", "blijft", "blijft", "blijven"], past: ["bleef", "bleven"], participle: "gebleven", aux: "ZIJN", irregular: true },
    examples: [["Ik blijf vanavond thuis.", "I'm staying home tonight."], ["Blijf rustig!", "Stay calm!"]],
    collocations: [["thuis blijven", "to stay at home"], ["blijven eten", "to stay for dinner"]],
  },
  {
    lemma: "hebben", english: "to have", pos: "VERB", level: "A1", topics: ["basics"],
    verb: { present: ["heb", "hebt", "heeft", "hebben"], past: ["had", "hadden"], participle: "gehad", aux: "HEBBEN", irregular: true },
    notes: "In questions with 'je' after the verb, the -t drops: 'Heb je tijd?'. With 'u' both 'u hebt' and 'u heeft' are correct.",
    examples: [["Heb je even tijd?", "Do you have a moment?"], ["Ze heeft twee kinderen.", "She has two children."]],
    collocations: [["zin hebben in", "to feel like (doing/having)"], ["gelijk hebben", "to be right"]],
  },
  {
    lemma: "zijn", english: "to be", pos: "VERB", level: "A1", topics: ["basics"],
    verb: { present: ["ben", "bent", "is", "zijn"], past: ["was", "waren"], participle: "geweest", aux: "ZIJN", irregular: true },
    examples: [["Ik ben docent.", "I'm a teacher."], ["Waar ben je geweest?", "Where have you been?"]],
  },
  {
    lemma: "werken", english: "to work", pos: "VERB", level: "A1", topics: ["work"],
    verb: { present: ["werk", "werkt", "werkt", "werken"], past: ["werkte", "werkten"], participle: "gewerkt", aux: "HEBBEN" },
    examples: [["Ik werk vier dagen per week.", "I work four days a week."], ["Het apparaat werkt niet.", "The device doesn't work."]],
    collocations: [["thuiswerken", "to work from home"], ["parttime werken", "to work part-time"]],
  },
  {
    lemma: "wonen", english: "to live (reside)", pos: "VERB", level: "A1", topics: ["home"],
    verb: { present: ["woon", "woont", "woont", "wonen"], past: ["woonde", "woonden"], participle: "gewoond", aux: "HEBBEN" },
    notes: "'Wonen' = to live somewhere; 'leven' = to be alive / to live a life.",
    examples: [["Ik woon in Rotterdam.", "I live in Rotterdam."], ["Ze wonen samen.", "They live together."]],
    collocations: [["op een kamer wonen", "to live in a rented room"]],
  },
  {
    lemma: "verhuizen", english: "to move (house)", pos: "VERB", level: "A2", topics: ["home"],
    verb: { present: ["verhuis", "verhuist", "verhuist", "verhuizen"], past: ["verhuisde", "verhuisden"], participle: "verhuisd", aux: "ZIJN" },
    examples: [["We zijn vorig jaar naar Leiden verhuisd.", "We moved to Leiden last year."]],
    collocations: [["verhuizen naar", "to move to"]],
  },
  {
    lemma: "opbellen", english: "to call (on the phone)", pos: "VERB", level: "A2", topics: ["communication"],
    verb: { present: ["bel op", "belt op", "belt op", "bellen op"], past: ["belde op", "belden op"], participle: "opgebeld", aux: "HEBBEN", separable: "op" },
    examples: [["Ik bel je morgen op.", "I'll call you tomorrow."], ["Heb je de huisarts al opgebeld?", "Have you called the GP yet?"]],
    synonyms: ["bellen"],
  },
  {
    lemma: "boodschappen doen", english: "to do the grocery shopping", pos: "PHRASE", level: "A1", topics: ["shopping"],
    examples: [["Ik doe op zaterdag boodschappen.", "I do the groceries on Saturdays."]],
  },
  {
    lemma: "betalen", english: "to pay", pos: "VERB", level: "A1", topics: ["shopping", "money"],
    verb: { present: ["betaal", "betaalt", "betaalt", "betalen"], past: ["betaalde", "betaalden"], participle: "betaald", aux: "HEBBEN" },
    examples: [["Kan ik pinnen of moet ik contant betalen?", "Can I pay by card or do I have to pay cash?"]],
    collocations: [["contant betalen", "to pay cash"], ["de rekening betalen", "to pay the bill"]],
  },
  {
    lemma: "pinnen", english: "to pay by debit card; to withdraw cash", pos: "VERB", level: "A2", topics: ["shopping", "money"],
    verb: { present: ["pin", "pint", "pint", "pinnen"], past: ["pinde", "pinden"], participle: "gepind", aux: "HEBBEN" },
    notes: "Very common in the Netherlands, where many shops prefer card payments ('Alleen pinnen').",
    examples: [["Kan ik hier pinnen?", "Can I pay by card here?"]],
  },
  {
    lemma: "vinden", english: "to find; to think (opinion)", pos: "VERB", level: "A1", topics: ["opinions"],
    verb: { present: ["vind", "vindt", "vindt", "vinden"], past: ["vond", "vonden"], participle: "gevonden", aux: "HEBBEN", irregular: true },
    notes: "Used for opinions: 'Ik vind het leuk' (I like it). 'Wat vind je ervan?' = What do you think of it?",
    examples: [["Ik vind Nederlands een mooie taal.", "I think Dutch is a beautiful language."], ["Ik kan mijn sleutels niet vinden.", "I can't find my keys."]],
    collocations: [["iets leuk vinden", "to like something"], ["wat vind je ervan?", "what do you think?"]],
  },
  {
    lemma: "denken", english: "to think", pos: "VERB", level: "A1", topics: ["opinions"],
    verb: { present: ["denk", "denkt", "denkt", "denken"], past: ["dacht", "dachten"], participle: "gedacht", aux: "HEBBEN", irregular: true },
    examples: [["Ik denk dat het gaat regenen.", "I think it's going to rain."]],
    collocations: [["denken aan", "to think of/about"], ["nadenken over", "to think something over"]],
  },
  {
    lemma: "begrijpen", english: "to understand", pos: "VERB", level: "A2", topics: ["communication"],
    verb: { present: ["begrijp", "begrijpt", "begrijpt", "begrijpen"], past: ["begreep", "begrepen"], participle: "begrepen", aux: "HEBBEN", irregular: true },
    examples: [["Ik begrijp het niet helemaal.", "I don't fully understand it."]],
    synonyms: ["snappen", "verstaan"],
    notes: "'Verstaan' = to hear/understand words acoustically; 'begrijpen' = to grasp the meaning.",
  },
  {
    lemma: "uitleggen", english: "to explain", pos: "VERB", level: "A2", topics: ["communication", "education"],
    verb: { present: ["leg uit", "legt uit", "legt uit", "leggen uit"], past: ["legde uit", "legden uit"], participle: "uitgelegd", aux: "HEBBEN", separable: "uit" },
    examples: [["Kun je dat nog een keer uitleggen?", "Can you explain that once more?"], ["De docent legt de grammatica uit.", "The teacher explains the grammar."]],
  },
  {
    lemma: "beginnen", english: "to begin, to start", pos: "VERB", level: "A2", topics: ["basics"],
    verb: { present: ["begin", "begint", "begint", "beginnen"], past: ["begon", "begonnen"], participle: "begonnen", aux: "ZIJN", irregular: true },
    examples: [["De les begint om negen uur.", "The lesson starts at nine."], ["Ik ben met een nieuwe cursus begonnen.", "I've started a new course."]],
    collocations: [["beginnen met", "to start with/on"]], antonyms: ["stoppen", "ophouden"],
  },
  {
    lemma: "zoeken", english: "to look for, to search", pos: "VERB", level: "A1", topics: ["basics"],
    verb: { present: ["zoek", "zoekt", "zoekt", "zoeken"], past: ["zocht", "zochten"], participle: "gezocht", aux: "HEBBEN", irregular: true },
    examples: [["Ik zoek een nieuwe baan.", "I'm looking for a new job."]],
    collocations: [["op zoek zijn naar", "to be looking for"]],
  },
  {
    lemma: "solliciteren", english: "to apply (for a job)", pos: "VERB", level: "B1", topics: ["work"],
    verb: { present: ["solliciteer", "solliciteert", "solliciteert", "solliciteren"], past: ["solliciteerde", "solliciteerden"], participle: "gesolliciteerd", aux: "HEBBEN" },
    examples: [["Ik heb gesolliciteerd naar een baan als verpleegkundige.", "I applied for a job as a nurse."]],
    collocations: [["solliciteren naar", "to apply for"], ["de sollicitatiebrief", "the cover letter"]],
  },
  {
    lemma: "de vergadering", english: "meeting", pos: "NOUN", level: "B1", topics: ["work"],
    article: "DE", plural: "vergaderingen",
    examples: [["De vergadering is verplaatst naar donderdag.", "The meeting has been moved to Thursday."]],
    collocations: [["een vergadering houden", "to hold a meeting"], ["in een vergadering zitten", "to be in a meeting"]],
    synonyms: ["het overleg"],
  },
  {
    lemma: "de collega", english: "colleague", pos: "NOUN", level: "A2", topics: ["work"],
    article: "DE", plural: "collega's",
    examples: [["Mijn collega's zijn erg behulpzaam.", "My colleagues are very helpful."]],
  },
  {
    lemma: "het bedrijf", english: "company, business", pos: "NOUN", level: "A2", topics: ["work"],
    article: "HET", plural: "bedrijven", diminutive: "bedrijfje",
    examples: [["Hij werkt bij een groot bedrijf in Eindhoven.", "He works for a large company in Eindhoven."]],
    collocations: [["een eigen bedrijf beginnen", "to start your own business"]],
  },
  {
    lemma: "de baan", english: "job; lane; track", pos: "NOUN", level: "A2", topics: ["work"],
    article: "DE", plural: "banen", diminutive: "baantje",
    examples: [["Ze heeft een nieuwe baan gevonden.", "She found a new job."]],
    collocations: [["een vaste baan", "a permanent job"], ["een bijbaantje", "a side job"]],
    synonyms: ["de functie", "het werk"],
  },
  {
    lemma: "de ervaring", english: "experience", pos: "NOUN", level: "B1", topics: ["work"],
    article: "DE", plural: "ervaringen",
    examples: [["Heeft u ervaring met klantenservice?", "Do you have experience with customer service?"]],
    collocations: [["ervaring opdoen", "to gain experience"], ["werkervaring", "work experience"]],
  },
  {
    lemma: "verantwoordelijk", english: "responsible", pos: "ADJECTIVE", level: "B1", topics: ["work"],
    adjective: { inflected: "verantwoordelijke", comparative: "verantwoordelijker", superlative: "verantwoordelijkst" },
    examples: [["Ik ben verantwoordelijk voor de planning.", "I'm responsible for the planning."]],
    collocations: [["verantwoordelijk zijn voor", "to be responsible for"]],
  },
  // ── Home & housing ──
  {
    lemma: "het huis", english: "house, home", pos: "NOUN", level: "A1", topics: ["home"],
    article: "HET", plural: "huizen", diminutive: "huisje",
    examples: [["Ons huis heeft een kleine tuin.", "Our house has a small garden."], ["Ik ga naar huis.", "I'm going home."]],
    collocations: [["thuis", "at home"], ["naar huis", "(to) home"]],
  },
  {
    lemma: "de huur", english: "rent", pos: "NOUN", level: "A2", topics: ["home", "money"],
    article: "DE", plural: "huren",
    examples: [["De huur is 950 euro per maand, exclusief gas, water en licht.", "The rent is 950 euros a month, excluding utilities."]],
    collocations: [["de huur betalen", "to pay the rent"], ["kale huur", "basic rent (without service costs)"]],
  },
  {
    lemma: "huren", english: "to rent", pos: "VERB", level: "A2", topics: ["home"],
    verb: { present: ["huur", "huurt", "huurt", "huren"], past: ["huurde", "huurden"], participle: "gehuurd", aux: "HEBBEN" },
    examples: [["We huren een appartement in het centrum.", "We rent a flat in the centre."]],
    antonyms: ["verhuren"],
  },
  {
    lemma: "de verhuurder", english: "landlord", pos: "NOUN", level: "B1", topics: ["home"],
    article: "DE", plural: "verhuurders",
    examples: [["Ik heb de verhuurder gemaild over de lekkage.", "I emailed the landlord about the leak."]],
  },
  {
    lemma: "de borg", english: "deposit (security)", pos: "NOUN", level: "B1", topics: ["home", "money"],
    article: "DE", plural: "borgen",
    examples: [["De borg is twee keer de maandhuur.", "The deposit is twice the monthly rent."]],
    collocations: [["de borg terugkrijgen", "to get the deposit back"]],
  },
  {
    lemma: "de buurt", english: "neighbourhood", pos: "NOUN", level: "A2", topics: ["home"],
    article: "DE", plural: "buurten", diminutive: "buurtje",
    examples: [["Is er een supermarkt in de buurt?", "Is there a supermarket nearby?"]],
    collocations: [["in de buurt", "nearby"]],
  },
  {
    lemma: "de buurman", english: "(male) neighbour", pos: "NOUN", level: "A2", topics: ["home", "social-life"],
    article: "DE", plural: "buren",
    notes: "Female: 'de buurvrouw'. The plural 'buren' is used for neighbours in general.",
    examples: [["Onze buurman helpt ons altijd.", "Our neighbour always helps us."]],
  },
  // ── Health ──
  {
    lemma: "de huisarts", english: "GP, family doctor", pos: "NOUN", level: "A2", topics: ["health"],
    article: "DE", plural: "huisartsen",
    notes: "In the Netherlands you usually see the huisarts first; they refer you to a specialist if needed.",
    examples: [["Ik moet een afspraak maken bij de huisarts.", "I need to make an appointment with the GP."]],
  },
  {
    lemma: "ziek", english: "ill, sick", pos: "ADJECTIVE", level: "A1", topics: ["health"],
    adjective: { inflected: "zieke", comparative: "zieker", superlative: "ziekst" },
    examples: [["Ik ben ziek, dus ik blijf thuis.", "I'm ill, so I'm staying home."]],
    collocations: [["zich ziek melden", "to call in sick"]], antonyms: ["gezond", "beter"],
  },
  {
    lemma: "de klacht", english: "complaint; symptom", pos: "NOUN", level: "B1", topics: ["health", "communication"],
    article: "DE", plural: "klachten",
    notes: "At the doctor, 'klachten' means symptoms: 'Wat zijn uw klachten?'",
    examples: [["Hoe lang heeft u deze klachten al?", "How long have you had these symptoms?"], ["Ik wil een klacht indienen.", "I'd like to file a complaint."]],
    collocations: [["een klacht indienen", "to file a complaint"]],
  },
  {
    lemma: "gezond", english: "healthy", pos: "ADJECTIVE", level: "A2", topics: ["health", "food"],
    adjective: { inflected: "gezonde", comparative: "gezonder", superlative: "gezondst" },
    examples: [["Fietsen is gezond.", "Cycling is healthy."]], antonyms: ["ongezond", "ziek"],
  },
  // ── Travel & city ──
  {
    lemma: "de trein", english: "train", pos: "NOUN", level: "A1", topics: ["travel"],
    article: "DE", plural: "treinen", diminutive: "treintje",
    examples: [["De trein naar Den Haag heeft vertraging.", "The train to The Hague is delayed."]],
    collocations: [["met de trein", "by train"], ["de trein missen", "to miss the train"]],
  },
  {
    lemma: "de vertraging", english: "delay", pos: "NOUN", level: "A2", topics: ["travel"],
    article: "DE", plural: "vertragingen",
    examples: [["Door een storing is er vertraging.", "Due to a malfunction there is a delay."]],
    collocations: [["vertraging hebben", "to be delayed"]],
  },
  {
    lemma: "overstappen", english: "to change (trains/buses), to transfer", pos: "VERB", level: "A2", topics: ["travel"],
    verb: { present: ["stap over", "stapt over", "stapt over", "stappen over"], past: ["stapte over", "stapten over"], participle: "overgestapt", aux: "ZIJN", separable: "over" },
    examples: [["U moet in Utrecht overstappen.", "You have to change in Utrecht."]],
  },
  {
    lemma: "de fiets", english: "bicycle", pos: "NOUN", level: "A1", topics: ["travel"],
    article: "DE", plural: "fietsen", diminutive: "fietsje",
    examples: [["Ik ga altijd met de fiets naar mijn werk.", "I always cycle to work."]],
    collocations: [["op de fiets", "by bike"]],
  },
  {
    lemma: "het station", english: "(railway) station", pos: "NOUN", level: "A1", topics: ["travel"],
    article: "HET", plural: "stations", diminutive: "stationnetje",
    examples: [["Het station is tien minuten lopen.", "The station is a ten-minute walk."]],
  },
  {
    lemma: "de gemeente", english: "municipality, town council", pos: "NOUN", level: "A2", topics: ["bureaucracy"],
    article: "DE", plural: "gemeenten",
    notes: "Plural also 'gemeentes'. You register your address (inschrijven) at the gemeente.",
    examples: [["Je moet je inschrijven bij de gemeente.", "You have to register with the municipality."]],
  },
  {
    lemma: "zich inschrijven", english: "to register, to enrol", pos: "VERB", level: "B1", topics: ["bureaucracy", "education"],
    verb: { present: ["schrijf in", "schrijft in", "schrijft in", "schrijven in"], past: ["schreef in", "schreven in"], participle: "ingeschreven", aux: "HEBBEN", separable: "in", irregular: true, reflexive: true },
    examples: [["Ik heb me ingeschreven voor een taalcursus.", "I've signed up for a language course."]],
    collocations: [["zich inschrijven bij de gemeente", "to register with the municipality"]],
  },
  {
    lemma: "het formulier", english: "form (document)", pos: "NOUN", level: "A2", topics: ["bureaucracy"],
    article: "HET", plural: "formulieren",
    examples: [["Wilt u dit formulier invullen?", "Would you fill in this form?"]],
    collocations: [["een formulier invullen", "to fill in a form"]],
  },
  {
    lemma: "invullen", english: "to fill in", pos: "VERB", level: "A2", topics: ["bureaucracy"],
    verb: { present: ["vul in", "vult in", "vult in", "vullen in"], past: ["vulde in", "vulden in"], participle: "ingevuld", aux: "HEBBEN", separable: "in" },
    examples: [["Heb je het formulier al ingevuld?", "Have you filled in the form yet?"]],
  },
  {
    lemma: "de vergunning", english: "permit, licence", pos: "NOUN", level: "B2", topics: ["bureaucracy"],
    article: "DE", plural: "vergunningen",
    examples: [["Voor een dakkapel heb je soms een vergunning nodig.", "For a dormer you sometimes need a permit."]],
    collocations: [["een vergunning aanvragen", "to apply for a permit"]],
  },
  {
    lemma: "aanvragen", english: "to apply for, to request", pos: "VERB", level: "B1", topics: ["bureaucracy"],
    verb: { present: ["vraag aan", "vraagt aan", "vraagt aan", "vragen aan"], past: ["vroeg aan", "vroegen aan"], participle: "aangevraagd", aux: "HEBBEN", separable: "aan", irregular: true },
    examples: [["Ik heb een nieuw paspoort aangevraagd.", "I've applied for a new passport."]],
  },
  // ── Food ──
  {
    lemma: "het eten", english: "food; meal", pos: "NOUN", level: "A1", topics: ["food"],
    article: "HET",
    examples: [["Het eten is klaar!", "Dinner is ready!"]],
    collocations: [["uit eten gaan", "to eat out"]],
  },
  {
    lemma: "lekker", english: "tasty; nice, pleasant", pos: "ADJECTIVE", level: "A1", topics: ["food"],
    adjective: { inflected: "lekkere", comparative: "lekkerder", superlative: "lekkerst" },
    notes: "Used far beyond food: 'lekker weer' (nice weather), 'lekker slapen' (sleep well), 'Ik voel me niet lekker' (I don't feel well).",
    examples: [["Deze soep is heel lekker.", "This soup is very tasty."], ["Slaap lekker!", "Sleep well!"]],
  },
  {
    lemma: "bestellen", english: "to order", pos: "VERB", level: "A2", topics: ["food", "shopping"],
    verb: { present: ["bestel", "bestelt", "bestelt", "bestellen"], past: ["bestelde", "bestelden"], participle: "besteld", aux: "HEBBEN" },
    examples: [["Mag ik bestellen?", "May I order?"], ["Ik heb online een boek besteld.", "I ordered a book online."]],
  },
  {
    lemma: "de rekening", english: "bill; account", pos: "NOUN", level: "A2", topics: ["food", "money"],
    article: "DE", plural: "rekeningen",
    examples: [["Mag ik de rekening, alstublieft?", "Could I have the bill, please?"]],
    collocations: [["de rekening betalen", "to pay the bill"], ["rekening houden met", "to take into account"]],
  },
  // ── Time, frequency, connectors ──
  {
    lemma: "omdat", english: "because", pos: "CONJUNCTION", level: "A2", topics: ["connectors"],
    notes: "Subordinating conjunction: the verb goes to the end. 'Ik blijf thuis, omdat ik ziek ben.' Compare 'want' (main clause order).",
    examples: [["Ik leer Nederlands omdat ik hier woon.", "I'm learning Dutch because I live here."]],
    synonyms: ["want", "aangezien"],
  },
  {
    lemma: "want", english: "because, for", pos: "CONJUNCTION", level: "A2", topics: ["connectors"],
    notes: "Coordinating conjunction: normal word order after it. 'Ik blijf thuis, want ik ben ziek.'",
    examples: [["Ik neem een jas mee, want het is koud.", "I'm taking a coat, because it's cold."]],
  },
  {
    lemma: "daarom", english: "that's why, therefore", pos: "ADVERB", level: "A2", topics: ["connectors"],
    notes: "Adverb at the start of a clause → inversion: 'Daarom blijf ik thuis.'",
    examples: [["Het regent. Daarom neem ik de bus.", "It's raining. That's why I'm taking the bus."]],
  },
  {
    lemma: "hoewel", english: "although", pos: "CONJUNCTION", level: "B1", topics: ["connectors"],
    examples: [["Hoewel het regende, gingen we wandelen.", "Although it was raining, we went for a walk."]],
    synonyms: ["ofschoon"],
  },
  {
    lemma: "toch", english: "still, yet; after all; (tag) right?", pos: "ADVERB", level: "B1", topics: ["connectors"],
    notes: "A very flexible particle. 'Je komt toch ook?' = You're coming too, right? 'Het was moeilijk, maar ik heb het toch gedaan.' = …but I did it anyway.",
    examples: [["Je komt toch ook?", "You're coming too, aren't you?"], ["Het was duur, maar ik heb het toch gekocht.", "It was expensive, but I bought it anyway."]],
  },
  {
    lemma: "meestal", english: "usually, mostly", pos: "ADVERB", level: "A2", topics: ["time"],
    examples: [["Ik eet meestal om zes uur.", "I usually eat at six."]], synonyms: ["vaak", "doorgaans"],
  },
  {
    lemma: "eigenlijk", english: "actually, really", pos: "ADVERB", level: "A2", topics: ["connectors"],
    examples: [["Eigenlijk heb ik geen tijd.", "Actually, I don't have time."]],
  },
  {
    lemma: "onlangs", english: "recently", pos: "ADVERB", level: "B1", topics: ["time"],
    examples: [["Ik ben onlangs verhuisd.", "I moved recently."]], synonyms: ["kortgeleden", "laatst"],
  },
  {
    lemma: "op tijd", english: "on time", pos: "PHRASE", level: "A2", topics: ["time"],
    examples: [["Kom je op tijd?", "Will you be on time?"]], antonyms: ["te laat"],
  },
  // ── Education & language ──
  {
    lemma: "de taal", english: "language", pos: "NOUN", level: "A1", topics: ["education"],
    article: "DE", plural: "talen",
    examples: [["Nederlands is geen moeilijke taal.", "Dutch is not a difficult language."]],
    collocations: [["de moedertaal", "the mother tongue"], ["een taal leren", "to learn a language"]],
  },
  {
    lemma: "oefenen", english: "to practise", pos: "VERB", level: "A2", topics: ["education"],
    verb: { present: ["oefen", "oefent", "oefent", "oefenen"], past: ["oefende", "oefenden"], participle: "geoefend", aux: "HEBBEN" },
    examples: [["Ik oefen elke dag tien minuten.", "I practise ten minutes every day."]],
  },
  {
    lemma: "het examen", english: "exam", pos: "NOUN", level: "A2", topics: ["education"],
    article: "HET", plural: "examens",
    examples: [["Ik doe in juni examen.", "I'm taking the exam in June."]],
    collocations: [["examen doen", "to take an exam"], ["slagen voor een examen", "to pass an exam"], ["zakken voor een examen", "to fail an exam"]],
  },
  {
    lemma: "slagen", english: "to pass (an exam); to succeed", pos: "VERB", level: "B1", topics: ["education"],
    verb: { present: ["slaag", "slaagt", "slaagt", "slagen"], past: ["slaagde", "slaagden"], participle: "geslaagd", aux: "ZIJN" },
    examples: [["Ze is geslaagd voor haar rijexamen!", "She passed her driving test!"]],
    antonyms: ["zakken"],
  },
  {
    lemma: "de mening", english: "opinion", pos: "NOUN", level: "B1", topics: ["opinions"],
    article: "DE", plural: "meningen",
    examples: [["Volgens mij heeft iedereen recht op een eigen mening.", "In my view everyone has a right to their own opinion."]],
    collocations: [["van mening zijn", "to be of the opinion"], ["naar mijn mening", "in my opinion"]],
  },
  {
    lemma: "het voordeel", english: "advantage", pos: "NOUN", level: "B1", topics: ["opinions"],
    article: "HET", plural: "voordelen",
    examples: [["Een voordeel van thuiswerken is dat je niet hoeft te reizen.", "An advantage of working from home is that you don't have to travel."]],
    antonyms: ["het nadeel"],
  },
  {
    lemma: "het nadeel", english: "disadvantage", pos: "NOUN", level: "B1", topics: ["opinions"],
    article: "HET", plural: "nadelen",
    examples: [["Het nadeel is dat het duur is.", "The disadvantage is that it's expensive."]],
    antonyms: ["het voordeel"],
  },
  {
    lemma: "het onderzoek", english: "research, study; examination", pos: "NOUN", level: "B1", topics: ["education", "health"],
    article: "HET", plural: "onderzoeken",
    examples: [["Uit onderzoek blijkt dat fietsen gezond is.", "Research shows that cycling is healthy."]],
    collocations: [["onderzoek doen naar", "to do research into"]],
  },
  {
    lemma: "de gewoonte", english: "habit, custom", pos: "NOUN", level: "B1", topics: ["culture"],
    article: "DE", plural: "gewoonten",
    notes: "Plural also 'gewoontes'.",
    examples: [["Het is een Nederlandse gewoonte om op verjaardagen iedereen te feliciteren.", "It's a Dutch custom to congratulate everyone at birthdays."]],
  },
  {
    lemma: "de samenleving", english: "society", pos: "NOUN", level: "B2", topics: ["society"],
    article: "DE", plural: "samenlevingen",
    examples: [["Taal is belangrijk om mee te doen in de samenleving.", "Language is important to participate in society."]],
    synonyms: ["de maatschappij"],
  },
  {
    lemma: "de ontwikkeling", english: "development", pos: "NOUN", level: "B2", topics: ["society"],
    article: "DE", plural: "ontwikkelingen",
    examples: [["Dat is een positieve ontwikkeling.", "That's a positive development."]],
  },
  {
    lemma: "toenemen", english: "to increase", pos: "VERB", level: "B2", topics: ["society"],
    verb: { present: ["neem toe", "neemt toe", "neemt toe", "nemen toe"], past: ["nam toe", "namen toe"], participle: "toegenomen", aux: "ZIJN", separable: "toe", irregular: true },
    examples: [["Het aantal thuiswerkers is sterk toegenomen.", "The number of people working from home has increased sharply."]],
    antonyms: ["afnemen"],
  },
  {
    lemma: "de duurzaamheid", english: "sustainability", pos: "NOUN", level: "B2", topics: ["environment"],
    article: "DE",
    examples: [["Steeds meer bedrijven investeren in duurzaamheid.", "More and more companies invest in sustainability."]],
  },
  {
    lemma: "duurzaam", english: "sustainable; durable", pos: "ADJECTIVE", level: "B2", topics: ["environment"],
    adjective: { inflected: "duurzame", comparative: "duurzamer", superlative: "duurzaamst" },
    examples: [["We willen duurzamer leven.", "We want to live more sustainably."]],
  },
  {
    lemma: "het milieu", english: "the environment", pos: "NOUN", level: "B1", topics: ["environment"],
    article: "HET",
    notes: "False friend: 'milieu' means the natural environment, not 'social milieu'.",
    examples: [["Fietsen is beter voor het milieu.", "Cycling is better for the environment."]],
  },
  {
    lemma: "de vrijwilliger", english: "volunteer", pos: "NOUN", level: "B1", topics: ["society"],
    article: "DE", plural: "vrijwilligers",
    examples: [["Ze werkt als vrijwilliger in de bibliotheek.", "She works as a volunteer at the library."]],
  },
  {
    lemma: "de bibliotheek", english: "library", pos: "NOUN", level: "A2", topics: ["education"],
    article: "DE", plural: "bibliotheken",
    examples: [["In de bibliotheek kun je gratis Nederlands oefenen.", "At the library you can practise Dutch for free."]],
  },
  {
    lemma: "het weer", english: "the weather", pos: "NOUN", level: "A1", topics: ["weather"],
    article: "HET",
    notes: "Don't confuse with the adverb 'weer' (again).",
    examples: [["Wat een lekker weer vandaag!", "What lovely weather today!"]],
  },
  {
    lemma: "regenen", english: "to rain", pos: "VERB", level: "A1", topics: ["weather"],
    verb: { present: ["regen", "regent", "regent", "regenen"], past: ["regende", "regenden"], participle: "geregend", aux: "HEBBEN" },
    examples: [["Het regent al de hele dag.", "It's been raining all day."]],
  },
  {
    lemma: "het boek", english: "book", pos: "NOUN", level: "A1", topics: ["education"],
    article: "HET", plural: "boeken", diminutive: "boekje",
    examples: [["Ik lees een boek in het Nederlands.", "I'm reading a book in Dutch."]],
  },
  {
    lemma: "de vraag", english: "question; demand", pos: "NOUN", level: "A1", topics: ["communication"],
    article: "DE", plural: "vragen",
    examples: [["Mag ik een vraag stellen?", "May I ask a question?"]],
    collocations: [["een vraag stellen", "to ask a question"]],
  },
  {
    lemma: "het antwoord", english: "answer", pos: "NOUN", level: "A1", topics: ["communication"],
    article: "HET", plural: "antwoorden",
    examples: [["Weet jij het antwoord?", "Do you know the answer?"]],
  },
  {
    lemma: "belangrijk", english: "important", pos: "ADJECTIVE", level: "A2", topics: ["opinions"],
    adjective: { inflected: "belangrijke", comparative: "belangrijker", superlative: "belangrijkst" },
    examples: [["Het is belangrijk om elke dag te oefenen.", "It's important to practise every day."]],
  },
  {
    lemma: "moeilijk", english: "difficult", pos: "ADJECTIVE", level: "A1", topics: ["basics"],
    adjective: { inflected: "moeilijke", comparative: "moeilijker", superlative: "moeilijkst" },
    examples: [["De uitspraak van de 'g' is moeilijk.", "Pronouncing the 'g' is difficult."]], antonyms: ["makkelijk"],
  },
  {
    lemma: "makkelijk", english: "easy", pos: "ADJECTIVE", level: "A1", topics: ["basics"],
    adjective: { inflected: "makkelijke", comparative: "makkelijker", superlative: "makkelijkst" },
    examples: [["Deze oefening is makkelijk.", "This exercise is easy."]], synonyms: ["gemakkelijk"], antonyms: ["moeilijk"],
  },
  {
    lemma: "druk", english: "busy; crowded", pos: "ADJECTIVE", level: "A2", topics: ["work", "time"],
    adjective: { inflected: "drukke", comparative: "drukker", superlative: "drukst" },
    examples: [["Ik heb het deze week erg druk.", "I'm very busy this week."], ["Het is druk op de weg.", "There's a lot of traffic."]],
    collocations: [["het druk hebben", "to be busy"]], antonyms: ["rustig"],
  },
  {
    lemma: "rustig", english: "calm, quiet", pos: "ADJECTIVE", level: "A2", topics: ["emotions"],
    adjective: { inflected: "rustige", comparative: "rustiger", superlative: "rustigst" },
    examples: [["We wonen in een rustige straat.", "We live on a quiet street."]], antonyms: ["druk"],
  },
  {
    lemma: "op", english: "on; at; up", pos: "PREPOSITION", level: "A1", topics: ["prepositions"],
    notes: "Very frequent with many fixed uses: 'op maandag' (on Monday), 'op school' (at school), 'op het station' (at the station), 'wachten op' (wait for), 'op vakantie' (on holiday).",
    examples: [["Het boek ligt op tafel.", "The book is on the table."], ["Ik wacht op de bus.", "I'm waiting for the bus."]],
    collocations: [["wachten op", "to wait for"], ["op vakantie", "on holiday"], ["op tijd", "on time"]],
  },
  {
    lemma: "er", english: "there; of it/them (pronoun)", pos: "ADVERB", level: "B1", topics: ["grammar-words"],
    notes: "'Er' has several functions: place (Ik woon er al jaren), quantity (Ik heb er drie), existential (Er is een probleem), and with prepositions (Ik denk erover na).",
    examples: [["Er staat een man voor de deur.", "There's a man at the door."], ["Hoeveel kinderen heb je? Ik heb er twee.", "How many children do you have? I have two."]],
  },
];
