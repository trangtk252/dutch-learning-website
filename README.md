# Leer Nederlands

A full-stack Dutch learning app for English speakers, built for the path **A2 → B1** and onward to **B2/C1** and the **NT2 Staatsexamen**.

It combines spaced-repetition vocabulary, an AI speaking partner, listening and reading practice with tap-to-translate, writing feedback, a grammar library, NT2 practice exams, a personal mistake tracker, and a daily plan built from your goals and performance.

> Level indicators in the app are **practice estimates**. The app never claims to determine an official CEFR level or NT2 result.

---

## Try it in your browser (GitHub Codespaces)

No installation needed — everything runs in a cloud machine from GitHub:

1. On the repository page, click **Code → Codespaces → Create codespace on this branch**.
2. Wait a few minutes the first time: the codespace installs dependencies, starts a PostgreSQL database and adds the sample content (see the terminal).
3. The website opens in a new browser tab when it's ready. If it doesn't, open the **PORTS** tab and click the globe icon next to port **3000** (“Website”).
4. Log in with **demo@example.com / leerdutch123**, or create your own account.

To restart the website later (for example after reopening a stopped codespace), run `bash .devcontainer/start.sh` in the terminal. The setup lives in `.devcontainer/`; the AI tutor runs in offline mode unless you add `AI_PROVIDER="anthropic"` and `AI_API_KEY` to `.env`.

## Quick start (your own computer)

Requirements: Node.js 20.9+ and PostgreSQL 14+.

```bash
cp .env.example .env          # then set DATABASE_URL and BETTER_AUTH_SECRET (openssl rand -base64 32)
npm install                   # also runs `prisma generate`
npm run db:migrate            # create the schema
npm run db:seed               # curated content + demo learner
npm run dev                   # http://localhost:3000
```

Demo learner: **demo@example.com / leerdutch123** (A2 → B1, preparing for NT2 Programma I, with some history).
Emails in `ADMIN_EMAILS` get the admin role on sign-up (blog CMS at `/admin/blog`).

The app runs fully **offline by default** (`AI_PROVIDER=mock`): AI features fall back to a small, clearly labelled rule-based checker so every flow works without an API key. Set `AI_PROVIDER=anthropic` and `AI_API_KEY` to get real AI tutoring (Claude; model set by `AI_MODEL`).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server / production build / serve |
| `npm run lint` | ESLint (Next + React Compiler rules) |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm test` | Vitest unit tests (SRS, plan engine, grading, rule checker, dates, rate limit) |
| `npm run test:e2e` | Playwright end-to-end tests (needs a seeded DB; starts `npm run dev` if needed) |
| `npm run db:migrate` / `db:seed` / `db:reset` | Prisma migrations and seed |

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) + TypeScript |
| UI | Tailwind CSS v4 with design tokens (light/dark), lucide icons, accessible custom components |
| Database | PostgreSQL via Prisma 6 |
| Auth | Better Auth — email/password, DB sessions, password reset; `Account` table ready for OAuth |
| Validation | Zod (forms, server actions, AI output, environment) |
| SRS | FSRS via `ts-fsrs` |
| AI | Provider abstraction; Anthropic SDK (structured outputs) or offline mock |
| Voice | Provider abstraction; browser Web Speech API (STT) and speechSynthesis (TTS) by default |
| Tests | Vitest + Playwright |

---

## Architecture

```
src/
  app/
    (public)/        landing page, blog (SEO metadata, JSON-LD)
    (auth)/          login, signup, forgot/reset password
    onboarding/      4-step onboarding wizard
    (app)/           protected app: dashboard, vocabulary, speaking, listening, reading,
                     writing, grammar, nt2, mistakes, progress, settings, search, admin
    api/             auth handler, CSV/JSON exports
  components/        UI primitives, quiz runner, clickable text + word popover, voice, charts
  lib/
    ai/              provider interface, providers (anthropic, mock), prompts, Zod schemas,
                     services: generateVocabularyEntry, analyzeDutchSentence, correctDutchText,
                     generateReadingExercise, generateListeningQuestions, evaluateSpeaking,
                     generateConversationResponse, recommendNextLesson, analyzeUserMistakes
    speech/          STT/TTS provider interfaces + browser implementations
    srs/             FSRS wrapper (pure)
    learning/        daily plan engine (pure, unit-tested)
    quiz/            grading (pure) — correct answers never reach the client
    dutch/           tokenizer, normalisation, offline rule checker
    server/          DB-backed domain services (vocabulary, stats, progress, mistakes, retention…)
    actions/         shared server actions (quiz submission)
  proxy.ts           optimistic auth redirect (real checks happen in every page/action)
prisma/
  schema.prisma      relational schema (~45 models)
  seed/              curated words, grammar, readings, listening scripts, media, exams, blog
```

**Principles**

- *Server-first.* Pages are Server Components that query Prisma directly; mutations are Zod-validated Server Actions that re-check the session and ownership (`userId` in every `where`).
- *Pure core logic.* Scheduling (FSRS), the daily plan, quiz grading and the rule checker are pure functions with unit tests.
- *AI behind interfaces.* UI never talks to a model. Services in `lib/ai/services` build prompts (`lib/ai/prompts.ts`), request **structured JSON** validated by Zod (`lib/ai/schemas.ts`), and are re-validated (e.g. score clamping, malformed-question filtering) before anything is saved.
- *Human content wins.* Dictionary entries, texts and grammar have `source` (HUMAN/AI/IMPORTED) and `verified`. Lookups prefer verified entries; AI only fills gaps; verified entries can't be overwritten by learners; AI content is labelled in the UI.

### AI providers

`LanguageModelProvider.generateStructured({ system, messages, schema, mock })`

- `anthropic` — official SDK, `beta.messages.parse` with Zod output format, prompt caching on static system prompts, server-side refusal fallbacks enabled, typed error handling (rate limit / unavailable / refused).
- `mock` — deterministic offline output supplied by each service (dictionary lookups, rule checker, scripted conversation turns). A banner in the app makes clear when it is active.

To add a provider, implement the interface in `lib/ai/providers/` and add it to `lib/ai/index.ts` and the `AI_PROVIDER` enum in `lib/env.ts`.

AI-backed actions are rate-limited per user (`lib/server/rate-limit.ts`; in-memory — use Redis or a DB table when running multiple instances).

### Voice pipeline

```
SpeechRecognitionProvider (STT) → generateConversationResponse (LLM)
   → corrections of the learner's last message (same structured response)
   → TextToSpeechProvider (TTS)
```

Each stage is configured independently (`SPEECH_TO_TEXT_PROVIDER`, `AI_PROVIDER`, `TEXT_TO_SPEECH_PROVIDER`). The default `browser` providers run in the learner's browser, so **no audio reaches our server and none is stored**. Server-side interfaces (`ServerSpeechToText`, `ServerTextToSpeech` in `lib/speech/types.ts`) are defined for plugging in cloud STT/TTS later; secrets stay server-side.

### Learning engine

`lib/learning/plan.ts` answers *"what should I study today?"* from: due and new cards, daily minutes, preferred activities, self-reported weaknesses, recent listening/reading/grammar accuracy, days since each skill was practised, recurring mistake categories and the NT2 exam date. Vocabulary reviews come first (capped at 40% of the session); the remaining time is shared by weight over up to four skills, each with a human-readable reason. Recommended grammar lessons come from the learner's most frequent recent mistake category (`GrammarTopic.remedies`).

### Data model highlights

- `VocabularyWord` (shared dictionary) with `VerbForms`, `AdjectiveForms`, `WordExample`, `WordCollocation`, `WordRelation`, `Topic` (m2m).
- `VocabularyCard` (learner's card + FSRS state) and an immutable `Review` log (usable for FSRS parameter optimisation).
- `Question`/`AnswerOption` shared by readings, listening, grammar and mock-exam parts; `Attempt`/`QuestionResponse` record every attempt (practice or exam).
- `Conversation` → `ConversationMessage` → `SpeakingCorrection`, plus `SpeakingFeedback`.
- `WritingPrompt`, `WritingSubmission`, `WritingFeedback`, `WritingCorrection`.
- `UserMistake` — one row per mistake from any skill; aggregated on *My mistakes*.
- `MockExam` → `MockExamPart` (stimulus = reading/listening) → `Question`.
- `StudySession` + `DailyActivity` (streaks, goals, XP), `Achievement`/`UserAchievement`.
- `BlogPost`, `BlogCategory`, `BlogTag` with SEO fields.

---

## Privacy & data ownership

- **Export**: Settings → *Export all data (JSON)*; vocabulary as CSV.
- **Delete**: selected learning history (vocabulary, conversations, writing, mistakes, results, activity) or the whole account (cascading deletes).
- **Conversations**: no audio is stored. Transcripts are kept for a configurable number of days, or deleted immediately when a conversation ends (the report is kept). Expired transcripts are purged automatically.
- Secrets are only read server-side (`lib/env.ts` is `server-only`); nothing secret is sent to the browser.

## Accessibility

Semantic landmarks and headings, skip link, visible focus styles, labelled form controls with hint/error wiring, keyboard-navigable clickable text (arrow keys between words), keyboard shortcuts for flashcards, transcripts doubling as captions, screen-reader tables behind charts, `lang="nl"` on Dutch text, reduced-motion support, light/dark themes, adjustable text size (85–150%).

## Content & copyright

All readings, listening scripts, exercises and practice exams are **original**, written for this app — no NT2 exam questions or copyrighted articles are copied. Podcasts, films and series are **linked** to legitimate providers (broadcasters or the JustWatch availability guide); no audio or video is hosted or redistributed.

---

## Status & roadmap

**Phase 1 — Foundation (done):** architecture, schema, auth (signup/login/logout/reset), onboarding, dashboard & daily plan, vocabulary with FSRS + CSV import/export, AI/voice provider abstractions, seed content.

**Also implemented:** speaking tutor (voice + text, corrections, English help, reports), listening (TTS-voiced exercises, transcripts, question types incl. dictation and "select what you heard", podcasts, film & TV), reading (A2–C1, tap-to-translate, AI text generation), writing feedback, grammar library (17 topics), NT2 practice/exam modes with history, My Mistakes, progress & milestones, global search, blog + admin CMS, settings/privacy.

**Next steps**

1. Server-side STT/TTS providers (e.g. a cloud speech API) for consistent voices and pronunciation feedback; recorded audio for curated listening.
2. Content admin for words/readings/grammar and an AI-content review queue (mark verified).
3. More curated content per level, especially B2/C1 and listening; NT2 writing/speaking exam modes with timed prompts.
4. FSRS parameter optimisation per learner from the `Review` log.
5. Social login (Google/Apple via Better Auth), a real email provider, Redis-backed rate limiting.
6. Postgres full-text / `pg_trgm` search; PWA/offline reviews.

**Known limitations**

- The Anthropic provider is implemented against the official SDK but needs an API key to be exercised; development and tests use the offline provider.
- Browser TTS voice quality and availability vary by device; STT relies on the browser (best in Chrome/Edge, which use the vendor's cloud recognition).
- The offline rule checker covers only a handful of common error patterns by design.
