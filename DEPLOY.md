# Publishing BijNederlands for a small test (Railway)

The app keeps its data in a SQLite file, so it needs a host with a **persistent disk**. These steps use Railway
(about $5/month); Fly.io works the same way. Vercel does not (no persistent disk).

## Before the first deploy (on your computer)

1. Rebuild the clean database from the shared content (no personal data):
   `npm run db:build:production` → writes `prisma/production-seed.db`. Re-run it only if you added new shared
   content (e.g. new seeds); it never touches `dev.db`.
2. Pick values for the settings below. Use a long random `INVITE_CODE` (the code you give to testers) and a
   strong `ADMIN_PASSWORD`.

## On Railway

1. Create a project → **Deploy from local directory** (`npm i -g @railway/cli`, `railway login`, `railway init`,
   `railway up`) or connect a GitHub repo. Railway builds the `Dockerfile`.
2. Add a **Volume** to the service, mounted at `/data`.
3. Set these **variables** on the service:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_FILE` | `/data/app.db` |
   | `INVITE_CODE` | the code testers type when signing up (min. 6 characters) |
   | `ADMIN_EMAIL` | your email (gets the admin role) |
   | `ADMIN_PASSWORD` | password for that account (created on first start only) |
   | `AI_PROVIDER` | `mock` (offline feedback; no AI cost) |

   Leave the AI, voice and transcription keys empty unless you want real AI: every tester would then use your
   credit.
4. **Settings → Networking → Generate domain.** Open it, log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
5. Send testers the link and the invite code. They choose their own language with the EN/VI button.

## Things to know

- First start copies the seed database to the volume, runs migrations and creates the admin account. Later
  deploys keep the data on the volume.
- Back up the database now and then: download `/data/app.db` (e.g. `railway ssh`), or use a Railway volume backup.
- Reset someone's password (or create an account yourself):
  `railway ssh` then `npm run user:create -- <email> <new-password> "Name"`.
- Sign-in attempts are rate-limited in memory (resets on restart). Keep the service at one instance.
- Testers can export or delete their own data in Settings.
