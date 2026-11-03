/**
 * Original NT2 Staatsexamen-style practice material (Programma I = B1, Programma II = B2).
 * Written for this app; modelled on the exam's task types, not copied from real exams.
 */
import { mc, tf, fill, type SeedQuestion } from "./questions";

export interface Nt2Reading {
  slug: string; title: string; level: "B1" | "B2";
  genre: "NEWS" | "EVERYDAY" | "EMAIL" | "WORKPLACE" | "CULTURE" | "OPINION" | "FORMAL" | "STORY";
  topic: string; summaryEn: string; body: string; questions: SeedQuestion[];
}
export interface Nt2Listening {
  slug: string; title: string; level: "B1" | "B2";
  kind: "SHORT" | "DIALOGUE" | "ANNOUNCEMENT" | "MONOLOGUE" | "NT2";
  topic: string; description: string; segments: [speaker: string | null, text: string][]; questions: SeedQuestion[];
}
export interface Nt2Writing {
  slug: string; title: string; level: "B1" | "B2";
  taskType: "EMAIL" | "MESSAGE" | "FORM" | "OPINION" | "ESSAY" | "COMPLAINT";
  register: "INFORMAL" | "NEUTRAL" | "FORMAL"; minWords: number; maxWords: number; instructions: string;
}

export const NT2_READINGS: Nt2Reading[] = [
  // ───────── Programma I (B1) ─────────
  {
    slug: "nt2-b1-brief-gemeente-afval",
    title: "Een brief van de gemeente",
    level: "B1", genre: "FORMAL", topic: "housing",
    summaryEn: "A letter from the municipality about new rules for collecting waste.",
    body: `Geachte bewoner,

Vanaf 1 januari verandert de manier waarop wij het afval ophalen in uw wijk. Het restafval wordt dan niet meer elke week opgehaald, maar eens in de twee weken. Het groente-, fruit- en tuinafval (gft) halen wij wel elke week op.

Waarom doen wij dit? Uit onderzoek blijkt dat veel huishoudens nog te veel afval in de grijze container gooien dat eigenlijk gescheiden kan worden. Door het afval beter te scheiden, houden we de wijk schoon en betalen alle inwoners minder afvalstoffenheffing.

Wat moet u doen? Als u een grotere container nodig hebt, bijvoorbeeld omdat u met meerdere personen in huis woont, kunt u dat tot 15 december gratis aanvragen via onze website of telefonisch via 14 070. Na die datum kost het wisselen van container twintig euro.

Een overzicht van de nieuwe ophaaldagen vindt u op de achterkant van deze brief. Hebt u vragen? Onze medewerkers helpen u graag.

Met vriendelijke groet,
Afdeling Openbare Ruimte, Gemeente Rivierdam`,
    questions: [
      mc("Wat verandert er vanaf 1 januari?", ["Het gft-afval wordt minder vaak opgehaald.", "Het restafval wordt minder vaak opgehaald.", "Alle containers worden gratis vervangen."], 1, "'Het restafval wordt dan … eens in de twee weken opgehaald.' The gft-afval is still collected weekly.", { focus: "MAIN_IDEA" }),
      mc("Waarom voert de gemeente deze regel in?", ["Er zijn te weinig vuilnismannen.", "Mensen moeten hun afval beter scheiden.", "De afvalstoffenheffing wordt hoger."], 1, "The aim is better waste separation, which keeps the area clean and lowers the waste tax.", { focus: "DETAIL" }),
      mc("Wat kost het om na 15 december van container te wisselen?", ["Niets", "Vijftien euro", "Twintig euro"], 2, "'Na die datum kost het wisselen van container twintig euro.'", { focus: "DETAIL" }),
      tf("Een gezin met veel personen kan voor 15 december gratis een grotere container aanvragen.", true, "That is exactly what the letter says.", { focus: "DETAIL" }),
    ],
  },
  {
    slug: "nt2-b1-thuiswerken-opinie",
    title: "Thuiswerken: wel of niet?",
    level: "B1", genre: "OPINION", topic: "work",
    summaryEn: "A reader's opinion piece about working from home.",
    body: `Sinds een paar jaar werk ik drie dagen per week thuis en twee dagen op kantoor. Mijn baas wil nu dat we weer vier dagen komen. Ik vind dat jammer, en ik leg graag uit waarom.

Ten eerste bespaar ik veel tijd. Mijn reis naar kantoor duurt anderhalf uur heen en terug. Die tijd gebruik ik nu om te sporten of om rustig te ontbijten met mijn kinderen. Ten tweede kan ik thuis beter nadenken. Op kantoor word ik de hele dag gestoord door collega's die een vraag hebben.

Toch zijn er ook nadelen. Ik mis de gezellige praatjes bij de koffieautomaat, en nieuwe collega's leren elkaar minder snel kennen. Daarom vind ik twee dagen op kantoor eigenlijk een goed compromis.

Mijn conclusie is dat de werkgever en de werknemers samen moeten kijken wat het beste past bij het werk. Niet iedereen heeft thuis een rustige werkplek, en niet elke baan is geschikt om thuis te doen.`,
    questions: [
      mc("Wat is de mening van de schrijver?", ["Iedereen moet altijd thuiswerken.", "Hij wil liever niet vier dagen per week naar kantoor.", "Hij vindt kantoorwerk beter dan thuiswerken."], 1, "He finds it a pity that the boss wants four days at the office.", { focus: "MAIN_IDEA" }),
      mc("Waarom werkt de schrijver thuis beter?", ["Hij heeft thuis een grotere werkplek.", "Hij wordt thuis minder gestoord.", "Hij heeft thuis snellere internetverbinding."], 1, "'Op kantoor word ik de hele dag gestoord.'", { focus: "DETAIL" }),
      mc("Wat is een nadeel van thuiswerken volgens de schrijver?", ["Nieuwe collega's leren elkaar minder snel kennen.", "De reistijd is langer.", "Je verdient minder geld."], 0, "'…nieuwe collega's leren elkaar minder snel kennen.'", { focus: "DETAIL" }),
      mc("Wat bedoelt de schrijver met 'een goed compromis'?", ["Een oplossing waarbij beide kanten iets krijgen.", "Een ruzie met de baas.", "Een nieuwe baan."], 0, "A compromise means both sides give a little: two days at the office, three at home.", { focus: "VOCABULARY" }),
    ],
  },
  {
    slug: "nt2-b1-eerste-werkdag",
    title: "De eerste werkdag",
    level: "B1", genre: "WORKPLACE", topic: "work",
    summaryEn: "Information for new employees about their first day.",
    body: `Welkom bij Bakkerij Van Dijk! Leuk dat je bij ons komt werken. Hieronder lees je wat je op je eerste werkdag kunt verwachten.

Je begint om zeven uur bij de achteringang. Daar ontmoet je Marloes, je begeleider. Zij laat je het hele bedrijf zien en stelt je voor aan het team. Je krijgt werkkleding van ons, maar je moet zelf stevige, gesloten schoenen meenemen.

In de ochtend leert Marloes je hoe je het brood inpakt en hoe de kassa werkt. Na de lunch, die wij samen eten, mag je een uur meelopen met de bezorger. Zo leer je onze klanten kennen.

Om vier uur is je eerste dag klaar. Dan praat Marloes nog even met je over hoe het ging. Heb je vragen of ben je ziek? Bel dan vóór zes uur 's ochtends naar 06-1234 5678, zodat wij een vervanger kunnen zoeken.`,
    questions: [
      mc("Wat moet de nieuwe medewerker zelf meenemen?", ["Werkkleding", "Stevige schoenen", "Zijn eigen lunch"], 1, "Work clothes are provided; the employee brings sturdy closed shoes.", { focus: "DETAIL" }),
      mc("Wie is Marloes?", ["De eigenaar van de bakkerij", "De bezorger", "De begeleider van de nieuwe medewerker"], 2, "'…Marloes, je begeleider.'", { focus: "DETAIL" }),
      mc("Wat gebeurt er na de lunch?", ["De nieuwe medewerker loopt een uur mee met de bezorger.", "De nieuwe medewerker mag naar huis.", "De nieuwe medewerker leert de kassa gebruiken."], 0, "The cash register is in the morning; after lunch there is an hour with the delivery driver.", { focus: "DETAIL" }),
      fill("Wie ziek is, moet vóór ___ uur 's ochtends bellen.", ["zes", "6"], "'Bel dan vóór zes uur 's ochtends.'", { focus: "DETAIL" }),
    ],
  },
  // ───────── Programma II (B2) ─────────
  {
    slug: "nt2-b2-huurmarkt-nieuws",
    title: "De huurmarkt onder druk",
    level: "B2", genre: "NEWS", topic: "housing",
    summaryEn: "A news report on rising rents and the shortage of rental homes.",
    body: `De huren in de grote steden zijn het afgelopen jaar opnieuw sterk gestegen. Volgens een onderzoek van een woningcorporatie betaalt iemand die nu een middenhuurwoning zoekt gemiddeld tien procent meer dan een jaar geleden. Tegelijkertijd daalt het aantal beschikbare woningen, omdat veel particuliere verhuurders hun huis liever verkopen dan verhuren.

Huurdersorganisaties luiden de noodklok. "Een steeds groter deel van het inkomen gaat naar de woonlasten," zegt een woordvoerder. "Jonge mensen en nieuwkomers komen vaak niet meer in aanmerking voor een woning, ook al hebben ze een vaste baan."

De gemeente wil het tij keren door de komende jaren meer betaalbare woningen te bouwen, maar bouwbedrijven wijzen op het tekort aan vakmensen en de lange vergunningsprocedures. Economen waarschuwen dat de situatie voorlopig niet verbetert. "Zolang het aanbod achterblijft bij de vraag, blijven de prijzen stijgen," aldus een van hen.

De overheid overweegt intussen aanvullende maatregelen, zoals een strengere regulering van tijdelijke huurcontracten. Of die voldoende effect hebben, is nog onzeker.`,
    questions: [
      mc("Wat is het belangrijkste onderwerp van dit artikel?", ["Het groeiende tekort aan betaalbare huurwoningen.", "De opening van nieuwe bouwbedrijven.", "De populariteit van koopwoningen."], 0, "The article is about rising rents and fewer available rental homes.", { focus: "MAIN_IDEA" }),
      mc("Waarom daalt het aanbod van huurwoningen?", ["Er worden geen woningen meer gebouwd.", "Veel verhuurders verkopen hun woning liever.", "De gemeente sloopt oude woningen."], 1, "'…veel particuliere verhuurders hun huis liever verkopen dan verhuren.'", { focus: "DETAIL" }),
      mc("Wat bedoelt de woordvoerder met 'luiden de noodklok'?", ["Ze maken zich grote zorgen en waarschuwen.", "Ze vieren een succes.", "Ze vragen om nieuwe verkiezingen."], 0, "Sounding the alarm bell means raising an urgent warning.", { focus: "VOCABULARY" }),
      mc("Welke verwachting hebben de economen?", ["De prijzen dalen binnenkort.", "De situatie verbetert voorlopig niet.", "Er komen minder nieuwkomers."], 1, "'…de situatie voorlopig niet verbetert.'", { focus: "INFERENCE" }),
      tf("Bouwbedrijven geven de gemeente de schuld van het woningtekort.", false, "Builders point to a shortage of skilled workers and long permit procedures; they do not blame the municipality.", { focus: "INFERENCE" }),
    ],
  },
  {
    slug: "nt2-b2-fietscultuur",
    title: "Waarom Nederland een fietsland is",
    level: "B2", genre: "CULTURE", topic: "culture",
    summaryEn: "An article on how cycling became a defining part of Dutch life.",
    body: `Bijna elke Nederlander bezit een fiets, en in sommige steden zijn er meer fietsen dan inwoners. Dat is geen toeval. In de jaren zeventig groeide het protest tegen het toenemende autoverkeer, vooral nadat veel kinderen waren verongelukt. Onder het motto "Stop de kindermoord" eisten burgers veiligere straten.

De overheid reageerde met investeringen in een samenhangend netwerk van fietspaden. Daardoor is fietsen niet alleen leuk, maar ook praktisch en veilig: voor korte afstanden is de fiets vaak sneller dan de auto, zeker in de binnenstad waar parkeren duur en schaars is.

Ook de geografie speelt een rol. Het land is vlak, zodat je er zonder veel inspanning grote afstanden kunt afleggen. Bovendien is de fiets een vervoermiddel voor iedereen: van scholieren en forenzen tot ouderen die elke dag boodschappen doen.

Toch is de fietscultuur geen vanzelfsprekendheid. Steden worden drukker, en er ontstaan steeds vaker conflicten tussen fietsers, voetgangers en bestuurders van elektrische fietsen. Beleidsmakers zoeken daarom naar manieren om de ruimte eerlijker te verdelen.`,
    questions: [
      mc("Waardoor ontstond de fietscultuur volgens de tekst?", ["Alleen doordat het land vlak is.", "Door protest tegen autoverkeer en investeringen van de overheid.", "Doordat auto's verboden werden."], 1, "Protests in the 1970s plus government investment in cycle paths; geography is only one factor.", { focus: "MAIN_IDEA" }),
      mc("Waarom is de fiets in de binnenstad vaak sneller dan de auto?", ["Omdat parkeren daar duur en schaars is.", "Omdat er geen auto's mogen rijden.", "Omdat fietspaden korter zijn."], 0, "'…zeker in de binnenstad waar parkeren duur en schaars is.'", { focus: "DETAIL" }),
      mc("Wat is een nieuw probleem dat in de laatste alinea wordt genoemd?", ["Er zijn te weinig fietsen.", "Fietsers, voetgangers en bestuurders van e-bikes komen elkaar vaker in de weg.", "De fietspaden zijn te breed."], 1, "'…conflicten tussen fietsers, voetgangers en bestuurders van elektrische fietsen.'", { focus: "DETAIL" }),
      mc("Wat is de toon van de laatste alinea?", ["Enthousiast en overdreven positief", "Nuchter: er zijn ook uitdagingen", "Boos op fietsers"], 1, "'Toch is de fietscultuur geen vanzelfsprekendheid…' signals a balanced view.", { focus: "INFERENCE" }),
    ],
  },
  {
    slug: "nt2-b2-email-studieadviseur",
    title: "Een e-mail aan de studieadviseur",
    level: "B2", genre: "EMAIL", topic: "study",
    summaryEn: "A student asks for advice about combining study and work.",
    body: `Onderwerp: Verzoek om een gesprek over mijn studieplanning

Geachte mevrouw Hendriks,

Ik ben tweedejaars student Bedrijfskunde en ik schrijf u omdat ik in de problemen kom met mijn planning. Sinds september werk ik twintig uur per week in een supermarkt om mijn studie te kunnen betalen. Daardoor heb ik de tentamens van blok 2 niet kunnen voorbereiden zoals ik wilde, en twee vakken heb ik helaas niet gehaald.

Ik wil graag met u bespreken of het mogelijk is om mijn studielast te verlagen zonder dat ik mijn studievoortgang in gevaar breng. Ook zou ik graag weten of de opleiding voor studenten in mijn situatie een regeling of een flexibel rooster heeft.

Zou ik volgende week woensdag of donderdag bij u langs kunnen komen? Ik kan op beide dagen na twee uur 's middags.

Alvast hartelijk dank voor uw hulp.

Met vriendelijke groet,
Daan Verbeek`,
    questions: [
      mc("Waarom schrijft Daan de e-mail?", ["Hij wil stoppen met zijn studie.", "Hij wil advies over zijn studieplanning.", "Hij wil een baan als studieadviseur."], 1, "He asks for a conversation about his planning and study load.", { focus: "MAIN_IDEA" }),
      mc("Wat is volgens Daan de oorzaak van zijn problemen?", ["Zijn werk naast de studie", "Een ziekte", "Slechte docenten"], 0, "He works 20 hours a week and could not prepare for exams.", { focus: "DETAIL" }),
      mc("Wat wil Daan aan mevrouw Hendriks vragen?", ["Of hij een andere opleiding kan kiezen", "Of er een regeling of flexibel rooster voor hem bestaat", "Of hij zijn tentamen kan overdoen zonder te betalen"], 1, "He asks about 'een regeling of een flexibel rooster'.", { focus: "DETAIL" }),
      mc("Welk register past bij deze e-mail?", ["Informeel", "Formeel", "Grappig"], 1, "'Geachte mevrouw… Met vriendelijke groet' is formal.", { focus: "VOCABULARY" }),
    ],
  },
];

export const NT2_LISTENING: Nt2Listening[] = [
  // ───────── Programma I (B1) ─────────
  {
    slug: "nt2-b1-voicemail-tandarts",
    title: "Een voicemailbericht van de tandarts",
    level: "B1", kind: "SHORT", topic: "health",
    description: "A short voicemail from a dentist's office about a changed appointment.",
    segments: [
      ["Assistente", "Goedemorgen, u spreekt met Lisa van tandartspraktijk De Linde. Ik bel over uw afspraak van donderdag veertien uur. Helaas is de tandarts die dag ziek, dus wij moeten de afspraak verzetten. Wij kunnen u aanbieden om vrijdag om negen uur langs te komen, of anders volgende week dinsdag om half elf. Wilt u ons uiterlijk morgen laten weten welke dag u beter uitkomt? U kunt ons bellen op nul drie nul, twaalf drie vier vijf. Alvast bedankt, en nog een prettige dag."],
    ],
    questions: [
      mc("Waarom moet de afspraak worden verzet?", ["De patiënt is ziek.", "De tandarts is ziek.", "De praktijk is gesloten."], 1, "'…de tandarts die dag ziek.'", { focus: "MAIN_IDEA" }),
      mc("Welke nieuwe tijden worden aangeboden?", ["Vrijdag om negen uur of dinsdag om half elf", "Donderdag om negen uur of vrijdag om half elf", "Dinsdag om negen uur of vrijdag om half twee"], 0, "Friday at nine or next Tuesday at half past ten.", { focus: "DETAIL" }),
      mc("Wat moet de patiënt doen?", ["Uiterlijk morgen bellen om een keuze te maken", "Niets, de assistente belt terug", "Een nieuw formulier invullen"], 0, "'…uiterlijk morgen laten weten welke dag u beter uitkomt.'", { focus: "DETAIL" }),
    ],
  },
  {
    slug: "nt2-b1-gesprek-collegas-weekend",
    title: "Collega's plannen een teamuitje",
    level: "B1", kind: "DIALOGUE", topic: "work",
    description: "Two colleagues discuss where to go for the team outing.",
    segments: [
      ["Eva", "Hé Karim, heb je al nagedacht over het teamuitje van volgende maand?"],
      ["Karim", "Een beetje. Ik dacht aan een dagje kanoën, maar Jeroen zei dat niet iedereen goed kan zwemmen."],
      ["Eva", "Dat is waar. Misschien kunnen we beter een fietstocht maken en ergens lunchen? Dat kan iedereen."],
      ["Karim", "Goed idee. Maar wat doen we als het regent? Dan is een fietstocht niet zo gezellig."],
      ["Eva", "Dan gaan we naar het museum in de stad. Ik heb gezien dat daar ook een restaurant is."],
      ["Karim", "Prima. Dan reserveer ik voor vrijdag de veertiende een tafel voor twaalf personen. Kun jij het aan de rest vertellen?"],
      ["Eva", "Natuurlijk, ik stuur vanmiddag een mail naar het hele team."],
    ],
    questions: [
      mc("Waarom kiezen ze niet voor kanoën?", ["Het is te duur.", "Niet iedereen kan goed zwemmen.", "Het regent die dag."], 1, "Jeroen said not everyone can swim well.", { focus: "DETAIL" }),
      mc("Wat gaan ze doen als het regent?", ["Ze blijven op kantoor.", "Ze gaan naar een museum.", "Ze verplaatsen het uitje."], 1, "'Dan gaan we naar het museum in de stad.'", { focus: "DETAIL" }),
      mc("Wie gaat de collega's informeren?", ["Karim", "Jeroen", "Eva"], 2, "Eva says she will send an email to the whole team.", { focus: "DETAIL" }),
      tf("Karim gaat een tafel reserveren.", true, "'…dan reserveer ik … een tafel.'", { focus: "DETAIL" }),
    ],
  },
  {
    slug: "nt2-b1-radio-fietsdiefstal",
    title: "Radio-item: fietsdiefstal",
    level: "B1", kind: "MONOLOGUE", topic: "city",
    description: "A radio item about bicycle theft and tips to prevent it.",
    segments: [
      ["Presentator", "Fietsdiefstal is in veel Nederlandse steden nog steeds een groot probleem. Volgens de politie worden er elk jaar tientallen duizenden fietsen gestolen, en de meeste eigenaren zien hun fiets nooit meer terug."],
      ["Presentator", "Wat kun je zelf doen? Allereerst: gebruik altijd een goed slot, het liefst twee. Een dief heeft bij een simpel slot maar een paar seconden nodig. Zet je fiets bovendien vast aan een fietsenrek of een paal, en niet alleen aan jezelf."],
      ["Presentator", "Ten tweede kun je het beste het framenummer van je fiets opschrijven. Als je fiets wordt gestolen, kan de politie hem dan makkelijker terugvinden. En tot slot: laat je fiets niet de hele nacht op straat staan. Gebruik als dat kan een bewaakte fietsenstalling, zeker bij het station."],
      ["Presentator", "Deze tips kosten wat moeite en soms wat geld, maar dat is veel minder dan een nieuwe fiets kopen. Dit was de Ochtendspits, wij gaan door met het nieuws."],
    ],
    questions: [
      mc("Waar gaat het item over?", ["Hoe je een fiets repareert", "Hoe je fietsdiefstal kunt voorkomen", "Hoe je een goede fiets koopt"], 1, "The speaker gives tips to prevent bicycle theft.", { focus: "MAIN_IDEA" }),
      mc("Waarom adviseert de presentator twee sloten?", ["Omdat dieven dan meer tijd nodig hebben.", "Omdat de politie dat verplicht.", "Omdat sloten goedkoop zijn."], 0, "A simple lock takes a thief only seconds, so more locks cost more time.", { focus: "INFERENCE" }),
      mc("Wat helpt de politie om een gestolen fiets terug te vinden?", ["Een foto van de eigenaar", "Het framenummer", "De kleur van het slot"], 1, "'…het framenummer van je fiets opschrijven.'", { focus: "DETAIL" }),
      mc("Waar kun je je fiets het beste 's nachts laten staan?", ["Op straat aan een paal", "In een bewaakte stalling", "Bij een buurman"], 1, "'Gebruik … een bewaakte fietsenstalling.'", { focus: "DETAIL" }),
    ],
  },
  // ───────── Programma II (B2) ─────────
  {
    slug: "nt2-b2-mededeling-verbouwing",
    title: "Mededeling: verbouwing van het kantoor",
    level: "B2", kind: "ANNOUNCEMENT", topic: "work",
    description: "An internal announcement about renovation work and temporary measures.",
    segments: [
      [null, "Beste collega's, een belangrijke mededeling over de verbouwing van onze kantoorverdieping. Zoals eerder aangekondigd begint de verbouwing volgende maandag en zal naar verwachting zes weken duren. In die periode zijn de afdelingen Financiën en Personeelszaken tijdelijk gevestigd op de derde verdieping."],
      [null, "Omdat daar minder werkplekken zijn, vragen wij u om op dinsdag en donderdag zo veel mogelijk thuis te werken. Een rooster hangt bij de receptie en staat op intranet. Houd er rekening mee dat de lift in de eerste week niet beschikbaar is; de trap is dan de enige route."],
      [null, "Wie bezwaren heeft of een bijzondere situatie heeft, bijvoorbeeld door een beperking, kan vóór vrijdag contact opnemen met de facilitaire dienst. Zij zoeken dan samen met u naar een passende oplossing. Wij danken u bij voorbaat voor uw begrip."],
    ],
    questions: [
      mc("Hoe lang duurt de verbouwing naar verwachting?", ["Twee weken", "Zes weken", "Zes maanden"], 1, "'…zal naar verwachting zes weken duren.'", { focus: "DETAIL" }),
      mc("Wat wordt aan de medewerkers gevraagd?", ["Op dinsdag en donderdag zoveel mogelijk thuiswerken", "Vakantie op te nemen", "Een nieuwe werkplek te zoeken buiten het bedrijf"], 0, "'…op dinsdag en donderdag zo veel mogelijk thuis te werken.'", { focus: "MAIN_IDEA" }),
      mc("Wat is er in de eerste week anders?", ["De lift is niet beschikbaar.", "De receptie is dicht.", "Het intranet werkt niet."], 0, "'…de lift in de eerste week niet beschikbaar is.'", { focus: "DETAIL" }),
      mc("Wie moeten medewerkers met bezwaren contacteren?", ["De afdeling Financiën", "De facilitaire dienst", "De directeur"], 1, "'…contact opnemen met de facilitaire dienst.'", { focus: "DETAIL" }),
    ],
  },
  {
    slug: "nt2-b2-gesprek-huisarts-leefstijl",
    title: "Bij de huisarts: advies over leefstijl",
    level: "B2", kind: "DIALOGUE", topic: "health",
    description: "A patient discusses stress and sleep problems with a GP.",
    segments: [
      ["Huisarts", "Goedemiddag meneer Bakker. U zei aan de telefoon dat u al een tijdje slecht slaapt. Kunt u daar iets meer over vertellen?"],
      ["Patiënt", "Ja, ik word elke nacht rond drie uur wakker en kan dan niet meer in slaap komen. Ik ben overdag moe en kan me slecht concentreren. Sinds ik een nieuwe functie heb, heb ik ook veel meer stress."],
      ["Huisarts", "Dat is vervelend. Drinkt u veel koffie of alcohol, of kijkt u 's avonds laat nog naar een scherm?"],
      ["Patiënt", "Eerlijk gezegd wel. Ik drink vier of vijf koppen koffie per dag en ik werk vaak tot elf uur op mijn laptop."],
      ["Huisarts", "Dan zou ik beginnen met een paar eenvoudige aanpassingen. Probeer na twee uur 's middags geen koffie meer te drinken en zet uw laptop een uur voor het slapengaan uit. Dat kan een groot verschil maken."],
      ["Patiënt", "En als dat niet helpt? Kunt u mij dan slaappillen voorschrijven?"],
      ["Huisarts", "Ik schrijf liever geen slaapmiddelen voor, omdat u er snel aan went. Als het over twee weken niet beter is, verwijs ik u door naar een psycholoog die gespecialiseerd is in slaapproblemen."],
    ],
    questions: [
      mc("Wat is het probleem van de patiënt?", ["Hij heeft pijn in zijn rug.", "Hij slaapt slecht en is overdag moe.", "Hij heeft een verkoudheid."], 1, "He wakes up around 3 a.m. and is tired during the day.", { focus: "MAIN_IDEA" }),
      mc("Wat is volgens de patiënt mogelijk een oorzaak?", ["Zijn nieuwe functie en stress", "Zijn gezin", "Zijn medicijnen"], 0, "'Sinds ik een nieuwe functie heb, heb ik ook veel meer stress.'", { focus: "DETAIL" }),
      mc("Wat adviseert de huisarts als eerste?", ["Slaappillen", "Minder koffie en eerder het scherm uitzetten", "Een lange vakantie"], 1, "No coffee after 2 p.m. and laptop off an hour before bed.", { focus: "DETAIL" }),
      mc("Waarom schrijft de huisarts liever geen slaapmiddelen voor?", ["Ze zijn te duur.", "Je went er snel aan.", "De patiënt is te jong."], 1, "'…omdat u er snel aan went.'", { focus: "DETAIL" }),
      mc("Wat gebeurt er als de klachten na twee weken niet beter zijn?", ["De huisarts verwijst de patiënt door naar een psycholoog.", "De patiënt moet een ander ziekenhuis bellen.", "De huisarts schrijft dan alsnog slaappillen voor."], 0, "'…verwijs ik u door naar een psycholoog.'", { focus: "DETAIL" }),
    ],
  },
  {
    slug: "nt2-b2-lezing-meertaligheid",
    title: "Lezing: meertaligheid in de samenleving",
    level: "B2", kind: "NT2", topic: "society",
    description: "A short talk about the benefits and challenges of multilingualism.",
    segments: [
      ["Spreker", "Goedemiddag, dames en heren. Vandaag wil ik het hebben over meertaligheid, iets wat steeds belangrijker wordt in onze samenleving. In Nederland groeit ruim een op de vijf kinderen op met een andere thuistaal dan het Nederlands."],
      ["Spreker", "Lange tijd werd gedacht dat meertalige kinderen een achterstand zouden oplopen. Recent onderzoek laat echter zien dat dit niet klopt. Kinderen die meerdere talen spreken, kunnen vaak beter schakelen tussen taken en luisteren aandachtiger. Dat betekent niet dat het altijd gemakkelijk is: in het begin hebben ze soms een kleinere woordenschat in elke taal afzonderlijk."],
      ["Spreker", "Voor volwassenen geldt iets vergelijkbaars. Wie een nieuwe taal leert, houdt de hersenen actief en kan zich beter aanpassen. Op de werkvloer is meertaligheid bovendien een voordeel, omdat bedrijven steeds vaker internationaal samenwerken."],
      ["Spreker", "Mijn advies aan scholen en werkgevers is dan ook: zie meertaligheid niet als een probleem, maar als een kans. Moedig mensen aan om hun moedertaal te blijven gebruiken, terwijl ze ook de Nederlandse taal goed leren. Dank u wel voor uw aandacht."],
    ],
    questions: [
      mc("Wat is de hoofdboodschap van de spreker?", ["Meertaligheid is vooral een probleem op school.", "Meertaligheid moet als een kans worden gezien.", "Kinderen moeten alleen Nederlands spreken."], 1, "The final advice: see multilingualism as an opportunity.", { focus: "MAIN_IDEA" }),
      mc("Wat laat recent onderzoek zien over meertalige kinderen?", ["Ze lopen altijd een achterstand op.", "Ze kunnen vaak beter schakelen tussen taken.", "Ze spreken minder goed Nederlands."], 1, "'…kunnen vaak beter schakelen tussen taken.'", { focus: "DETAIL" }),
      mc("Welk nadeel noemt de spreker voor meertalige kinderen?", ["Ze zijn langzamer in rekenen.", "Ze hebben in het begin soms een kleinere woordenschat per taal.", "Ze maken meer fouten op het werk."], 1, "'…een kleinere woordenschat in elke taal afzonderlijk.'", { focus: "DETAIL" }),
      mc("Wat adviseert de spreker aan scholen en werkgevers?", ["Mensen aanmoedigen hun moedertaal te blijven gebruiken", "Alleen Nederlands toestaan op de werkvloer", "Meertalige mensen niet aannemen"], 0, "'Moedig mensen aan om hun moedertaal te blijven gebruiken…'", { focus: "DETAIL" }),
    ],
  },
];

export const NT2_WRITING: Nt2Writing[] = [
  // ───────── Programma I (B1) ─────────
  {
    slug: "nt2-b1-bericht-afspraak-verzetten", title: "Message: move an appointment", level: "B1",
    taskType: "MESSAGE", register: "NEUTRAL", minWords: 40, maxWords: 80,
    instructions: "You have an appointment with your child's teacher on Thursday at 15:00, but your work meeting runs late. Write a short message to the teacher. Say why you can't come, suggest another day and time, and ask whether that is possible.",
  },
  {
    slug: "nt2-b1-email-huurder-klacht", title: "Email: noise from the neighbours", level: "B1",
    taskType: "EMAIL", register: "FORMAL", minWords: 80, maxWords: 130,
    instructions: "Your upstairs neighbours make a lot of noise late at night. You have already spoken to them once. Write an email to the housing association (woningcorporatie). Describe the problem, say what you have done already and what you would like them to do.",
  },
  {
    slug: "nt2-b1-opinie-openbaar-vervoer", title: "Opinion: free public transport for students", level: "B1",
    taskType: "OPINION", register: "NEUTRAL", minWords: 100, maxWords: 160,
    instructions: "Do you think public transport should be free for students? Give your opinion with at least two arguments and one example from your own experience. Finish with a short conclusion.",
  },
  // ───────── Programma II (B2) ─────────
  {
    slug: "nt2-b2-brief-sollicitatie", title: "Application letter for a job", level: "B2",
    taskType: "EMAIL", register: "FORMAL", minWords: 150, maxWords: 220,
    instructions: "You read a vacancy for a customer service employee (klantenservicemedewerker) at an energy company. Write an application letter. Introduce yourself, explain your relevant experience and motivation, mention your language skills and suggest a time for an interview.",
  },
  {
    slug: "nt2-b2-klacht-bestelling", title: "Complaint about a delayed delivery", level: "B2",
    taskType: "COMPLAINT", register: "FORMAL", minWords: 130, maxWords: 200,
    instructions: "Three weeks ago you ordered a washing machine from an online shop. It has still not arrived, and customer service has given you contradictory information. Write a formal complaint. Describe the facts in order, explain the consequences for you and say clearly what you expect (delivery or refund) and by when.",
  },
  {
    slug: "nt2-b2-betoog-thuiswerken", title: "Essay: should working from home be a right?", level: "B2",
    taskType: "ESSAY", register: "NEUTRAL", minWords: 200, maxWords: 300,
    instructions: "Some people argue that employees should have a legal right to work from home. Write a structured essay: introduce the topic, give arguments for and against, give your own opinion and end with a conclusion. Use connecting words (bovendien, daarentegen, kortom) to guide the reader.",
  },
];
