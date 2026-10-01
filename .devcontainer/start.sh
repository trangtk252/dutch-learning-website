#!/usr/bin/env bash
# Starts the development server. In GitHub Codespaces the site is opened through a
# forwarded URL (https://<codespace>-3000.app.github.dev), so the auth base URL is
# pointed at that address; otherwise login would be rejected as coming from another origin.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -n "${CODESPACE_NAME:-}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
  url="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  if grep -q '^BETTER_AUTH_URL=' .env; then
    sed -i "s#^BETTER_AUTH_URL=.*#BETTER_AUTH_URL=\"${url}\"#" .env
  else
    echo "BETTER_AUTH_URL=\"${url}\"" >> .env
  fi
fi

if (echo > /dev/tcp/localhost/3000) 2>/dev/null; then
  echo "The website is already running on port 3000 — open it from the PORTS tab."
  exit 0
fi

echo "Starting the website… it opens in a new browser tab when ready (or use the PORTS tab, port 3000)."
echo "Demo login: demo@example.com / leerdutch123"
exec npm run dev
