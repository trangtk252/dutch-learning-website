import type { NextConfig } from "next";

/**
 * In GitHub Codespaces the site is opened through a forwarded URL
 * (https://<codespace>-3000.app.github.dev) while the server sees localhost.
 * Allow exactly that host for dev assets and Server Actions; outside a
 * codespace nothing changes.
 */
const codespaceHost =
  process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    ? `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
    : null;

const nextConfig: NextConfig = {
  ...(codespaceHost
    ? {
        allowedDevOrigins: [codespaceHost],
        experimental: { serverActions: { allowedOrigins: [codespaceHost] } },
      }
    : {}),
};

export default nextConfig;
