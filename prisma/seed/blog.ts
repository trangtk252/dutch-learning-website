export interface SeedPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  level?: "A2" | "B1" | "B2" | "C1";
  readingMinutes: number;
  body: string;
}

export const POSTS: SeedPost[] = [
  {
    slug: "from-a2-to-b1-realistic-plan",
    title: "From A2 to B1: a realistic plan",
    excerpt: "What actually changes between A2 and B1, how long it usually takes, and a weekly routine that gets you there.",
    category: "learning-dutch",
    tags: ["cefr", "study-plan", "b1"],
    level: "A2",
    readingMinutes: 6,
    body: `## What changes between A2 and B1?

At **A2** you can handle simple, routine situations: shopping, introducing yourself, describing your day in short sentences. At **B1** you can deal with most situations you'll meet living in the Netherlands or Belgium, talk about experiences and plans, give opinions with reasons, and understand the main points of clear standard speech.

In practice, the jump to B1 means three things:

1. **More vocabulary** — roughly from 1,000–1,500 words to 2,500–3,000 words you recognise.
2. **Longer sentences** — subordinate clauses (*omdat, dat, als*), linking words and the past tenses.
3. **Spontaneity** — reacting without preparing every sentence in your head.

## How long does it take?

It varies enormously with your starting point, other languages you speak and how much Dutch you use daily. Language schools often estimate **several hundred hours** of study and practice between A2 and B1. That sounds like a lot, but 30–45 minutes every day plus some real-life Dutch adds up quickly. Consistency beats intensity.

## A weekly routine (about 30 minutes a day)

| Day | Focus |
|---|---|
| Every day | 10 min vocabulary reviews (spaced repetition) |
| Mon / Thu | Speaking: one 10-minute conversation on an everyday topic |
| Tue / Fri | Listening: one short exercise + a few minutes of Jeugdjournaal |
| Wed | Reading + grammar point of the week |
| Sat | Writing: a short email or message (50–100 words) |
| Sun | Review your *My mistakes* page and redo one grammar quiz |

## Three habits that make the biggest difference

- **Learn words in context.** Save words from texts you actually read, together with the sentence.
- **Track your mistakes.** If you keep putting the verb in the wrong place after *omdat*, that's your grammar topic for the week.
- **Speak before you feel ready.** Fluency only grows by speaking. Mistakes are information, not failure.

> Remember: level labels are rough guides. Use them to choose material, not to judge yourself.`,
  },
  {
    slug: "de-or-het-tips",
    title: "De or het? Seven tips that really help",
    excerpt: "There's no perfect rule, but these patterns cover a large share of nouns — and a memory technique for the rest.",
    category: "grammar",
    tags: ["articles", "de-het", "memory"],
    level: "A2",
    readingMinutes: 5,
    body: `Even advanced learners still look up articles. Here's how to get most of them right.

## 1. Always learn nouns with their article
Never learn *tafel* — learn **de tafel**. Our vocabulary cards always show the article for this reason.

## 2. Plurals are always "de"
*het boek → de boeken*. One less thing to worry about.

## 3. Diminutives are always "het"
*de tafel → het tafeltje*, *de vrouw → het vrouwtje*. Even *het meisje* (the girl).

## 4. Endings that signal "de"
**-heid, -ing, -tie, -sie, -teit, -ij, -nis** (mostly): *de vrijheid, de vergadering, de situatie, de universiteit, de bakkerij*.

## 5. Endings and prefixes that signal "het"
**-ment, -um, -isme** and many words starting with **ge-, be-, ver-, ont-**: *het document, het museum, het gesprek, het begin, het verhaal, het ontbijt*. (Exceptions exist: *de gedachte, de verhuizing*.)

## 6. Languages, metals and infinitives are "het"
*het Nederlands, het goud, het eten, het zwemmen*.

## 7. Use colour or images for the rest
Many learners imagine de-words in one colour and het-words in another, or picture het-words inside a little house (*het huis*). Silly images stick.

## Why it matters
The article affects **adjective endings** (*een groot huis* vs. *een grote tafel*), **demonstratives** (*dit/deze*) and **relative pronouns** (*dat/die*). So it's worth the effort — but don't let it stop you from speaking. People will understand you perfectly with the wrong article.`,
  },
  {
    slug: "common-mistakes-english-speakers",
    title: "10 common mistakes English speakers make in Dutch",
    excerpt: "Word order, 'niet' vs 'geen', false friends and more — with quick fixes.",
    category: "common-mistakes",
    tags: ["mistakes", "word-order", "false-friends"],
    level: "B1",
    readingMinutes: 7,
    body: `## 1. Forgetting inversion
❌ *Morgen ik ga naar Utrecht.* ✅ *Morgen **ga ik** naar Utrecht.* The verb is always second.

## 2. Verb not at the end after *omdat / dat / als*
❌ *…omdat ik ben moe.* ✅ *…omdat ik moe **ben**.*

## 3. Using the infinitive in the perfect tense
❌ *Ik ben naar huis gaan.* ✅ *Ik ben naar huis **gegaan**.*

## 4. *Hebben* instead of *zijn*
❌ *Ik heb verhuisd.* ✅ *Ik **ben** verhuisd.* Verbs of movement to a place and change of state use *zijn*.

## 5. *Niet een* instead of *geen*
❌ *Ik heb niet een auto.* ✅ *Ik heb **geen** auto.*

## 6. Translating "I don't have to" as *ik moet niet*
❌ *Je moet niet komen* (= you mustn't come!). ✅ *Je **hoeft niet te** komen.*

## 7. False friends
- *eventueel* = possibly (not "eventually" → *uiteindelijk*)
- *actueel* = current, topical (not "actual" → *werkelijk*)
- *bellen* = to call (not "bells")
- *het milieu* = the environment
- *slim* = clever (not "slim" → *slank*)

## 8. Using *willen* + *te*
❌ *Ik wil te leren.* ✅ *Ik wil leren.* Modal verbs never take *te*.

## 9. Adjective endings with het-words
❌ *een grote huis* ✅ *een **groot** huis*.

## 10. Being too indirect — or too direct
Dutch is often more direct than English: *Kun je het raam dichtdoen?* is perfectly polite. But at the doctor or the municipality, use **u**. When in doubt, add *even* or *graag* to soften: *Mag ik **even** iets vragen?*

---

The app's **My mistakes** page tracks which of these you make most often, so you can practise the right grammar topic.`,
  },
  {
    slug: "nt2-exam-strategies",
    title: "NT2 Staatsexamen: strategies for each part",
    excerpt: "How to approach the reading, listening, writing and speaking parts of the NT2 exams — and how to practise effectively.",
    category: "nt2",
    tags: ["nt2", "exam", "strategy"],
    level: "B1",
    readingMinutes: 8,
    body: `The **Staatsexamen Nederlands als tweede taal (NT2)** has two programmes: **Programma I** (B1, for vocational education and many jobs) and **Programma II** (B2, for higher education and professional work). Each tests four skills separately: reading, listening, writing and speaking.

> Always check the official information from the exam organisation (DUO / College voor Toetsen en Examens) for the current format, rules and dates. The tips below are general study strategies, and our practice tests are original material, not real exam questions.

## Reading
- **Read the questions first**, then the text. You'll know what to look for.
- Many questions test **main idea**, **specific details** and the **writer's intention or text type** (inform, persuade, instruct).
- Don't get stuck on one unknown word — guess from context and move on.
- Practise with real-world texts: municipal letters, news articles, instructions, job ads.

## Listening
- Use the reading time to **predict** the content from the questions.
- Listen for **signal words**: *maar, toch, eigenlijk, daarom, ten eerste…* They often mark the key information.
- Practise with news for young people at first, then normal news and podcasts.

## Writing
- **Do exactly what the task asks** — answer every point. Task completion matters.
- Watch the **register**: *u* and *Met vriendelijke groet* in formal emails.
- Use **linking words** to show structure: *ten eerste, bovendien, daarom, kortom*.
- Reserve time to **check verbs**: position (V2, end of bijzin) and spelling (*-t/-d*).

## Speaking
- Speaking tasks often ask you to give your **opinion with reasons**, describe a situation, or give advice.
- Use a simple structure: **opinion → reason → example → conclusion**.
- Keep talking. A small mistake you correct yourself is fine — silence costs more.
- Record yourself and listen back. Our speaking tutor's NT2 mode gives you exam-style questions one at a time.

## A 6-week plan
1. Weeks 1–2: diagnose — take one practice exam per skill in *practice mode*.
2. Weeks 3–4: focus on your two weakest skills; daily vocabulary reviews.
3. Week 5: timed *exam mode* for each skill.
4. Week 6: light review, sleep well, no new material.`,
  },
  {
    slug: "spaced-repetition-explained",
    title: "Why spaced repetition works (and how to use it well)",
    excerpt: "The science behind flashcard scheduling, and practical rules to keep your reviews effective and short.",
    category: "study-strategies",
    tags: ["srs", "memory", "vocabulary"],
    readingMinutes: 5,
    body: `## The forgetting curve
We forget new information quickly — unless we review it. Each time you successfully recall a word, the memory becomes more stable, so the next review can wait longer. **Spaced repetition** schedules each card just before you're likely to forget it.

## How our scheduler works
We use **FSRS** (Free Spaced Repetition Scheduler), a modern algorithm that models two things for every card:

- **Stability** — how long the memory lasts.
- **Difficulty** — how hard this particular word is for you.

When you press **Again, Hard, Good** or **Easy**, FSRS updates both values and calculates the next review date, aiming for about **90% recall**.

## Rules for effective reviews
1. **Review every day**, even if only 5 minutes. A missed week creates a big backlog.
2. **Be honest.** If you hesitated a long time, press *Hard*. If you didn't know it, press *Again*.
3. **Add a sentence.** Words saved from a text with their context sentence are easier to remember.
4. **Say it out loud.** Pronounce the word (and the article!) before flipping the card.
5. **Limit new cards.** 5–15 new words a day is plenty; reviews grow over time.

## Vocabulary is more than flashcards
Flashcards build recognition. You also need to **meet words in context** (reading, listening) and **use them** (speaking, writing). That's why you can save words directly from texts and conversations in this app.`,
  },
  {
    slug: "gezellig-and-other-untranslatable-words",
    title: "Gezellig, uitwaaien, lekker: Dutch words that don't translate",
    excerpt: "A short tour of Dutch words that tell you something about the culture.",
    category: "culture",
    tags: ["culture", "vocabulary"],
    level: "A2",
    readingMinutes: 4,
    body: `## Gezellig
The famous one. A *gezellige avond* is a warm, relaxed evening with good company. A café can be *gezellig*, a person can be *gezellig*, even a busy street can be *gezellig druk*. The opposite, *ongezellig*, is a real criticism.

## Uitwaaien
Literally "to blow out": going for a walk in windy weather (often at the beach) to clear your head. *We gaan even uitwaaien op het strand.*

## Lekker
Tasty — but also nice, pleasant, comfortable: *lekker weer* (nice weather), *lekker slapen* (sleep well), *lekker bezig!* (you're doing great!).

## Even
A small word that softens requests: *Mag ik even langs?* (May I just get past?) *Ik bel je even.* It makes requests sound friendly rather than demanding.

## Hè / toch
Tags at the end of a sentence asking for agreement: *Mooi weer, hè?* *Je komt toch ook?*

## Borrelen
To have drinks and snacks with friends or colleagues, often on Friday afternoon at work: *de vrijdagmiddagborrel*.

---

Tip: save these words to your vocabulary — then listen for them in podcasts and series. You'll hear them everywhere.`,
  },
  {
    slug: "best-free-resources",
    title: "The best free resources for learning Dutch",
    excerpt: "Legitimate, free sources for listening and reading practice at every level.",
    category: "resources",
    tags: ["resources", "listening", "reading"],
    readingMinutes: 4,
    body: `All of these are free to access legally (some may require a Dutch IP address for video). Availability can change.

## Listening & watching
- **NOS Jeugdjournaal** (nos.nl/jeugdjournaal) — news for children, A2–B1.
- **Het Klokhuis** (hetklokhuis.nl) — educational programmes, B1–B2.
- **NPO Start** (npostart.nl) — Dutch public TV; many programmes have Dutch subtitles.
- **NPO Radio 1 podcasts** — in-depth news podcasts, B2–C1.

## Reading
- **nos.nl** — clear news writing; read the article before watching the item.
- **Your local library** — many Dutch libraries have *Taalhuis* or *Taalcafé* programmes for practising Dutch, and books in *makkelijk lezen* (easy reading) editions.

## Practice with people
- **Taalcafés** and **taalmaatje** projects connect learners with volunteers.
- Ask colleagues to keep speaking Dutch with you, even when you struggle.

## In this app
Go to **Listening → Podcasts & series** for our curated list with level estimates and learning tips per source.`,
  },
];
