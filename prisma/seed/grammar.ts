import { fill, mc, tf, type SeedQuestion } from "./questions";

export interface SeedGrammarTopic {
  slug: string;
  title: string;
  area: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  summary: string;
  explanation: string;
  remedies: string[];
  examples: [string, string, string?][];
  mistakes: [string, string, string][]; // wrong, correct, explanation
  practice: SeedQuestion[];
  quiz: SeedQuestion[];
  words?: string[]; // lemmas from WORDS
}

const P = { set: "PRACTICE" as const, focus: "GRAMMAR" as const };
const Q = { set: "QUIZ" as const, focus: "GRAMMAR" as const };

export const GRAMMAR: SeedGrammarTopic[] = [
  {
    slug: "main-clause-word-order",
    title: "Word order in main clauses (verb second)",
    area: "WORD_ORDER",
    level: "A2",
    summary: "The conjugated verb is always the second element in a Dutch main clause — even when the sentence doesn't start with the subject.",
    remedies: ["WORD_ORDER"],
    explanation: `In a Dutch main clause the **conjugated verb is always in position 2**. Position 1 can be the subject, but also a time expression, a place, an object or a whole subordinate clause.

When something other than the subject comes first, the subject moves **after** the verb. This is called **inversion**.

| Position 1 | Verb | Subject | Rest |
|---|---|---|---|
| Ik | werk | — | morgen thuis. |
| Morgen | werk | ik | thuis. |
| Thuis | werk | ik | morgen. |

Other verbs (infinitives, past participles) go to the **end** of the clause:

- Ik **heb** gisteren een boek **gekocht**.
- Morgen **wil** ik vroeg **opstaan**.

English speakers often keep "subject–verb" order after a time word ("Tomorrow I work"). In Dutch that's wrong: *Morgen werk ik.*

**Useful order for the middle of the sentence:** time – manner – place (TMP): *Ik ga morgen met de trein naar Utrecht.*`,
    examples: [
      ["Vandaag ga ik naar de markt.", "Today I'm going to the market.", "Time first → inversion"],
      ["In Nederland fietsen veel mensen naar hun werk.", "In the Netherlands many people cycle to work.", "Place first → inversion"],
      ["Ik heb gisteren hard gewerkt.", "I worked hard yesterday.", "Participle at the end"],
      ["Volgend jaar wil ik naar Spanje gaan.", "Next year I want to go to Spain.", "Infinitive at the end"],
    ],
    mistakes: [
      ["Morgen ik ga naar school.", "Morgen ga ik naar school.", "After a time expression in position 1, the verb comes next and the subject follows it."],
      ["Ik heb gekocht een fiets.", "Ik heb een fiets gekocht.", "The past participle goes to the end of the clause."],
      ["Daarom ik blijf thuis.", "Daarom blijf ik thuis.", "'Daarom' takes position 1, so the verb must be second."],
    ],
    practice: [
      mc("Choose the correct sentence.", ["Om acht uur ik begin.", "Om acht uur begin ik.", "Om acht uur begin."], 1, "Time expression first → verb second → subject.", { ...P, errorCategory: "WORD_ORDER" }),
      fill("Morgen ___ ik naar de dokter. (gaan)", ["ga"], "Verb in position 2, conjugated for 'ik': ga.", { ...P, errorCategory: "WORD_ORDER" }),
      mc("Where does the participle go? 'Ik heb (1) mijn moeder (2) gisteren (3) gebeld.'", ["Position 1", "Position 2", "At the end, as written"], 2, "The participle 'gebeld' goes to the end: Ik heb mijn moeder gisteren gebeld.", { ...P, errorCategory: "WORD_ORDER" }),
    ],
    quiz: [
      mc("Which sentence is correct?", ["In het weekend wij gaan wandelen.", "In het weekend gaan wij wandelen.", "In het weekend wij wandelen gaan."], 1, "Inversion after 'In het weekend'.", { ...Q, errorCategory: "WORD_ORDER" }),
      mc("Which sentence is correct?", ["Ik wil kopen een nieuwe jas.", "Ik wil een nieuwe jas kopen.", "Ik een nieuwe jas wil kopen."], 1, "The infinitive goes to the end.", { ...Q, errorCategory: "WORD_ORDER" }),
      tf("'Gisteren ik heb gewerkt' is correct Dutch.", false, "Correct: 'Gisteren heb ik gewerkt.'", { ...Q, errorCategory: "WORD_ORDER" }),
      fill("Daarom ___ ik vandaag thuis. (werken)", ["werk"], "'Daarom' is in position 1; the verb 'werk' comes second.", { ...Q, errorCategory: "WORD_ORDER" }),
    ],
    words: ["daarom", "meestal"],
  },
  {
    slug: "de-or-het",
    title: "De or het? Definite articles",
    area: "ARTICLES",
    level: "A2",
    summary: "Dutch has two definite articles: 'de' (common gender) and 'het' (neuter). All plurals take 'de'.",
    remedies: ["DE_HET", "ARTICLES"],
    explanation: `Every Dutch noun is either a **de-word** or a **het-word**. About two thirds of nouns are de-words. Always learn a noun **with its article**: *de tafel, het huis*.

**Always "de":**
- all **plurals**: *het huis → de huizen*
- most words for **people** and professions: *de man, de vrouw, de docent*
- words ending in **-heid, -ing, -tie, -teit, -ij**: *de vrijheid, de vergadering, de informatie*

**Always "het":**
- **diminutives** (-je, -tje, -pje): *het huisje, het meisje*
- **infinitives used as nouns**: *het eten, het leven*
- languages: *het Nederlands*
- words starting with **ge-, be-, ver-, ont-** (often, not always!): *het gesprek, het begin, het verhaal, het ontbijt*
- words ending in **-ment, -um, -isme**: *het document, het museum*

**Indefinite article:** always *een* — *een huis, een tafel*. Negation: *geen*.

**Demonstratives follow the article:**

| | near | far |
|---|---|---|
| de-word | deze tafel | die tafel |
| het-word | dit huis | dat huis |

The article also affects **adjective endings**: *een groot huis* (het) vs. *een grote tafel* (de).`,
    examples: [
      ["het meisje", "the girl", "Diminutive → het (even though it's a person)"],
      ["de vergadering", "the meeting", "-ing → de"],
      ["het gesprek", "the conversation", "ge- → het"],
      ["de boeken", "the books", "Plural → always de"],
    ],
    mistakes: [
      ["de huis", "het huis", "'Huis' is a het-word."],
      ["het boeken", "de boeken", "All plurals take 'de'."],
      ["dit tafel", "deze tafel", "'Tafel' is a de-word, so use 'deze'/'die'."],
    ],
    practice: [
      mc("___ meisje speelt buiten.", ["De", "Het"], 1, "Diminutives (-je) are always het-words.", { ...P, errorCategory: "DE_HET" }),
      mc("___ vergadering begint om tien uur.", ["De", "Het"], 0, "Words ending in -ing are de-words.", { ...P, errorCategory: "DE_HET" }),
      fill("Ik vind ___ huis erg mooi. (dit/deze)", ["dit"], "'Huis' is a het-word → dit.", { ...P, errorCategory: "DE_HET" }),
    ],
    quiz: [
      mc("Which is correct?", ["de kinderen", "het kinderen"], 0, "Plural → de.", { ...Q, errorCategory: "DE_HET" }),
      mc("Which is correct?", ["de informatie", "het informatie"], 0, "-tie → de.", { ...Q, errorCategory: "DE_HET" }),
      mc("Which is correct?", ["de Nederlands", "het Nederlands"], 1, "Languages are het-words.", { ...Q, errorCategory: "DE_HET" }),
      fill("Wil je ___ boek lenen? (die/dat)", ["dat"], "'Boek' is a het-word → dat.", { ...Q, errorCategory: "DE_HET" }),
      tf("All diminutives are het-words.", true, "Yes: het tafeltje, het huisje, het meisje.", { ...Q, errorCategory: "DE_HET" }),
    ],
    words: ["het huis", "het boek", "de taal"],
  },
  {
    slug: "plurals-and-diminutives",
    title: "Plurals and diminutives",
    area: "NOUNS",
    level: "A2",
    summary: "Most nouns form the plural with -en or -s. Diminutives end in -je, -tje, -pje, -etje or -kje and are always het-words.",
    remedies: ["PLURALS"],
    explanation: `## Plurals

**-en** is the most common ending: *de boom → de bomen, het boek → de boeken*.

Watch the **spelling rules**:
- A long vowel in an open syllable is written with one letter: *de straat → de straten*, *het jaar → de jaren*.
- A short vowel needs a double consonant: *de bus → de bussen*, *de pot → de potten*.
- **f → v** and **s → z** in many words: *de brief → de brieven*, *het huis → de huizen*.

**-s** is used after unstressed **-el, -em, -en, -er, -je** and for many loanwords: *de tafel → de tafels, de leraar → de leraren* (exception!), *de auto → de auto's* (apostrophe after a, i, o, u, y).

Some **irregular** plurals: *het kind → de kinderen, het ei → de eieren, de stad → de steden, het schip → de schepen*.

## Diminutives

Diminutives express smallness but also friendliness: *een kopje koffie*, *even een momentje*. They are **always het-words** and the plural is **-s**: *het huisje → de huisjes*.

| Ending | When | Example |
|---|---|---|
| -je | most words | huis → huisje |
| -tje | after a long vowel, -el, -en, -er | auto → autootje, tafel → tafeltje |
| -pje | after -m | boom → boompje |
| -etje | after a short vowel + l/m/n/ng/r | bal → balletje |
| -kje | after -ing (sometimes) | koning → koninkje |`,
    examples: [
      ["Ik heb twee kinderen.", "I have two children.", "Irregular plural"],
      ["Mag ik een kopje thee?", "May I have a cup of tea?", "Diminutive as friendly form"],
      ["De straten zijn hier smal.", "The streets are narrow here.", "Long vowel: one letter in the plural"],
    ],
    mistakes: [
      ["twee kinds", "twee kinderen", "'Kind' has the irregular plural 'kinderen'."],
      ["de bussen → de busen", "de bussen", "A short vowel keeps a double consonant in the plural."],
      ["de huisje", "het huisje", "Diminutives are always het-words."],
    ],
    practice: [
      fill("één fiets, twee ___", ["fietsen"], "fiets → fietsen.", { ...P, errorCategory: "PLURALS" }),
      fill("één brief, drie ___", ["brieven"], "f becomes v: brieven.", { ...P, errorCategory: "PLURALS" }),
      mc("Diminutive of 'boom'?", ["boomje", "boompje", "boometje"], 1, "After -m: -pje.", { ...P, errorCategory: "PLURALS" }),
    ],
    quiz: [
      fill("één stad, twee ___", ["steden"], "Irregular: de steden.", { ...Q, errorCategory: "PLURALS" }),
      fill("één auto, twee ___", ["auto's"], "-s with an apostrophe after a final vowel: auto's.", { ...Q, errorCategory: "PLURALS" }),
      mc("___ tafeltje is wit.", ["De", "Het"], 1, "Diminutive → het.", { ...Q, errorCategory: "DE_HET" }),
      fill("één man, twee ___", ["mannen"], "Short vowel → double consonant: mannen.", { ...Q, errorCategory: "PLURALS" }),
    ],
  },
  {
    slug: "personal-pronouns",
    title: "Personal pronouns: ik, mij, me…",
    area: "PRONOUNS",
    level: "A2",
    summary: "Dutch has stressed and unstressed forms of pronouns, and different forms for subject and object.",
    remedies: ["PRONOUNS"],
    explanation: `Dutch pronouns have a **stressed** form (used for emphasis or contrast) and an **unstressed** form (normal speech). The unstressed form is the default in everyday Dutch.

| | Subject (stressed / unstressed) | Object (stressed / unstressed) |
|---|---|---|
| 1 sg | ik | mij / me |
| 2 sg | jij / je | jou / je |
| 2 formal | u | u |
| 3 sg m | hij | hem |
| 3 sg f | zij / ze | haar |
| 3 sg n | het | het |
| 1 pl | wij / we | ons |
| 2 pl | jullie | jullie |
| 3 pl | zij / ze | hen, hun / ze |

**Tips**
- Use **u** with strangers, at the doctor or the municipality; **jij/je** with friends and colleagues (Dutch workplaces are often informal).
- For things, use **hem** for de-words and **het** for het-words: *Waar is de sleutel? Ik zie hem niet.*
- *Hen* (direct object, after prepositions) vs. *hun* (indirect object) is tricky even for Dutch speakers — in speech, **ze** is often the safe choice for people.`,
    examples: [
      ["Ik bel je morgen.", "I'll call you tomorrow.", "Unstressed object 'je'"],
      ["Wil je mij helpen? Nee, niet jou — hem!", "Will you help me? No, not you — him!", "Stressed forms for contrast"],
      ["Waar is mijn fiets? Ik kan hem niet vinden.", "Where's my bike? I can't find it.", "'hem' for a de-word thing"],
    ],
    mistakes: [
      ["Ik zie hij.", "Ik zie hem.", "After the verb as an object, use the object form 'hem'."],
      ["Ik geef hij een boek.", "Ik geef hem een boek.", "As an (indirect) object, use the object form 'hem'."],
      ["Het boek? Ik heb hem gelezen.", "Het boek? Ik heb het gelezen.", "'Boek' is a het-word, so refer to it with 'het'."],
    ],
    practice: [
      mc("Kun je ___ helpen? (me)", ["ik", "me", "mijn"], 1, "Object form: me / mij.", { ...P, errorCategory: "PRONOUNS" }),
      mc("Waar is de krant? Ik heb ___ niet gezien.", ["het", "hem", "haar"], 1, "'Krant' is a de-word → hem.", { ...P, errorCategory: "PRONOUNS" }),
    ],
    quiz: [
      mc("Ik geef ___ een cadeau. (to her)", ["zij", "haar", "ze haar"], 1, "Object form of 'zij' is 'haar'.", { ...Q, errorCategory: "PRONOUNS" }),
      mc("At the municipality you usually say:", ["Kun jij me helpen?", "Kunt u mij helpen?"], 1, "Formal situation → u.", { ...Q, errorCategory: "REGISTER" }),
      tf("'Het huis? Ik vind het mooi.' is correct.", true, "'Huis' is a het-word → het.", { ...Q, errorCategory: "PRONOUNS" }),
    ],
  },
  {
    slug: "present-tense",
    title: "The present tense",
    area: "VERBS",
    level: "A1",
    summary: "Stem + t for jij/u/hij; stem alone for ik; infinitive for plural. Plus important spelling rules.",
    remedies: ["VERB_CONJUGATION"],
    explanation: `**Find the stem:** take the infinitive and remove *-en*: *werken → werk*, *wonen → woon* (long vowel: double the letter), *zitten → zit* (no double consonant at the end), *leven → leef*, *reizen → reis* (v→f, z→s).

| | ending | werken | wonen |
|---|---|---|---|
| ik | stem | werk | woon |
| jij / je, u | stem + t | werkt | woont |
| hij / zij / het | stem + t | werkt | woont |
| wij, jullie, zij | infinitive | werken | wonen |

**Inversion with jij/je:** when *jij/je* comes after the verb, drop the *-t*: *Jij werkt* → *Werk jij?* (but *Werkt hij?*).

**No extra -t** if the stem already ends in *t*: *ik zit, jij zit, hij zit*.

Irregular: **zijn** (ben, bent, is, zijn), **hebben** (heb, hebt, heeft, hebben), **kunnen** (kan, kunt/kan), **willen** (wil, wilt/wil), **zullen** (zal, zult/zal), **mogen** (mag), **komen** (kom).`,
    examples: [
      ["Ik woon in Amsterdam.", "I live in Amsterdam."],
      ["Woon jij ook in Amsterdam?", "Do you live in Amsterdam too?", "No -t after inversion with jij"],
      ["Mijn zus heeft twee katten.", "My sister has two cats."],
    ],
    mistakes: [
      ["Werkt jij vandaag?", "Werk jij vandaag?", "When 'jij/je' follows the verb, the -t drops."],
      ["Ik woont in Delft.", "Ik woon in Delft.", "With 'ik' use the bare stem."],
      ["Hij hebt een auto.", "Hij heeft een auto.", "'Hebben' is irregular: hij heeft."],
    ],
    practice: [
      fill("Ik ___ (leven) in Nederland.", ["leef"], "Stem of leven: leef (v→f).", { ...P, errorCategory: "VERB_CONJUGATION" }),
      fill("___ (spreken) jij Engels?", ["Spreek", "spreek"], "Inversion with jij → no -t: Spreek jij…?", { ...P, errorCategory: "VERB_CONJUGATION" }),
      fill("Zij ___ (hebben) een nieuwe baan.", ["heeft"], "zij (she) heeft.", { ...P, errorCategory: "VERB_CONJUGATION" }),
    ],
    quiz: [
      fill("Wij ___ (wonen) in Utrecht.", ["wonen"], "Plural → infinitive.", { ...Q, errorCategory: "VERB_CONJUGATION" }),
      fill("Hij ___ (zitten) in de trein.", ["zit"], "Stem ends in t: no extra t.", { ...Q, errorCategory: "VERB_CONJUGATION" }),
      mc("Choose the correct form.", ["Kom jij morgen?", "Komt jij morgen?"], 0, "No -t after inversion with jij.", { ...Q, errorCategory: "VERB_CONJUGATION" }),
      fill("Ik ___ (reizen) graag.", ["reis"], "z → s at the end of the stem.", { ...Q, errorCategory: "VERB_CONJUGATION" }),
    ],
    words: ["werken", "wonen", "hebben", "zijn"],
  },
  {
    slug: "modal-verbs",
    title: "Modal verbs: kunnen, moeten, willen, mogen, zullen",
    area: "MODAL_VERBS",
    level: "A2",
    summary: "A modal verb is conjugated in position 2 and the main verb goes to the end as an infinitive — without 'te'.",
    remedies: ["MODAL_VERBS", "WORD_ORDER"],
    explanation: `| | kunnen | moeten | willen | mogen | zullen |
|---|---|---|---|---|---|
| ik | kan | moet | wil | mag | zal |
| jij/u | kunt / kan | moet | wilt / wil | mag | zult / zal |
| hij/zij | kan | moet | wil | mag | zal |
| wij/jullie/zij | kunnen | moeten | willen | mogen | zullen |
| past | kon/konden | moest/moesten | wilde/wilden | mocht/mochten | zou/zouden |

**Meaning**
- *kunnen* = can, be able to
- *moeten* = must, have to (*niet hoeven te* = don't have to!)
- *willen* = want
- *mogen* = may, be allowed to
- *zullen* = shall/will; *Zullen we…?* = Shall we…?

**Word order:** the modal is the conjugated verb (position 2), the infinitive goes to the **end**, **without "te"**: *Ik moet morgen werken.*

**Watch out:** "I don't have to" is **niet hoeven te**, not "niet moeten": *Je hoeft niet te komen* = You don't have to come. *Je moet niet komen* = You mustn't come.

In the perfect tense the modal becomes an infinitive too (double infinitive): *Ik heb niet kunnen komen.*`,
    examples: [
      ["Kun je me helpen?", "Can you help me?"],
      ["Je hoeft niet te betalen.", "You don't have to pay."],
      ["Mag ik hier parkeren?", "May I park here?"],
      ["Ik heb gisteren moeten werken.", "I had to work yesterday.", "Double infinitive"],
    ],
    mistakes: [
      ["Ik wil te leren Nederlands.", "Ik wil Nederlands leren.", "No 'te' after a modal, and the infinitive goes to the end."],
      ["Je moet niet komen. (meaning: you don't have to)", "Je hoeft niet te komen.", "'Niet hoeven te' = don't have to; 'niet moeten' = must not."],
      ["Ik kan niet gekomen.", "Ik kan niet komen.", "After a modal use the infinitive, not a participle."],
    ],
    practice: [
      mc("Choose the correct sentence.", ["Ik moet vandaag werken.", "Ik moet werken vandaag.", "Ik moet te werken vandaag."], 0, "Infinitive at the end, no 'te'.", { ...P, errorCategory: "MODAL_VERBS" }),
      fill("Je ___ niet te komen, het is niet verplicht.", ["hoeft"], "Don't have to = niet hoeven te.", { ...P, errorCategory: "MODAL_VERBS" }),
    ],
    quiz: [
      fill("___ (kunnen) jullie morgen komen?", ["Kunnen", "kunnen"], "Plural → kunnen.", { ...Q, errorCategory: "MODAL_VERBS" }),
      mc("'You may sit here' =", ["Je mag hier zitten.", "Je moet hier zitten.", "Je kan hier zitten."], 0, "mogen = may.", { ...Q, errorCategory: "MODAL_VERBS" }),
      tf("'Ik wil een koffie bestellen.' is correct.", true, "Modal + infinitive at the end.", { ...Q, errorCategory: "MODAL_VERBS" }),
    ],
  },
  {
    slug: "perfect-tense",
    title: "The perfect tense (voltooid deelwoord)",
    area: "PERFECT_TENSE",
    level: "A2",
    summary: "hebben/zijn + past participle at the end. Learn which verbs take 'zijn' and how to build participles with 't kofschip.",
    remedies: ["PERFECT_TENSE"],
    explanation: `The perfect tense is the **most common past tense in spoken Dutch**.

**Form:** *hebben* or *zijn* (conjugated, position 2) + **past participle** (at the end).

*Ik **heb** gisteren pizza **gegeten**. Wij **zijn** naar Gent **gegaan**.*

## Regular participles: ge + stem + t/d

Use **-t** if the stem ends in one of the consonants of **'t kofschip** (t, k, f, s, ch, p). Otherwise **-d**.

- werken → werk → **gewerkt** (k is in 't kofschip)
- wonen → woon → **gewoond**
- leven → leef → but the infinitive has v → **geleefd** (look at the infinitive's sound: v is not in 't kofschip)

No extra *ge-* for verbs that start with **be-, ge-, her-, ont-, ver-, er-**: *betalen → betaald, vertellen → verteld*.
Separable verbs put *ge-* after the prefix: *opbellen → **opgebeld***.

## Hebben or zijn?

Most verbs use **hebben**. **Zijn** is used with:
- verbs of **change of state**: *worden, sterven, groeien, beginnen, verhuizen*
- **zijn, blijven, gebeuren**
- verbs of **movement with a destination**: *Ik ben naar huis gefietst* — but *Ik heb vandaag veel gefietst* (no destination → hebben)
- *gaan* and *komen* always take **zijn**.

## Common irregular participles
gaan → gegaan · komen → gekomen · zijn → geweest · hebben → gehad · doen → gedaan · eten → gegeten · drinken → gedronken · zien → gezien · lezen → gelezen · schrijven → geschreven · denken → gedacht · kopen → gekocht · brengen → gebracht · vinden → gevonden`,
    examples: [
      ["Ik ben gisteren naar Amsterdam gegaan.", "I went to Amsterdam yesterday."],
      ["We hebben de hele dag gewerkt.", "We worked all day."],
      ["Ze is vorig jaar verhuisd.", "She moved last year.", "Change of state → zijn"],
      ["Heb je de huisarts al opgebeld?", "Have you called the GP yet?", "Separable: op-ge-beld"],
    ],
    mistakes: [
      ["Ik ben gisteren naar Amsterdam gaan.", "Ik ben gisteren naar Amsterdam gegaan.", "Use the past participle 'gegaan', not the infinitive."],
      ["Ik heb naar huis gegaan.", "Ik ben naar huis gegaan.", "'Gaan' takes 'zijn' in the perfect tense."],
      ["Ik heb gewerkd.", "Ik heb gewerkt.", "werk ends in k ('t kofschip) → -t."],
      ["Ik heb geopbeld.", "Ik heb opgebeld.", "With separable verbs 'ge-' goes between the prefix and the verb."],
    ],
    practice: [
      fill("Ik ___ gisteren naar de markt gegaan.", ["ben"], "gaan → zijn.", { ...P, errorCategory: "PERFECT_TENSE" }),
      fill("Wij hebben drie jaar in Delft ___ (wonen).", ["gewoond"], "woon → n not in 't kofschip → -d.", { ...P, errorCategory: "PERFECT_TENSE" }),
      fill("Hij heeft zijn moeder ___ (opbellen).", ["opgebeld"], "Separable: op + ge + beld.", { ...P, errorCategory: "PERFECT_TENSE" }),
      mc("Ik ___ de hele middag gefietst.", ["heb", "ben"], 0, "No destination → hebben.", { ...P, errorCategory: "PERFECT_TENSE" }),
    ],
    quiz: [
      fill("Wat heb je gisteren ___ (doen)?", ["gedaan"], "Irregular: gedaan.", { ...Q, errorCategory: "PERFECT_TENSE" }),
      mc("Choose the correct sentence.", ["Ze heeft verhuisd.", "Ze is verhuisd."], 1, "Verhuizen (change of place/state) → zijn.", { ...Q, errorCategory: "PERFECT_TENSE" }),
      fill("Ik heb de rekening al ___ (betalen).", ["betaald"], "be- verbs get no ge-: betaald.", { ...Q, errorCategory: "PERFECT_TENSE" }),
      fill("We zijn met de trein ___ (komen).", ["gekomen"], "Irregular: gekomen.", { ...Q, errorCategory: "PERFECT_TENSE" }),
      tf("'Ik heb gisteren gewerkt.' is correct.", true, "werk + t → gewerkt with hebben.", { ...Q, errorCategory: "PERFECT_TENSE" }),
    ],
    words: ["gaan", "komen", "blijven", "verhuizen", "opbellen"],
  },
  {
    slug: "imperfect-tense",
    title: "The simple past (imperfectum)",
    area: "IMPERFECT_TENSE",
    level: "B1",
    summary: "Used for stories, descriptions and habits in the past: regular verbs take -te(n) or -de(n).",
    remedies: ["PAST_TENSE"],
    explanation: `The **imperfectum** (o.v.t.) is used to **tell a story** or describe a **situation or habit** in the past. The perfect tense is used to say *that* something happened; the imperfectum to describe *how it was*.

*Ik **heb** vorig jaar in Spanje **gewoond**. Ik **woonde** in een klein dorp en **werkte** in een hotel.*

## Regular verbs
stem + **-te / -ten** if the stem ends in a 't kofschip consonant, otherwise **-de / -den**:

| | werken | wonen |
|---|---|---|
| ik/jij/hij | werkte | woonde |
| wij/jullie/zij | werkten | woonden |

## Important irregular verbs
zijn → was/waren · hebben → had/hadden · gaan → ging/gingen · komen → kwam/kwamen · doen → deed/deden · zien → zag/zagen · zeggen → zei/zeiden · kunnen → kon/konden · willen → wilde/wilden · moeten → moest/moesten · weten → wist/wisten · denken → dacht/dachten · lopen → liep/liepen · blijven → bleef/bleven

## Typical use
- Stories and narratives (*Er was eens…*)
- Descriptions: *Het was koud en het regende.*
- Habits: *Vroeger fietste ik elke dag naar school.*
- Polite requests: *Ik wilde graag een afspraak maken.*`,
    examples: [
      ["Toen ik klein was, woonde ik in Marokko.", "When I was little, I lived in Morocco."],
      ["Het regende en we hadden geen paraplu.", "It was raining and we didn't have an umbrella."],
      ["Ik wilde graag iets vragen.", "I'd like to ask something.", "Polite use"],
    ],
    mistakes: [
      ["Ik werkde in een hotel.", "Ik werkte in een hotel.", "werk ends in k → -te."],
      ["Wij woonde in Breda.", "Wij woonden in Breda.", "Plural → -den."],
      ["Gisteren gaate ik naar huis.", "Gisteren ging ik naar huis.", "'Gaan' is irregular: ging."],
    ],
    practice: [
      fill("Vroeger ___ (fietsen) ik elke dag.", ["fietste"], "fiets ends in s → -te.", { ...P, errorCategory: "PAST_TENSE" }),
      fill("Wij ___ (zijn) erg moe.", ["waren"], "zijn → was/waren.", { ...P, errorCategory: "PAST_TENSE" }),
    ],
    quiz: [
      fill("Zij ___ (wonen) toen in Gent.", ["woonde"], "woon → -de.", { ...Q, errorCategory: "PAST_TENSE" }),
      fill("Hij ___ (zeggen) niets.", ["zei"], "Irregular: zei.", { ...Q, errorCategory: "PAST_TENSE" }),
      mc("Which describes a past situation (background)?", ["Het was druk in de stad.", "Het is druk geweest in de stad."], 0, "Imperfectum for descriptions.", { ...Q, errorCategory: "PAST_TENSE" }),
    ],
  },
  {
    slug: "future",
    title: "Talking about the future: gaan and zullen",
    area: "FUTURE",
    level: "A2",
    summary: "Dutch often uses the present tense for the future. 'Gaan' + infinitive expresses plans; 'zullen' promises, predictions and suggestions.",
    remedies: ["VERB_CONJUGATION"],
    explanation: `**1. Present tense + time expression** — the most common way: *Ik **werk** morgen thuis.*

**2. gaan + infinitive** — plans and intentions: *We **gaan** in de zomer **verhuizen**.*

**3. zullen + infinitive** — promises, predictions, formal announcements: *Ik **zal** je helpen. Het **zal** morgen regenen.*

**Zullen we…?** = Shall we…? — a suggestion: *Zullen we koffie drinken?*

Word order is the same as with modal verbs: the conjugated verb in position 2, the infinitive at the end.`,
    examples: [
      ["Volgende week begin ik met een nieuwe cursus.", "Next week I'm starting a new course."],
      ["Ik ga vanavond koken.", "I'm going to cook tonight."],
      ["Ik zal het morgen opsturen.", "I'll send it tomorrow.", "Promise"],
      ["Zullen we om acht uur afspreken?", "Shall we meet at eight?"],
    ],
    mistakes: [
      ["Ik ga morgen te werken.", "Ik ga morgen werken.", "No 'te' after 'gaan' + infinitive."],
      ["Ik zal komen morgen.", "Ik zal morgen komen.", "The infinitive goes to the end."],
    ],
    practice: [
      mc("Shall we go to the cinema?", ["Zullen we naar de bioscoop gaan?", "Gaan we zullen naar de bioscoop?"], 0, "Zullen we + … + infinitive.", { ...P, errorCategory: "WORD_ORDER" }),
    ],
    quiz: [
      mc("Which is a promise?", ["Ik zal je morgen bellen.", "Ik bel je misschien."], 0, "zullen = promise.", Q),
      tf("'Ik ga morgen te koken' is correct.", false, "No 'te': Ik ga morgen koken.", { ...Q, errorCategory: "VERB_CONJUGATION" }),
    ],
  },
  {
    slug: "separable-verbs",
    title: "Separable verbs (scheidbare werkwoorden)",
    area: "SEPARABLE_VERBS",
    level: "A2",
    summary: "In main clauses the prefix moves to the end: 'Ik bel je op'. In subordinate clauses and with infinitives the verb stays together.",
    remedies: ["SEPARABLE_VERBS"],
    explanation: `Many verbs have a stressed prefix such as **op, af, aan, uit, in, mee, terug, over, toe**: *opbellen, afspreken, aankomen, uitleggen, meenemen*.

**Main clause (present/past):** the prefix goes to the **end of the clause**.
- *Ik **bel** je morgen **op**.*
- *De trein **kwam** om tien uur **aan**.*

**Together** when the verb is at the end:
- with a modal: *Ik wil je morgen **opbellen**.*
- in a subordinate clause: *…omdat ik je morgen **opbel**.*
- with *te*: *Ik probeer je **op te bellen**.* (te goes between!)
- participle: *Ik heb je **opgebeld**.* (ge goes between!)

**How do you know?** The stress is on the prefix: **OP**bellen (separable) vs. be**TA**len, ver**TEL**len (not separable). Prefixes *be-, ge-, her-, ont-, ver-, er-* never separate.`,
    examples: [
      ["Ik neem een paraplu mee.", "I'm taking an umbrella with me."],
      ["Hoe laat kom je aan?", "What time do you arrive?"],
      ["Vergeet niet de deur af te sluiten.", "Don't forget to lock the door.", "te between prefix and verb"],
      ["Ze heeft het goed uitgelegd.", "She explained it well."],
    ],
    mistakes: [
      ["Ik opbel je morgen.", "Ik bel je morgen op.", "In a main clause the prefix goes to the end."],
      ["Ik heb hem geopbeld.", "Ik heb hem opgebeld.", "'ge-' goes between the prefix and the verb."],
      ["Ik probeer te opbellen.", "Ik probeer op te bellen.", "'te' goes between the prefix and the verb."],
    ],
    practice: [
      mc("Choose the correct sentence (opbellen).", ["Ik opbel mijn moeder.", "Ik bel mijn moeder op.", "Ik bel op mijn moeder."], 1, "Prefix to the end of the clause.", { ...P, errorCategory: "SEPARABLE_VERBS" }),
      mc("Choose the correct sentence (afspreken).", ["We afspreken morgen.", "We spreken morgen af.", "We spreken af morgen."], 1, "The prefix 'af' goes to the end of the main clause.", { ...P, errorCategory: "SEPARABLE_VERBS" }),
      fill("Heb je het formulier al ___ (invullen)?", ["ingevuld"], "in + ge + vuld.", { ...P, errorCategory: "SEPARABLE_VERBS" }),
    ],
    quiz: [
      mc("…omdat ik je morgen ___.", ["bel op", "opbel"], 1, "Subordinate clause: the verb stays together at the end.", { ...Q, errorCategory: "SEPARABLE_VERBS" }),
      fill("Ik vergeet altijd de lamp uit ___ ___ (doen). Write two words.", ["te doen"], "uit + te + doen.", { ...Q, errorCategory: "SEPARABLE_VERBS" }),
      tf("'Betalen' is a separable verb.", false, "be- is never separable: ik betaal.", { ...Q, errorCategory: "SEPARABLE_VERBS" }),
    ],
    words: ["opbellen", "afspreken", "uitleggen", "invullen", "overstappen"],
  },
  {
    slug: "subordinate-clauses",
    title: "Subordinate clauses: verb to the end",
    area: "SUBORDINATE_CLAUSES",
    level: "B1",
    summary: "After omdat, dat, als, wanneer, terwijl, hoewel, of… all verbs go to the end of the clause.",
    remedies: ["SUBORDINATE_CLAUSES", "WORD_ORDER"],
    explanation: `A subordinate clause (bijzin) starts with a **subordinating conjunction**: *omdat, dat, als, wanneer, toen, terwijl, hoewel, of, zodat, nadat, voordat, totdat, sinds, zodra* — or a question word in an indirect question (*wie, wat, waar, hoe…*).

**Rule:** subject straight after the conjunction, **all verbs at the end**.

*Ik leer Nederlands, **omdat** ik in Nederland **woon**.*
*Hij zegt **dat** hij morgen niet **kan komen**.*
*Weet jij **waar** het station **is**?*

**Sentence starting with a subordinate clause:** the whole bijzin is position 1, so the main clause **starts with its verb** (inversion):

*Als het regent, **neem** ik de bus.*

**Order of verbs at the end:** with two verbs, both orders are often possible in Dutch: *…omdat ik het **heb gedaan / gedaan heb***.

**omdat vs. want:** same meaning, different word order! *want* is coordinating (normal order): *Ik blijf thuis, **want** ik **ben** ziek.* vs. *…**omdat** ik ziek **ben**.*`,
    examples: [
      ["Ik blijf thuis omdat ik ziek ben.", "I'm staying home because I'm ill."],
      ["Als je tijd hebt, kun je me bellen.", "If you have time, you can call me.", "Bijzin first → main clause starts with the verb"],
      ["Ik weet niet of hij komt.", "I don't know whether he's coming."],
      ["Hoewel het koud was, gingen we zwemmen.", "Although it was cold, we went swimming."],
    ],
    mistakes: [
      ["Ik blijf thuis omdat ik ben ziek.", "Ik blijf thuis omdat ik ziek ben.", "After 'omdat' the conjugated verb goes to the end."],
      ["Als het regent, ik neem de bus.", "Als het regent, neem ik de bus.", "After a bijzin in first position, the main clause starts with the verb."],
      ["Ik denk dat hij heeft gelijk.", "Ik denk dat hij gelijk heeft.", "After 'dat' the verb goes to the end."],
    ],
    practice: [
      mc("Choose the correct sentence.", ["Ik leer Nederlands omdat ik woon hier.", "Ik leer Nederlands omdat ik hier woon.", "Ik leer Nederlands omdat woon ik hier."], 1, "Verb at the end after omdat.", { ...P, errorCategory: "SUBORDINATE_CLAUSES" }),
      mc("Choose the correct sentence.", ["Als ik tijd heb, ik bel je.", "Als ik tijd heb, bel ik je."], 1, "Main clause after a bijzin starts with the verb.", { ...P, errorCategory: "SUBORDINATE_CLAUSES" }),
      mc("Ik ga niet mee, ___ ik moet werken.", ["omdat", "want"], 1, "Normal word order ('ik moet') → want.", { ...P, errorCategory: "SUBORDINATE_CLAUSES" }),
    ],
    quiz: [
      mc("Hij zegt dat…", ["hij is moe.", "hij moe is.", "is hij moe."], 1, "Verb to the end after 'dat'.", { ...Q, errorCategory: "SUBORDINATE_CLAUSES" }),
      mc("Weet je…", ["waar is de bibliotheek?", "waar de bibliotheek is?"], 1, "Indirect question → verb at the end.", { ...Q, errorCategory: "SUBORDINATE_CLAUSES" }),
      tf("'Omdat het regende, bleven we thuis.' is correct.", true, "Bijzin first, then the main clause starts with the verb 'bleven'.", { ...Q, errorCategory: "SUBORDINATE_CLAUSES" }),
      mc("Ik neem een jas mee, ___ het koud is.", ["want", "omdat"], 1, "Verb at the end ('koud is') → omdat.", { ...Q, errorCategory: "SUBORDINATE_CLAUSES" }),
    ],
    words: ["omdat", "want", "hoewel"],
  },
  {
    slug: "conjunctions",
    title: "Linking words: en, maar, want, dus, daarom",
    area: "CONJUNCTIONS",
    level: "B1",
    summary: "Coordinating conjunctions keep normal word order; adverbs like daarom and toen cause inversion; subordinating conjunctions send the verb to the end.",
    remedies: ["WORD_ORDER", "SUBORDINATE_CLAUSES"],
    explanation: `Linking words are essential for good writing and speaking (and for NT2 coherence!). They fall into three groups, each with its own word order.

**1. Coordinating — normal order (subject + verb):** *en, maar, of, want, dus*
- *Ik ben moe, **maar** ik **ga** toch naar de les.*
- *Het regent, **dus** ik **neem** de bus.* (In speech, *dus* sometimes causes inversion: *dus neem ik de bus* — both are accepted.)

**2. Adverbs — inversion (verb + subject):** *daarom, toen, daarna, bovendien, toch, dan, ook, eerst*
- *Het regent. **Daarom neem ik** de bus.*
- ***Daarna gingen** we eten.*

**3. Subordinating — verb to the end:** *omdat, als, dat, hoewel, terwijl, zodat, nadat*
- *Ik neem de bus, **omdat** het **regent**.*

**Useful for texts and opinions:** *ten eerste, ten tweede, bovendien (moreover), aan de ene kant… aan de andere kant, kortom (in short), tot slot (finally), volgens mij (in my view)*.`,
    examples: [
      ["Ik wil graag komen, maar ik heb geen tijd.", "I'd love to come, but I don't have time."],
      ["De trein had vertraging. Daarom kwam ik te laat.", "The train was delayed. That's why I was late."],
      ["Eerst doen we boodschappen, daarna gaan we koken.", "First we do the shopping, then we cook."],
    ],
    mistakes: [
      ["Daarom ik kom te laat.", "Daarom kom ik te laat.", "'Daarom' is an adverb → inversion."],
      ["Ik ben moe, want ik slecht heb geslapen.", "Ik ben moe, want ik heb slecht geslapen.", "'Want' keeps main-clause order."],
    ],
    practice: [
      mc("Het is mooi weer. ___ gaan we naar het strand.", ["Want", "Daarom", "Omdat"], 1, "Inversion 'gaan we' → daarom.", { ...P, errorCategory: "WORD_ORDER" }),
      mc("Ik blijf thuis, ___ ik ben ziek.", ["want", "omdat", "daarom"], 0, "Normal order 'ik ben' → want.", { ...P, errorCategory: "WORD_ORDER" }),
    ],
    quiz: [
      mc("Choose the correct sentence.", ["Bovendien het is te duur.", "Bovendien is het te duur."], 1, "Adverb → inversion.", { ...Q, errorCategory: "WORD_ORDER" }),
      tf("After 'maar' you use normal word order.", true, "maar is coordinating.", Q),
    ],
    words: ["daarom", "want", "omdat", "toch"],
  },
  {
    slug: "fixed-prepositions",
    title: "Prepositions and fixed verb combinations",
    area: "PREPOSITIONS",
    level: "B1",
    summary: "Many Dutch verbs and adjectives take a fixed preposition (wachten op, denken aan). Learn them as chunks.",
    remedies: ["PREPOSITIONS"],
    explanation: `Prepositions rarely translate one-to-one from English. Learn verbs, nouns and adjectives **with their preposition**.

**Common fixed combinations**

| Dutch | English |
|---|---|
| wachten **op** | wait **for** |
| denken **aan** | think **of/about** |
| houden **van** | love, like |
| zin hebben **in** | feel like |
| bang zijn **voor** | be afraid **of** |
| trots zijn **op** | be proud **of** |
| geïnteresseerd zijn **in** | be interested **in** |
| solliciteren **naar** | apply **for** |
| zorgen **voor** | take care **of** |
| kijken **naar** | look **at** |
| praten **over** | talk **about** |
| afhangen **van** | depend **on** |

**Time:** *op maandag, in januari, in 2024, om 8 uur, over een week (in a week's time), een week geleden (a week ago)*

**Place:** *in de stad, op school, op het werk, op het station, bij de bakker, bij mij thuis*

**er + preposition:** when the object is a thing, use *er* + preposition: *Ik wacht op de bus → Ik wacht erop. Waar denk je aan? → Ik denk eraan.*`,
    examples: [
      ["Ik wacht al twintig minuten op de bus.", "I've been waiting for the bus for twenty minutes."],
      ["Heb je zin in een kopje koffie?", "Do you feel like a cup of coffee?"],
      ["Ze is erg trots op haar dochter.", "She's very proud of her daughter."],
      ["Het hangt van het weer af.", "It depends on the weather."],
    ],
    mistakes: [
      ["Ik wacht voor de bus.", "Ik wacht op de bus.", "'Wachten' takes 'op'."],
      ["Ik denk over je.", "Ik denk aan je.", "Thinking of someone = denken aan."],
      ["Ik ben geïnteresseerd over muziek.", "Ik ben geïnteresseerd in muziek.", "'Geïnteresseerd' takes 'in'."],
    ],
    practice: [
      fill("Ik heb geen zin ___ werken.", ["in"], "zin hebben in.", { ...P, errorCategory: "PREPOSITIONS" }),
      fill("Ze is bang ___ honden.", ["voor"], "bang zijn voor.", { ...P, errorCategory: "PREPOSITIONS" }),
      fill("Ik solliciteer ___ een baan als kok.", ["naar"], "solliciteren naar.", { ...P, errorCategory: "PREPOSITIONS" }),
    ],
    quiz: [
      fill("Wij houden ___ fietsen.", ["van"], "houden van.", { ...Q, errorCategory: "PREPOSITIONS" }),
      fill("Ik kijk ___ de televisie.", ["naar"], "kijken naar.", { ...Q, errorCategory: "PREPOSITIONS" }),
      mc("'A week ago' =", ["een week geleden", "over een week", "voor een week"], 0, "geleden = ago.", { ...Q, errorCategory: "PREPOSITIONS" }),
      fill("Hij zorgt ___ zijn zieke moeder.", ["voor"], "zorgen voor.", { ...Q, errorCategory: "PREPOSITIONS" }),
    ],
    words: ["op", "er"],
  },
  {
    slug: "adjective-endings",
    title: "Adjective endings: groot or grote?",
    area: "ADJECTIVES",
    level: "A2",
    summary: "Before a noun, adjectives get -e — except with an indefinite het-word in the singular (een groot huis).",
    remedies: ["ADJECTIVE_ENDINGS"],
    explanation: `**After the verb** (predicative) → **no ending**: *Het huis is **groot**.*

**Before a noun** (attributive) → add **-e**, with **one exception**:

> No -e when the noun is a **het-word**, **singular**, and preceded by **een**, **geen**, **no article**, or words like *elk, ieder, veel, zo'n, welk*.

| | de-word | het-word |
|---|---|---|
| de/het/deze/dit/mijn… | de grot**e** tafel | het grot**e** huis |
| een / geen | een grot**e** tafel | een **groot** huis |
| plural | grot**e** tafels | grot**e** huizen |

**Spelling:** adding -e changes the syllable: *groot → grote* (one o), *dik → dikke* (double k), *lief → lieve* (f → v), *grijs → grijze*.

**Exceptions:** adjectives ending in **-en** (*gouden, open*) and materials like *plastic* never take -e. *Rechter / linker* are fixed forms.`,
    examples: [
      ["Ik woon in een klein huis.", "I live in a small house.", "een + het-word → no -e"],
      ["Het kleine huis is van mijn oma.", "The small house is my grandma's."],
      ["We hebben een nieuwe auto.", "We have a new car.", "de-word → -e"],
      ["Ik drink graag warme melk.", "I like drinking warm milk.", "de-word without article → -e"],
    ],
    mistakes: [
      ["een grote huis", "een groot huis", "Indefinite het-word in the singular → no -e."],
      ["de nieuw fiets", "de nieuwe fiets", "With 'de' always -e."],
      ["Het huis is grote.", "Het huis is groot.", "After the verb → no ending."],
    ],
    practice: [
      fill("Ik heb een ___ (mooi) boek gekocht.", ["mooi"], "een + het-word → no -e.", { ...P, errorCategory: "ADJECTIVE_ENDINGS" }),
      fill("Dat is een ___ (goed) vraag.", ["goede"], "vraag is a de-word → -e.", { ...P, errorCategory: "ADJECTIVE_ENDINGS" }),
      fill("Het ___ (oud) station wordt gerenoveerd.", ["oude"], "With 'het' → -e.", { ...P, errorCategory: "ADJECTIVE_ENDINGS" }),
    ],
    quiz: [
      mc("Which is correct?", ["een gezellig café", "een gezellige café"], 0, "Café is a het-word → no -e after een.", { ...Q, errorCategory: "ADJECTIVE_ENDINGS" }),
      mc("Which is correct?", ["de rustig straat", "de rustige straat"], 1, "With de → -e.", { ...Q, errorCategory: "ADJECTIVE_ENDINGS" }),
      fill("We zoeken een ___ (groot) appartement.", ["groot"], "appartement = het-word, een → no -e.", { ...Q, errorCategory: "ADJECTIVE_ENDINGS" }),
      fill("Ze heeft ___ (lief) kinderen.", ["lieve"], "Plural → -e; f → v.", { ...Q, errorCategory: "ADJECTIVE_ENDINGS" }),
    ],
    words: ["gezellig", "druk", "rustig"],
  },
  {
    slug: "relative-clauses",
    title: "Relative clauses: die, dat, wat and waar-",
    area: "RELATIVE_CLAUSES",
    level: "B1",
    summary: "Use 'die' for de-words and plurals, 'dat' for het-words. With prepositions use 'waar' + preposition (things) or preposition + 'wie' (people).",
    remedies: ["RELATIVE_CLAUSES", "SUBORDINATE_CLAUSES"],
    explanation: `A relative clause gives extra information about a noun. It's a subordinate clause, so **the verb goes to the end**.

| Antecedent | Relative pronoun |
|---|---|
| de-word (singular) | **die** — *de man **die** daar woont* |
| het-word (singular) | **dat** — *het huis **dat** ik koop* |
| plural | **die** — *de boeken **die** ik lees* |
| *alles, iets, niets, veel*, or a whole sentence | **wat** — *alles **wat** ik weet* |

**With a preposition**
- things: **waar + preposition** — *de stoel **waarop** ik zit*, *het bedrijf **waar** ik **voor** werk*
- people: **preposition + wie** — *de collega **met wie** ik werk*

**Commas:** use a comma for extra (non-restrictive) information: *Mijn broer, **die** in Gent woont, komt morgen.*`,
    examples: [
      ["De vrouw die naast ons woont, is arts.", "The woman who lives next to us is a doctor."],
      ["Het boek dat ik lees, is spannend.", "The book I'm reading is exciting."],
      ["Dat is alles wat ik weet.", "That's all I know."],
      ["Het bedrijf waar ik voor werk, zit in Utrecht.", "The company I work for is in Utrecht."],
    ],
    mistakes: [
      ["Het huis die ik huur…", "Het huis dat ik huur…", "'Huis' is a het-word → dat."],
      ["De man die woont daar…", "De man die daar woont…", "Relative clause → verb at the end."],
      ["Alles dat ik heb…", "Alles wat ik heb…", "After 'alles' use 'wat'."],
    ],
    practice: [
      mc("Het restaurant ___ we gisteren bezochten, was heel goed.", ["die", "dat", "wat"], 1, "restaurant = het-word.", { ...P, errorCategory: "RELATIVE_CLAUSES" }),
      mc("De collega's ___ ik werk, zijn aardig.", ["met wie", "waarmee", "die"], 0, "People + preposition → met wie.", { ...P, errorCategory: "RELATIVE_CLAUSES" }),
    ],
    quiz: [
      fill("De trein ___ net vertrok, ging naar Den Haag.", ["die"], "trein = de-word.", { ...Q, errorCategory: "RELATIVE_CLAUSES" }),
      fill("Is er iets ___ ik kan doen?", ["wat"], "After 'iets' → wat.", { ...Q, errorCategory: "RELATIVE_CLAUSES" }),
      mc("De pen ___ ik schrijf, is leeg.", ["waarmee", "met die", "met wie"], 0, "Thing + preposition → waarmee.", { ...Q, errorCategory: "RELATIVE_CLAUSES" }),
    ],
  },
  {
    slug: "passive-voice",
    title: "The passive voice (worden / zijn)",
    area: "PASSIVE_VOICE",
    level: "B2",
    summary: "Present/past passive with 'worden' + participle; perfect passive with 'zijn' + participle. Common in news and formal texts.",
    remedies: ["VERB_CONJUGATION"],
    explanation: `The passive focuses on the action, not on who does it. You'll see it a lot in **news, instructions and formal texts** — essential for NT2 reading.

| Tense | Form | Example |
|---|---|---|
| present | **wordt / worden** + participle | *Het huis **wordt** verkocht.* |
| simple past | **werd / werden** + participle | *Het huis **werd** verkocht.* |
| perfect | **is / zijn** + participle | *Het huis **is** verkocht.* |
| past perfect | **was / waren** + participle | *Het huis **was** verkocht.* |

The **agent** is introduced with **door**: *Het huis werd **door** een jong stel gekocht.*

**Note:** in the perfect passive, *geworden* is dropped: ~~is verkocht geworden~~ → *is verkocht*.

**Impersonal passive with er:** *Er wordt veel gefietst in Nederland.* (= People cycle a lot in the Netherlands.)

**Alternative:** in speech, Dutch often uses *men* or *ze* instead: *Ze gaan de weg repareren.*`,
    examples: [
      ["De brief wordt morgen verstuurd.", "The letter will be sent tomorrow."],
      ["De brug werd in 1932 gebouwd.", "The bridge was built in 1932."],
      ["Er wordt in Nederland veel koffie gedronken.", "A lot of coffee is drunk in the Netherlands."],
      ["Het probleem is opgelost.", "The problem has been solved."],
    ],
    mistakes: [
      ["Het huis is verkocht geworden.", "Het huis is verkocht.", "Drop 'geworden' in the perfect passive."],
      ["Het boek wordt geschreven van een bekende auteur.", "Het boek wordt geschreven door een bekende auteur.", "The agent is introduced with 'door'."],
    ],
    practice: [
      fill("De pakketten ___ (worden, present) morgen bezorgd.", ["worden"], "Plural subject → worden.", { ...P, errorCategory: "VERB_CONJUGATION" }),
      mc("The museum was opened in 2010:", ["Het museum werd in 2010 geopend.", "Het museum wordt in 2010 geopend."], 0, "Simple past → werd.", { ...P, errorCategory: "PAST_TENSE" }),
    ],
    quiz: [
      mc("The window has been broken:", ["Het raam is gebroken.", "Het raam is gebroken geworden."], 0, "No 'geworden'.", Q),
      fill("Het onderzoek werd uitgevoerd ___ de universiteit.", ["door"], "Agent → door.", { ...Q, errorCategory: "PREPOSITIONS" }),
    ],
  },
  {
    slug: "conditional-sentences",
    title: "Conditional sentences: als… and zou",
    area: "CONDITIONALS",
    level: "B1",
    summary: "Real conditions use 'als' + present; unreal or polite ones use 'zou/zouden' + infinitive.",
    remedies: ["SUBORDINATE_CLAUSES", "VERB_CONJUGATION"],
    explanation: `**Real / possible conditions:** *als* + present tense.
*Als het morgen mooi weer **is**, **gaan** we naar het strand.*

**Unreal (hypothetical) conditions:** *als* + past tense or *zou*, and **zou/zouden + infinitive** in the main clause.
*Als ik meer tijd **had**, **zou** ik vaker **sporten**.*
*Als ik rijk **was**, **zou** ik een huis aan zee **kopen**.*

**Unreal past:** *Als ik het **had geweten**, **zou** ik het **hebben gedaan**.* (or: *had ik het gedaan*)

**Polite requests and advice with zou:**
- *Zou je het raam dicht kunnen doen?* (Could you close the window?)
- *Ik **zou** dat niet doen.* (I wouldn't do that.)
- *Ik zou graag een afspraak willen maken.* (I'd like to make an appointment.)

Remember: *als* starts a subordinate clause → verb at the end; if the *als*-clause comes first, the main clause starts with the verb.`,
    examples: [
      ["Als je vragen hebt, kun je me altijd mailen.", "If you have questions, you can always email me."],
      ["Als ik jou was, zou ik solliciteren.", "If I were you, I'd apply."],
      ["Zou u dit formulier willen invullen?", "Would you fill in this form?"],
    ],
    mistakes: [
      ["Als ik had tijd, ik zou komen.", "Als ik tijd had, zou ik komen.", "Verb at the end of the als-clause; inversion in the main clause."],
      ["Ik zou graag wil een afspraak maken.", "Ik zou graag een afspraak willen maken.", "After 'zou' the other verbs are infinitives at the end."],
    ],
    practice: [
      mc("If I were you, I would study more:", ["Als ik jou was, zou ik meer studeren.", "Als ik was jou, ik zou meer studeren."], 0, "Verb to the end in the als-clause; inversion afterwards.", { ...P, errorCategory: "SUBORDINATE_CLAUSES" }),
    ],
    quiz: [
      fill("___ je me kunnen helpen? (polite)", ["Zou", "zou"], "Polite request with zou.", { ...Q, errorCategory: "REGISTER" }),
      tf("'Als het regent, blijf ik thuis.' is correct.", true, "Real condition with als + present.", { ...Q, errorCategory: "SUBORDINATE_CLAUSES" }),
    ],
  },
  {
    slug: "niet-or-geen",
    title: "Negation: niet or geen?",
    area: "WORD_ORDER",
    level: "A2",
    summary: "Use 'geen' to negate a noun with 'een' or without an article; use 'niet' for everything else. Position of 'niet' depends on what you negate.",
    remedies: ["NEGATION"],
    explanation: `**geen** = "not a / not any / no". It replaces **een** or **no article** before a noun:
- *Ik heb **een** auto → Ik heb **geen** auto.*
- *Ik drink koffie → Ik drink **geen** koffie.*

**niet** is used for everything else: verbs, adjectives, adverbs, nouns with *de/het/mijn/dit*…
- *Ik werk **niet**.* · *Het is **niet** duur.* · *Dat is **niet** mijn fiets.*

**Position of niet**
- At the **end** of the main clause, but **before**: participles/infinitives, separable prefixes, adjectives after *zijn*, and most prepositional phrases.
  - *Ik kom morgen **niet**.*
  - *Ik heb het boek **niet** gelezen.*
  - *Ik bel je **niet** op.*
  - *Hij woont **niet** in Amsterdam.*
- To negate one specific element, put *niet* right before it: *Ik ga **niet** morgen, maar overmorgen.*`,
    examples: [
      ["Ik heb geen tijd.", "I don't have time."],
      ["Ze komt vandaag niet.", "She's not coming today."],
      ["Dit is niet mijn tas.", "This isn't my bag."],
    ],
    mistakes: [
      ["Ik heb niet een auto.", "Ik heb geen auto.", "Negating 'een + noun' → geen."],
      ["Ik heb niet tijd.", "Ik heb geen tijd.", "Noun without article → geen."],
      ["Ik heb gelezen het boek niet.", "Ik heb het boek niet gelezen.", "'Niet' comes before the participle at the end."],
    ],
    practice: [
      mc("Ik spreek ___ Duits.", ["niet", "geen"], 1, "Noun without article → geen.", { ...P, errorCategory: "NEGATION" }),
      mc("Het eten is ___ lekker.", ["niet", "geen"], 0, "Adjective → niet.", { ...P, errorCategory: "NEGATION" }),
    ],
    quiz: [
      mc("Choose the correct sentence.", ["Ik heb het niet gedaan.", "Ik heb het gedaan niet."], 0, "niet before the participle.", { ...Q, errorCategory: "NEGATION" }),
      fill("We hebben ___ kinderen.", ["geen"], "Plural noun without article → geen.", { ...Q, errorCategory: "NEGATION" }),
      tf("'Ik ken niet de man.' is the neutral way to say 'I don't know the man'.", false, "Neutral: Ik ken de man niet.", { ...Q, errorCategory: "NEGATION" }),
    ],
  },
];
