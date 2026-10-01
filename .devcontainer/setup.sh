#!/usr/bin/env bash
# Runs once when the dev container is created: config, dependencies, database and sample content.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Creating .env for development…"
  secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  cat > .env <<ENV
DATABASE_URL="postgresql://dutch:dutch@localhost:5432/dutch_dev?schema=public"
BETTER_AUTH_SECRET="${secret}"
BETTER_AUTH_URL="http://localhost:3000"
AI_PROVIDER="mock"
ENV
fi

echo "Installing dependencies…"
npm ci

echo "Waiting for PostgreSQL…"
for i in $(seq 1 60); do
  if (echo > /dev/tcp/localhost/5432) 2>/dev/null; then break; fi
  sleep 1
done

echo "Applying database migrations…"
for i in 1 2 3 4 5; do
  npx prisma migrate deploy && break
  echo "Database not ready yet, retrying in 3s…"
  sleep 3
done

echo "Adding sample content and the demo learner…"
npm run db:seed

echo "Setup complete. The website starts automatically (or run: bash .devcontainer/start.sh)."
