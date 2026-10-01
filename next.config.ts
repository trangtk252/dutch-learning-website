import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * In GitHub Codespaces the site is opened through a forwarded URL
 * (https://<codespace>-3000.app.github.dev) while the server sees localhost.
 * Allow that host for dev assets and Server Actions:
 * - on the dev server, any *.app.github.dev host (Codespaces' variables are not
 *   always visible to the server process);
 * - otherwise only the exact codespace host, when Codespaces' variables are set.
 * Outside Codespaces and in production builds nothing changes.
 */
const codespaceHost =
  process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    ? `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
    : null;

export default function config(phase: string): NextConfig {
  const hosts = [
    ...(phase === PHASE_DEVELOPMENT_SERVER ? ["*.app.github.dev"] : []),
    ...(codespaceHost ? [codespaceHost] : []),
  ];
  if (hosts.length === 0) return {};
  return {
    allowedDevOrigins: hosts,
    experimental: { serverActions: { allowedOrigins: hosts } },
  };
}
