import { mc, tf, fill, type SeedQuestion } from "./questions";

export interface SeedReading {
  slug: string;
  title: string;
  level: "A2" | "B1" | "B2" | "C1";
  genre: "STORY" | "NEWS" | "EVERYDAY" | "EMAIL" | "WORKPLACE" | "CULTURE" | "OPINION" | "FORMAL";
  topic: string;
  summaryEn: string;
  isNt2?: boolean;
  body: string;
  words: string[];
  questions: SeedQuestion[];
}

/** All texts are original, written for this app. Names and places are fictional or generic. */
export const READINGS: SeedReading[] = [
  {
    slug: "een-nieuwe-buurvrouw",
    title: "Een nieuwe buurvrouw",
    level: "A2",
    genre: "STORY",
    topic: "home",
    summaryEn: "Sara meets her new neighbour and they arrange to have coffee.",
    words: ["de buurman", "gezellig", "afspreken", "verhuizen", "de buurt"],
    body: `Sara woont al drie jaar in een rustige straat in Zwolle. Vorige week is er een nieuwe buurvrouw naast haar komen wonen. Ze heet Ingrid en ze komt uit Groningen.

Op zaterdag ziet Sara haar in de tuin. Ingrid draagt grote dozen naar binnen. "Hallo, ik ben Sara," zegt ze. "Welkom in de buurt! Kan ik je helpen?"

"Graag!" zegt Ingrid. "Ik ben gisteren verhuisd en ik ben nog lang niet klaar."

Samen dragen ze de laatste dozen naar binnen. Daarna drinken ze thee in Ingrids lege keuken. Ingrid vertelt dat ze in het ziekenhuis werkt, als verpleegkundige. Ze kent nog niemand in Zwolle.

"Zullen we volgende week samen koffie drinken?" vraagt Sara. "Dan laat ik je de markt zien."

Ingrid is blij. "Dat lijkt me heel gezellig. Woensdagmiddag ben ik vrij."

Ze spreken af om half drie bij Sara thuis.`,
    questions: [
      mc("Waarom ziet Sara de nieuwe buurvrouw in de tuin?", ["Ingrid werkt in de tuin.", "Ingrid draagt dozen naar binnen.", "Ingrid zoekt Sara."], 1, "The text says: 'Ingrid draagt grote dozen naar binnen.'", { focus: "DETAIL" }),
      tf("Ingrid woont al drie jaar in Zwolle.", false, "Sara has lived there three years; Ingrid moved 'gisteren' (yesterday).", { focus: "DETAIL" }),
      mc("Wat is Ingrids beroep?", ["Docent", "Verpleegkundige", "Arts"], 1, "'…ze werkt in het ziekenhuis, als verpleegkundige.'", { focus: "DETAIL" }),
      mc("Wat is de hoofdgedachte van de tekst?", ["Sara verhuist naar Groningen.", "Sara maakt kennis met haar nieuwe buurvrouw.", "Ingrid zoekt een nieuwe baan."], 1, "The story is about Sara meeting and welcoming Ingrid.", { focus: "MAIN_IDEA" }),
      fill("Ze spreken woensdag om half drie ___ bij Sara thuis.", ["af"], "Separable verb afspreken: 'Ze spreken … af'.", { focus: "GRAMMAR" }),
    ],
  },
  {
    slug: "bij-de-huisarts",
    title: "Een afspraak bij de huisarts",
    level: "A2",
    genre: "EVERYDAY",
    topic: "health",
    summaryEn: "Mohammed calls the GP's practice because of a sore throat and gets an appointment.",
    words: ["de huisarts", "de afspraak", "de klacht", "ziek", "opbellen"],
    body: `Mohammed voelt zich al een paar dagen niet lekker. Hij heeft keelpijn en hij is erg moe. Op maandagochtend belt hij de huisarts op.

"Goedemorgen, huisartsenpraktijk De Linde, met Anouk."
"Goedemorgen, met Mohammed Amrani. Ik wil graag een afspraak maken. Ik heb al vijf dagen keelpijn."
"Heeft u ook koorts?"
"Ja, gisteren had ik 38,5 graden."
"Oké. De dokter heeft vandaag om kwart over elf nog tijd. Kunt u dan komen?"
"Ja, dat is goed. Moet ik iets meenemen?"
"Neemt u uw zorgpas mee. En als het slechter wordt, belt u ons dan opnieuw."

Om elf uur fietst Mohammed naar de praktijk. In de wachtkamer zitten nog drie andere mensen. De dokter onderzoekt zijn keel en zegt dat het een virus is. Hij krijgt geen medicijnen, maar hij moet veel drinken en goed uitrusten.`,
    questions: [
      mc("Waarom belt Mohammed de huisarts?", ["Hij heeft keelpijn en koorts.", "Hij heeft een nieuwe zorgpas nodig.", "Hij wil een afspraak verzetten."], 0, "He has had a sore throat for five days and had a fever.", { focus: "MAIN_IDEA" }),
      mc("Hoe laat is de afspraak?", ["Om 11.00 uur", "Om 11.15 uur", "Om 11.30 uur"], 1, "'kwart over elf' = 11:15.", { focus: "DETAIL" }),
      tf("Mohammed krijgt medicijnen van de dokter.", false, "'Hij krijgt geen medicijnen…'", { focus: "DETAIL" }),
      mc("Wat moet Mohammed meenemen?", ["Zijn paspoort", "Zijn zorgpas", "Een brief van zijn werk"], 1, "'Neemt u uw zorgpas mee.'", { focus: "DETAIL" }),
    ],
  },
  {
    slug: "mail-aan-de-verhuurder",
    title: "Een e-mail aan de verhuurder",
    level: "A2",
    genre: "EMAIL",
    topic: "home",
    summaryEn: "A tenant emails the landlord about a broken heater and asks for a repair.",
    words: ["de verhuurder", "de huur", "het huis"],
    body: `Onderwerp: Verwarming kapot

Beste meneer Jansen,

Ik schrijf u omdat de verwarming in mijn appartement sinds zaterdag niet meer werkt. Het is nu erg koud in huis, vooral 's avonds. Ik heb de ketel al uit- en weer aangezet, maar dat helpt niet.

Kunt u een monteur sturen? Ik ben deze week elke dag na vier uur thuis. Op vrijdag ben ik de hele dag thuis.

Kunt u mij laten weten wanneer de monteur komt? U kunt mij bellen op 06-12345678.

Alvast bedankt.

Met vriendelijke groet,

Lena Petrova
Kerklaan 14B`,
    questions: [
      mc("Wat is het probleem?", ["De huur is te hoog.", "De verwarming werkt niet.", "De ketel maakt lawaai."], 1, "'…de verwarming… werkt niet meer.'", { focus: "MAIN_IDEA" }),
      mc("Wanneer is Lena de hele dag thuis?", ["Op zaterdag", "Op vrijdag", "Elke dag na vier uur"], 1, "'Op vrijdag ben ik de hele dag thuis.'", { focus: "DETAIL" }),
      tf("Lena heeft zelf al iets geprobeerd om het probleem op te lossen.", true, "She turned the boiler off and on again.", { focus: "INFERENCE" }),
      mc("Welke afsluiting is formeel?", ["Groetjes", "Met vriendelijke groet", "Doei"], 1, "'Met vriendelijke groet' is the standard formal closing.", { focus: "VOCABULARY" }),
    ],
  },
  {
    slug: "thuiswerken-voor-en-nadelen",
    title: "Thuiswerken: ideaal of niet?",
    level: "B1",
    genre: "OPINION",
    topic: "work",
    summaryEn: "Two employees describe the advantages and disadvantages of working from home.",
    isNt2: true,
    words: ["het voordeel", "het nadeel", "de collega", "de vergadering", "toenemen"],
    body: `Sinds een paar jaar werken veel Nederlanders een deel van de week thuis. Maar is dat eigenlijk een goed idee? We vroegen het aan twee werknemers.

**Petra (42), beleidsmedewerker bij een gemeente**
"Voor mij is thuiswerken ideaal. Vroeger zat ik elke dag anderhalf uur in de auto. Nu kan ik die tijd gebruiken om te sporten of om mijn kinderen naar school te brengen. Ik merk ook dat ik thuis beter kan concentreren, omdat ik minder vaak gestoord word. Wel ga ik op dinsdag en donderdag naar kantoor, want ik vind het contact met mijn collega's belangrijk."

**Daan (27), werkt bij een marketingbureau**
"Ik werk liever op kantoor. Mijn appartement is klein en ik heb geen aparte werkkamer. Ik werk aan de keukentafel en dat is niet goed voor mijn rug. Bovendien voel ik me soms eenzaam als ik de hele dag alleen ben. Op kantoor leer ik ook veel van ervaren collega's, gewoon door te luisteren wat ze zeggen. Online vergaderingen vind ik vermoeiend."

Onderzoek laat zien dat de meeste werknemers een combinatie het prettigst vinden: twee of drie dagen thuis, en de rest van de week op kantoor.`,
    questions: [
      mc("Wat is volgens Petra het grootste voordeel van thuiswerken?", ["Ze verdient meer geld.", "Ze hoeft niet meer te reizen.", "Ze heeft een grote werkkamer."], 1, "She used to spend 1.5 hours a day in the car.", { focus: "DETAIL" }),
      mc("Waarom gaat Petra twee dagen per week naar kantoor?", ["Haar baas wil dat.", "Ze vindt het contact met collega's belangrijk.", "Ze kan thuis niet werken."], 1, "'…want ik vind het contact met mijn collega's belangrijk.'", { focus: "DETAIL" }),
      tf("Daan heeft thuis een eigen werkkamer.", false, "'…ik heb geen aparte werkkamer.'", { focus: "DETAIL" }),
      mc("Welk probleem noemt Daan NIET?", ["Rugpijn", "Eenzaamheid", "Een slechte internetverbinding"], 2, "He mentions his back, loneliness and tiring online meetings — not internet problems.", { focus: "DETAIL" }),
      mc("Wat is de conclusie van de tekst?", ["De meeste mensen willen alleen thuiswerken.", "De meeste mensen willen alleen op kantoor werken.", "De meeste mensen vinden een combinatie het beste."], 2, "The final paragraph says most workers prefer a combination.", { focus: "MAIN_IDEA" }),
    ],
  },
  {
    slug: "fietsen-in-nederland",
    title: "Waarom fietsen Nederlanders zo veel?",
    level: "B1",
    genre: "CULTURE",
    topic: "travel",
    summaryEn: "An explanation of why cycling is so popular in the Netherlands: geography, infrastructure and habit.",
    words: ["de fiets", "gezond", "het milieu", "de gewoonte"],
    body: `Wie voor het eerst in Nederland komt, is vaak verbaasd over het aantal fietsen. Kinderen fietsen naar school, studenten naar de universiteit en managers in pak naar kantoor. Hoe komt dat eigenlijk?

Een eerste reden is het landschap. Nederland is grotendeels vlak, dus fietsen kost weinig moeite. Ook zijn de afstanden klein: veel dagelijkse bestemmingen liggen binnen een paar kilometer.

Een tweede reden is de infrastructuur. In de jaren zeventig groeide het autoverkeer snel en vielen er veel verkeersslachtoffers, ook onder kinderen. Daartegen kwam protest. Steden en gemeenten gingen daarna meer investeren in veilige fietspaden, fietsenstallingen en verkeerslichten speciaal voor fietsers.

Tot slot is fietsen gewoon een gewoonte geworden. Kinderen leren al jong fietsen en gaan vaak zelfstandig naar school. Voor veel Nederlanders is de fiets daarom geen sport, maar een normaal vervoermiddel — net als de bus of de trein.

Fietsen heeft bovendien voordelen voor de gezondheid en het milieu. Toch zijn er ook problemen: in grote steden is er vaak te weinig plek om fietsen te parkeren, en er worden jaarlijks veel fietsen gestolen.`,
    questions: [
      mc("Welke reden noemt de tekst als eerste?", ["De infrastructuur", "Het vlakke landschap", "De hoge prijs van benzine"], 1, "'Een eerste reden is het landschap.'", { focus: "DETAIL" }),
      mc("Wat gebeurde er in de jaren zeventig?", ["Er kwamen minder auto's.", "Er was protest tegen onveilig verkeer.", "Fietsen werd verboden in steden."], 1, "Rising traffic and victims led to protest and investment in cycling infrastructure.", { focus: "DETAIL" }),
      tf("Volgens de tekst zien veel Nederlanders fietsen vooral als sport.", false, "'…de fiets daarom geen sport, maar een normaal vervoermiddel'.", { focus: "INFERENCE" }),
      mc("Welk probleem noemt de tekst?", ["Fietsen is te duur.", "Er is te weinig parkeerruimte voor fietsen.", "Fietspaden zijn te smal."], 1, "Too little space to park bikes and many stolen bikes.", { focus: "DETAIL" }),
    ],
  },
  {
    slug: "vrijwilligerswerk-in-de-bibliotheek",
    title: "Taalmaatjes in de bibliotheek",
    level: "B1",
    genre: "NEWS",
    topic: "education",
    summaryEn: "A local library (fictional town) pairs volunteers with newcomers to practise Dutch.",
    isNt2: true,
    words: ["de vrijwilliger", "de bibliotheek", "oefenen", "de taal"],
    body: `De bibliotheek van Lindeveld start in september met een nieuw project: Taalmaatjes. Vrijwilligers gaan één keer per week een uur Nederlands praten met iemand die de taal aan het leren is.

"Veel mensen volgen een taalcursus, maar ze hebben buiten de les weinig kans om te oefenen," vertelt projectleider Fatima Bakker. "Op het werk of in de winkel durven ze vaak niet te praten, omdat ze bang zijn om fouten te maken. Bij een taalmaatje kan dat gewoon."

De gesprekken gaan over gewone onderwerpen: het weer, het nieuws, de kinderen, het werk. Een taalmaatje is geen docent. "Je hoeft geen grammatica uit te leggen," zegt Bakker. "Het gaat om luisteren, praten en samen lachen."

Voor het project zoekt de bibliotheek nog twintig vrijwilligers. Ze moeten minstens zes maanden mee kunnen doen. Vooraf krijgen ze een korte training van twee avonden. Deelnemers die Nederlands willen oefenen, kunnen zich aanmelden bij de servicebalie. Het project is gratis.`,
    questions: [
      mc("Wat is het doel van het project Taalmaatjes?", ["Grammaticalessen geven", "Mensen laten oefenen met praten", "Nieuwe boeken uitlenen"], 1, "Volunteers talk Dutch with learners to give them practice.", { focus: "MAIN_IDEA" }),
      mc("Waarom praten taalleerders volgens Bakker vaak niet op het werk?", ["Ze hebben geen tijd.", "Ze zijn bang om fouten te maken.", "Hun collega's spreken Engels."], 1, "'…omdat ze bang zijn om fouten te maken.'", { focus: "DETAIL" }),
      tf("Een taalmaatje moet grammatica kunnen uitleggen.", false, "'Je hoeft geen grammatica uit te leggen.'", { focus: "DETAIL" }),
      mc("Wat moeten vrijwilligers doen?", ["Minstens zes maanden meedoen", "Een cursus van zes maanden volgen", "Betalen voor de training"], 0, "'Ze moeten minstens zes maanden mee kunnen doen.'", { focus: "DETAIL" }),
    ],
  },
  {
    slug: "de-woningmarkt",
    title: "Starters op de woningmarkt",
    level: "B2",
    genre: "NEWS",
    topic: "home",
    summaryEn: "An analysis of why it is hard for young people to find affordable housing and what measures are being discussed.",
    isNt2: true,
    words: ["de huur", "toenemen", "de ontwikkeling", "de samenleving", "de vergunning"],
    body: `Voor jongeren die hun eerste huis zoeken, is de situatie de afgelopen jaren steeds moeilijker geworden. De prijzen van koopwoningen zijn sterk gestegen, terwijl het aanbod van betaalbare huurwoningen achterblijft. Veel starters wonen daardoor langer bij hun ouders of betalen een groot deel van hun inkomen aan huur.

Deskundigen wijzen op verschillende oorzaken. Ten eerste is het aantal huishoudens toegenomen, onder meer doordat meer mensen alleen wonen. Ten tweede wordt er minder gebouwd dan nodig is: procedures voor vergunningen duren lang en de bouwkosten zijn hoog. Daarnaast worden woningen in populaire steden soms opgekocht door beleggers, die ze vervolgens tegen hoge prijzen verhuren.

Over de oplossingen verschillen de meningen. Sommigen pleiten voor het sneller verlenen van bouwvergunningen en het bouwen van tijdelijke woningen. Anderen vinden dat de overheid strengere regels moet maken voor de huurprijzen in de vrije sector. Weer anderen benadrukken dat ook kleinere gemeenten aantrekkelijker moeten worden, zodat niet iedereen naar de grote steden trekt.

Duidelijk is in elk geval dat er geen eenvoudige oplossing bestaat. Woningbouw kost tijd, en maatregelen die vandaag worden genomen, hebben pas over een aantal jaren effect.`,
    questions: [
      mc("Wat is het hoofdonderwerp van de tekst?", ["De bouwkosten in Nederland", "De problemen van starters om een woning te vinden", "Het leven van beleggers"], 1, "The text is about young people's difficulties finding housing.", { focus: "MAIN_IDEA" }),
      mc("Welke oorzaak noemt de tekst?", ["Er zijn minder huishoudens.", "Vergunningsprocedures duren lang.", "Huurwoningen worden goedkoper."], 1, "'…procedures voor vergunningen duren lang…'", { focus: "DETAIL" }),
      mc("Wat bedoelt de schrijver met 'het aanbod … blijft achter'?", ["Er zijn te weinig betaalbare huurwoningen.", "Huurwoningen zijn te groot.", "Er zijn te veel huurwoningen."], 0, "'Achterblijven' here means not keeping up with demand.", { focus: "VOCABULARY" }),
      tf("Volgens de tekst zijn alle deskundigen het eens over de oplossing.", false, "'Over de oplossingen verschillen de meningen.'", { focus: "DETAIL" }),
      mc("Wat is de toon van de laatste alinea?", ["Optimistisch: het probleem is snel opgelost", "Realistisch: oplossingen kosten tijd", "Boos: de overheid doet niets"], 1, "It stresses there's no simple solution and measures take years.", { focus: "INFERENCE" }),
    ],
  },
  {
    slug: "brief-van-de-gemeente",
    title: "Brief van de gemeente: afvalinzameling",
    level: "B2",
    genre: "FORMAL",
    topic: "bureaucracy",
    summaryEn: "A formal letter from a (fictional) municipality explaining changes in waste collection.",
    words: ["de gemeente", "duurzaam", "de duurzaamheid"],
    body: `Geachte bewoner,

Met ingang van 1 januari verandert de manier waarop de gemeente Lindeveld het huishoudelijk afval inzamelt. Met deze brief informeren wij u over de wijzigingen.

Het restafval wordt voortaan eens per twee weken opgehaald in plaats van wekelijks. Groente-, fruit- en tuinafval (gft) en plastic verpakkingen worden juist vaker ingezameld. Op deze manier willen wij het scheiden van afval stimuleren en de hoeveelheid restafval verminderen. Dit past binnen ons beleid om de gemeente duurzamer te maken.

Iedere woning ontvangt in december een extra container voor plastic, blik en drinkpakken. U hoeft hiervoor niets te doen. Bewoners van appartementen maken gebruik van de ondergrondse containers in de buurt; met uw afvalpas kunt u deze openen.

De nieuwe ophaaldagen vindt u in de afvalkalender op onze website en in de app van de gemeente. Heeft u vragen of wilt u een melding doen over een beschadigde container, neem dan contact met ons op via het algemene telefoonnummer, op werkdagen tussen 8.30 en 17.00 uur.

Met vriendelijke groet,

Het college van burgemeester en wethouders`,
    questions: [
      mc("Wat verandert er voor het restafval?", ["Het wordt vaker opgehaald.", "Het wordt minder vaak opgehaald.", "Het wordt niet meer opgehaald."], 1, "'…eens per twee weken … in plaats van wekelijks.'", { focus: "DETAIL" }),
      mc("Waarom voert de gemeente deze verandering door?", ["Om geld te verdienen", "Om afvalscheiding te stimuleren", "Omdat er te weinig vuilniswagens zijn"], 1, "To encourage separating waste and reduce residual waste.", { focus: "MAIN_IDEA" }),
      tf("Bewoners moeten zelf een extra container aanvragen.", false, "'U hoeft hiervoor niets te doen.'", { focus: "DETAIL" }),
      mc("'Met ingang van' betekent:", ["vanaf", "tot", "ongeveer op"], 0, "'Met ingang van 1 januari' = starting 1 January.", { focus: "VOCABULARY" }),
    ],
  },
  {
    slug: "taal-en-identiteit",
    title: "Taal en identiteit",
    level: "C1",
    genre: "OPINION",
    topic: "society",
    summaryEn: "An essay on how learning a language later in life can shape identity, and on the tension between perfection and communication.",
    words: [],
    body: `Wie als volwassene een nieuwe taal leert, merkt al snel dat het om meer gaat dan woordjes en grammaticaregels. Een taal is ook een manier van kijken, een verzameling ongeschreven afspraken over wat je zegt, hoe direct je bent en wanneer je beter kunt zwijgen. Het beruchte Nederlandse 'direct zijn' is daar een goed voorbeeld van: wat de een als eerlijk ervaart, vindt de ander bot.

Veel taalleerders beschrijven een merkwaardige gewaarwording: in de nieuwe taal voelen ze zich een iets andere persoon. Ze zijn er minder grappig of juist uitgesprokener, voorzichtiger of opvallend zelfverzekerd. Dat hoeft geen verlies te zijn. Je zou het ook kunnen zien als een verrijking: een tweede register waarin je jezelf kunt zijn, met andere mogelijkheden en andere beperkingen.

Tegelijkertijd blijft de spanning tussen perfectie en communicatie bestaan. Een accent of een verkeerd lidwoord kan ertoe leiden dat gesprekspartners overschakelen op het Engels — goedbedoeld, maar voor de leerder vaak frustrerend. Juist dan is het verleidelijk om je terug te trekken. Wie echter blijft praten, ook met fouten, ontdekt meestal dat begrip belangrijker is dan foutloosheid.

Misschien is dat wel de kern: een taal 'beheersen' is geen eindpunt dat je ooit bereikt, maar een voortdurende onderhandeling tussen wie je was en wie je in die taal aan het worden bent.`,
    questions: [
      mc("Wat is de belangrijkste stelling van de auteur?", ["Taal leren draait vooral om grammatica.", "Een nieuwe taal leren beïnvloedt ook je identiteit.", "Volwassenen kunnen geen taal meer leren."], 1, "The essay argues language learning shapes identity.", { focus: "MAIN_IDEA" }),
      mc("Hoe beoordeelt de auteur het gevoel 'een andere persoon' te zijn?", ["Als een verlies", "Als mogelijk een verrijking", "Als een teken van slechte taalbeheersing"], 1, "'Je zou het ook kunnen zien als een verrijking.'", { focus: "INFERENCE" }),
      mc("Waarom is overschakelen op het Engels volgens de tekst 'frustrerend'?", ["Omdat de leerder geen Engels spreekt", "Omdat de leerder zo minder kans krijgt om Nederlands te spreken", "Omdat Engels onbeleefd is"], 1, "Implied: it takes away the learner's chance to use Dutch.", { focus: "INFERENCE" }),
      mc("Wat betekent 'bot' in de eerste alinea?", ["Onbeleefd direct", "Verlegen", "Grappig"], 0, "'Bot' = blunt, rude.", { focus: "VOCABULARY" }),
    ],
  },
];
