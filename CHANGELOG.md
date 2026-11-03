# Changelog

All notable changes to this project are recorded here, newest first.
This project is not under git, so this file is the change history.

Format: one section per day (`## YYYY-MM-DD`), grouped under
**Added / Changed / Fixed / Removed**. Each entry says what changed and
names the main files touched.

## 2026-11-03

### Changed
- Database moved from a local SQLite file to Postgres so the app can run on Vercel (which has no persistent disk;
  the build failed with "DATABASE_URL: expected string, received undefined"). Schema provider is now
  `postgresql` (with the Vercel `rhel-openssl-3.0.x` engine), one fresh migration `20261103000000_init_postgres`
  replaces the SQLite ones (kept in `prisma/_sqlite_migrations_backup/`); search is case-insensitive via
  `mode: "insensitive"` (`prisma/schema.prisma`, `prisma/migrations/`, `search/page.tsx`, `lib/server/vocab-query.ts`).
- Vercel build: `vercel-build` runs `prisma migrate deploy`, loads the shared content when the database is empty,
  creates the admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`, then `next build`; `next.config.ts` ships
  `prisma/dictionary.db` with the server functions; `engines.node >= 22.13` (`package.json`).
- `DEPLOY.md` rewritten for Vercel + Neon; `README.md` and `.env.example` updated (Postgres `DATABASE_URL`).
  Local development now needs a Postgres `DATABASE_URL` too. `prisma/dev.db` is no longer used by the app.

### Fixed
- `prisma/production-seed.db` contained leftover rows of a throwaway test account (session/account) and orphaned
  questions/transcript segments of deleted private listening items; removed.

### Removed
- Railway/Docker deployment files (`Dockerfile`, `.dockerignore`, `scripts/start.sh`) and
  `scripts/build-production-db.ts` (`db:build:production`); `production-seed.db` stays as the shared-content source.

### Added
- `npm run db:copy-seed` (`scripts/copy-sqlite-to-postgres.ts`): copies a SQLite file into Postgres (default
  `prisma/production-seed.db`; pass `prisma/dev.db` to move your own data). Skips existing and orphaned rows.
- The project is now a git repo, pushed to https://github.com/trangtk252/dutch-learning-website (branch `main`).
  The earlier "there is no git" note no longer applies. `.env`, `dev.db` and backups are not uploaded.
- Real accounts so a small group can test the app, each with their own data: sign up (with an invite code) and log
  in with email + password at `/signup` and `/login`; 30-day sessions stored in the existing `Session` table (the
  cookie holds a random token, the DB only its hash); passwords hashed with Node's built-in `scrypt` (no new
  dependency); login/sign-up attempts rate-limited in memory (`lib/session.ts`, `lib/auth/password.ts`,
  `lib/auth/rate-limit.ts`, `(public)/auth-actions.ts`, `(public)/auth-form.tsx`, `(public)/login/page.tsx`,
  `(public)/signup/page.tsx`). Vietnamese strings in `lib/i18n/dictionaries/vi/account.ts`.
- Log-out button next to the language/theme toggles in the sidebar and the mobile header
  (`components/logout-button.tsx`, `components/layout/app-shell.tsx`).
- New settings `INVITE_CODE` (sign-up code; in production sign-up is closed when it is not set), `ADMIN_EMAIL` (the
  only admin) and `ADMIN_PASSWORD` (creates that account on a fresh server) in `lib/env.ts` and `.env.example`
  (also fixed the old name in the email sender example).
- `npm run user:create -- <email> <password> ["Name"] [admin]` creates a user or resets a password
  (`scripts/create-user.ts`, `package.json`). The existing local learner (demo@example.com, "Michelle") has no
  password yet: run it once with that email to sign in to the old data. DB backup:
  `prisma/dev.db.backup-before-auth`.
- Deployment files for a host with a persistent disk (Railway/Fly): `Dockerfile`, `.dockerignore`,
  `scripts/start.sh` (copies the seed DB to the disk on first start, runs migrations, creates the admin, starts
  Next), `scripts/bootstrap-admin.ts`, and the step-by-step guide `DEPLOY.md`. Vercel is not suitable because the
  data is a SQLite file (no persistent disk there).
- `npm run db:build:production` (`scripts/build-production-db.ts`): copy of `dev.db` with all users and their data
  removed and only shared content kept (579 words, 18 grammar topics, 6 readings, 6 listening items, 6 writing
  prompts), written to `prisma/production-seed.db` (already built). `dev.db` is untouched.
- E2E: `tests/e2e/auth.spec.ts` (visitors are sent to login, wrong password, log in/out). E2E tests now log in as
  `e2e@example.com` / `e2e-password-123` (create with `user:create` and finish onboarding once; override with
  `E2E_EMAIL` / `E2E_PASSWORD`) (`tests/e2e/helpers.ts`). That test user was created in the local `dev.db`.

### Changed
- The app no longer treats "the oldest user" as the signed-in learner: every page and action uses the logged-in
  user, and visitors without a session go to `/login`; `getSession` returns null when signed out and
  `requireAdmin` really checks the admin role (`lib/session.ts`). The home page comment was updated
  (`(public)/page.tsx`).
- Deleting your account now also logs you out and returns to the login page; its confirmation text no longer says
  "You start over with a fresh profile" (`settings/actions.ts`, `settings/forms.tsx`, `vi/account.ts`).

### Fixed
- `.gitignore` now also excludes `prisma/*.backup-*` (personal data copies) and `prisma/dictionary-source/` (`.gitignore`).
- `.gitignore` excluded `prisma/*.db`, so a Railway upload would have skipped the dictionary and the seed database; the two
  files the app needs (`dictionary.db`, `production-seed.db`) are now allowed (`.gitignore`).

### Removed
- `tests/e2e/no-login.spec.ts` (the app now has a login).

## 2026-10-07

### Changed
- Dictionary submit button now reads "Search" (was "Look up", which wrapped onto two lines) (`src/app/(app)/dictionary/page.tsx`).


### Added
- Dutch-English / English-Dutch dictionary at `/dictionary` (in the nav under Vocabulary, also in More on mobile):
  a direction toggle, instant lookup, inflected forms resolve to the base word ("liep" -> "lopen"), plural /
  diminutive / verb principal parts / IPA, numbered senses with example sentences, prefix matches as "Relat
  words", and a "Save to flashcards" button per result (`src/app/(app)/dictionary/*`,
  `src/lib/server/dictionary-db.ts`, `layout/nav-items.ts`, `app-shell.tsx`, `more/page.tsx`).FOo
- The dictionary is a separate local SQLite file, `prisma/dictionary.db` (~43 MB, 146k entries), built from the
  Wiktionary export by kaikki.org (CC BY-SA 4.0, credited on the page). Build or rebuild it with
  `npm run db:build:dictionary` (`prisma/seed/dictionary-build.ts`; downloads the 256 MB export to
  `prisma/dictionary-source/` if missing, which can be deleted afterwards). Uses Node's built-in `node:sqlite`,
  so no new dependency. Your learning data (`dev.db`) is untouched.

## 2026-10-07

### Added
- Verb forms on the word page (`/vocabulary/[id]`): verbs now show their past tense (singular/plural) and past
  participle (PII), e.g. lopen → liep / liepen / gelopen, read from the local dictionary at display time (no
  DB change, so it covers existing verbs and starter decks). Verbs that have a full conjugation table keep that
  one. Verbs where Wiktionary lists no complete set (e.g. many separable verbs) show nothing extra
  (`getVerbPrincipalParts` in `lib/server/dictionary-db.ts`, `vocabulary/[id]/page.tsx`).

### Changed
- Dictionary moved up in the sidebar, directly under Today (`src/components/layout/nav-items.ts`).

## 2026-10-05

### Added
- Remove starter decks: a "Remove" button per level in the NT2 starter decks panel deletes your flashcards (and
  their review history) for that deck after a confirmation; the shared words stay, so "Add N words" re-adds them
  fresh later (`removeStarterDeckAction` in `vocabulary/actions.ts`, `vocabulary/starter-decks.tsx`).

### Added
- Learn new cards filter: the review page (`/vocabulary/review`) has "New from" (All / My own words / Starter
  decks) and "Level" (All / A2 / B1) chips that limit which new cards are introduced; due reviews are unaffected.
  "My own words" = words without a starter-deck topic; they have no level, so own + A2/B1 shows no new cards
  (`vocabulary/review/page.tsx`).

## 2026-10-03

### Added
- NT2 starter word decks: 143 A2 and 162 B1 words (nouns with de/het, verbs, adjectives, adverbs, prepositions,
  conjunctions), each with an English meaning and a Dutch example sentence (`prisma/seed/nt2-words*.ts`).
  Loaded into the shared dictionary with `npm run db:seed:words` (already run; tagged with topics `nt2-a2` /
  `nt2-b1`; existing entries are kept). The word lists were written for this project, not copied from a
  published list. DB backup: `prisma/dev.db.backup-before-starter-words`.
- Vocabulary page: "NT2 starter decks" panel with an "Add N words" button per level that creates flashcards for
  the words you don't have yet (`vocabulary/starter-decks.tsx`, `addStarterDeckAction` in `vocabulary/actions.ts`,
  `vocabulary/page.tsx`).

### Added
- Grammar page (under Vocabulary in the nav, also in More on mobile): `/grammar` lists topics filtered by NT2
  programme (Voorbereiding A2 / Programma I B1 / Programma II B2 / All); `/grammar/[slug]` shows the
  explanation, examples (with audio), common mistakes, a short quiz (scores feed My mistakes) and a "My notes"
  box you fill in yourself (`src/app/(app)/grammar/*`, `layout/nav-items.ts`, `app-shell.tsx`, `more/page.tsx`).
- New `GrammarNote` table for those notes (migration `20261003132109_grammar_notes`; DB backup:
  `prisma/dev.db.backup-before-grammar`).
- `npm run db:seed:grammar` (`prisma/seed/grammar-only.ts`) loads the 18 grammar topics without the demo user;
  already run. Restart `next dev` after the schema change so it picks up the new Prisma client.

### Fixed
- Words saved by tapping them in Lezen/Luisteren/etc. (`saveWordFromContextAction`) still used the offline AI
  stub ("AI-generated", word type "other", no example). `getOrCreateWord` (`lib/server/vocabulary.ts`) now uses
  the Wiktionary dictionary for every save path (the vocabulary quick-add calls it too) and refills empty or
  AI-generated entries. Existing entries uitleggen/gezellig/blij were refilled; DB backup:
  `prisma/dev.db.backup-before-dict-backfill`.

### Fixed
- Saving a word again after a failed dictionary lookup (e.g. "blij" saved as "(add meaning)") now re-runs
  the lookup and fills in the existing entry instead of reusing the empty one; dictionary requests retry
  once on rate limit/timeout (`vocabulary/actions.ts`, `lib/dutch/dictionary.ts`).

### Added

- Dictionary lookup when saving a word: the meaning, word type and an example sentence now co
me
  from the free English Wiktionary API (no key, no AI). New `src/lib/dutch/dictionary.ts`, used by
  `addWordAction` in `vocabulary/actions.ts`; the Meaning/Example fields in `vocabulary/quick-add.tsx`
  are now optional overrides. Nouns also get their article (de/het), plural and diminutive from the


  Wiktionary headword line. Falls back to "(add meaning)" if the word isn't found or offline.

### Removed
- Vocabulary CSV import/export: deleted `src/app/(app)/vocabulary/import`, `src/app/api/vocabulary/export`,
  `importCsvAction` in `vocabulary/actions.ts`, and the Import/Export buttons (`vocabulary/page.tsx`,
  `settings/forms.tsx`). "Export all data (JSON)" in settings is kept.
- "NT2-style" badges on Lezen/Luisteren/Schrijven list and detail pages.

### Changed
- AI turned off again (API did not work): `.env` back to `AI_PROVIDER="mock"`, key removed.
  New words are entered by hand: the vocabulary quick-add form now has Meaning and Example
  fields and creates the entry without an AI lookup (`vocabulary/quick-add.tsx`, `actions.ts`).
  Offline wording updated in `app-shell.tsx` and `lib/ai/services/vocabulary.ts`.

### Changed
- AI enrichment turned on: `.env` now has `AI_PROVIDER="anthropic"` with an API key set.

### Added
- NT2 structure for the four skills: programme tabs (Voorbereiding A2 / Programma I B1 /
  Programma II B2) and Staatsexamen-style section tabs on Lezen, Luisteren and Schrijven
  (`src/lib/nt2.ts`, `src/components/nt2-filter.tsx`, `reading|listening|writing/page.tsx`).
  Default programme comes from the learner's NT2 setting or level; NT2-style items sort first.
- Spreken: "NT2 Staatsexamen practice" form (task type × programme: Beschrijven, Mening geven,
  Reageren in een situatie, Advies & voor- en nadelen) with `startNt2SpeakingAction`
  (`speaking/page.tsx`, `speaking/actions.ts`, `lib/ai/services/conversation.ts`).
- New original NT2-style material: 6 readings, 6 listening items, 6 writing tasks for
  Programma I and II (`prisma/seed/nt2-content.ts`). Load with `npm run db:seed:nt2`
  (only adds this material; no demo user). Backup before seeding:
  `prisma/dev.db.backup-before-nt2-seed`.

### Changed
- Reading/Listening/Writing/Speaking pages renamed Lezen/Luisteren/Schrijven/Spreken and the
  old A2–C1 level filter replaced by the NT2 filter; "NT2 speaking" removed from the generic
  situation list (it has its own section now).

### Removed
- Blog, Grammar library and NT2 exam features: deleted `src/app/(public)/blog`,
  `src/app/(app)/admin` (blog admin), `src/app/(app)/grammar`, `src/app/(app)/nt2`.
- Their links and data hooks: nav (`nav-items.ts`, `app-shell.tsx`, `(app)/layout.tsx`),
  `more`, `practice`, public layout, search (`search/page.tsx`), dashboard
  (recommended lesson + mock-exam card), mistakes "Practise/Recommended" links,
  grammar/NT2 progress estimates (`lib/server/stats.ts`), grammar in the daily plan
  (`lib/learning/plan.ts` + test), grammar e2e test (`tests/e2e/learning.spec.ts`).
- Database tables/seed data for these were left untouched (unused); NT2 profile
  settings and "NT2-style" badges on reading/listening/writing remain.

## 2026-10-01

### Added
- Delete previous conversations from the Speaking list: a trash button on each
  card and a "Delete all" button (`src/app/(app)/speaking/page.tsx`,
  `delete-buttons.tsx`, `actions.ts`).
- Optional natural cloud voices (OpenAI `gpt-4o-mini-tts` or ElevenLabs) via
  `TEXT_TO_SPEECH_PROVIDER` + `TEXT_TO_SPEECH_API_KEY`: new `src/app/api/tts/route.ts`,
  `CloudTextToSpeech` in `src/lib/speech/browser.ts`, `src/lib/env.ts`,
  `src/lib/speech/types.ts`, `.env.example`. Falls back to the browser voice.

### Changed
- Text-to-speech now picks the most natural installed Dutch voice (neural /
  Premium / Enhanced / Google ranked above compact defaults) and speaks slightly
  more naturally (rate 0.95): `src/lib/speech/browser.ts`.

### Fixed
- Hydration warning caused by the Grammarly browser extension adding attributes
  to `<body>`: added `suppressHydrationWarning` in `src/app/layout.tsx`.

### Added
- `CHANGELOG.md` to track changes going forward, plus a rule in `CLAUDE.md`
  telling Claude to read and update it on every change.

### Changed
- Database switched from PostgreSQL to a local SQLite file (`prisma/dev.db`).
  New migration `prisma/migrations/20261001204437_init`; old Postgres
  migrations kept in `prisma/_postgres_migrations_backup/`. List fields are
  stored as JSON arrays (`src/lib/json-list.ts`).
- Login removed: the app runs as a single local learner
  (`src/lib/session.ts`). The seeded demo learner "Alex" is used when present;
  otherwise a fresh learner goes through onboarding. E2E tests updated
  (`tests/e2e/no-login.spec.ts`).
- Local database was un-seeded; the previous copy is saved as
  `prisma/dev.db.backup-before-unseed`.

### Baseline (before 2026-10-01)
- Next.js 16 Dutch learning app (A2 → B1 → B2/C1, NT2 Staatsexamen): FSRS
  vocabulary, AI speaking partner, listening/reading with tap-to-translate,
  writing feedback, grammar library, NT2 practice, mistake tracker, daily
  plan, blog. See `README.md`.
