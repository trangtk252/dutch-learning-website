# Publishing BijNederlands on Vercel

The app needs a Postgres database (Vercel has no disk to keep files on). The build sets everything up by itself:
it creates the tables, loads the shared content (words, grammar, readings, listening, writing) the first time, and
creates the admin account.

## 1. Create the database (once)

In the Vercel dashboard open your project → **Storage** → **Create Database** → **Neon (Postgres)** → connect it
to the project. This adds `DATABASE_URL` (and a few related variables) automatically. Any other Postgres works
too: just add its connection string as `DATABASE_URL`.

## 2. Add the other settings

Project → **Settings → Environment Variables** (Production + Preview):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | set by the Neon integration (check it exists) |
| `INVITE_CODE` | the code testers type when signing up (min. 6 characters) |
| `ADMIN_EMAIL` | your email (gets the admin role) |
| `ADMIN_PASSWORD` | password for that account (min. 8 characters; created on the first deploy only) |
| `AI_PROVIDER` | `mock` (offline feedback; no AI cost) |

Leave the AI, voice and transcription keys empty unless you want real AI: every tester would then use your credit.

## 3. Deploy

Push to GitHub (Vercel deploys from the repo) or run `vercel --prod`. The build script is `vercel-build` in
`package.json`: `prisma migrate deploy` → copy shared content if the database is empty → create the admin →
`next build`. Open the site and log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then send testers the link and
the invite code.

## Things to know

- The Dutch dictionary (`prisma/dictionary.db`, 54 MB) is a read-only file shipped with the app; it is not in the
  database.
- Move your own local learning data (old `prisma/dev.db`) into Postgres, once, after the first deploy:
  `DATABASE_URL="<your Neon URL>" npm run db:copy-seed -- prisma/dev.db` (existing rows are skipped). Local
  development now also uses Postgres: point `DATABASE_URL` in `.env` at a Neon database (a separate Neon branch
  is a good dev copy).
- Create an account or reset a password: `DATABASE_URL="<your Neon URL>" npm run user:create -- <email> <new-password> "Name"`.
- Sign-in attempts are rate-limited in memory per server instance, so the limit is only approximate on Vercel.
- Testers can export or delete their own data in Settings.
