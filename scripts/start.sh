#!/bin/sh
# Container entrypoint: prepare the database on the persistent disk, then start the app.
set -e

DB_FILE="${DATABASE_FILE:-/data/app.db}"
export DATABASE_URL="file:${DB_FILE}"
mkdir -p "$(dirname "$DB_FILE")"

if [ ! -f "$DB_FILE" ]; then
  echo "First start: creating the database from the shared content."
  cp prisma/production-seed.db "$DB_FILE"
fi

npx prisma migrate deploy
npx tsx scripts/bootstrap-admin.ts

exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
