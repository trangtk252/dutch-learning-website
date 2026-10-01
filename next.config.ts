import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * In GitHub Codespaces the site is opened through a forwarded URL
 * (https://<codespace>-3000.app.github.dev). Depending on how it is opened,
 * the forwarder reports either that host or localhost:3000 as the request's
 * origin, while forwarding the other one as x-forwarded-host. Allow both:
 * - on the dev server, any *.app.github.dev host plus localhost:3000
 *   (Codespaces' variables are not always visible to the server process);
 * - otherwise only the exact codespace host, when Codespaces' variables are set.
 * Outside Codespaces and in production builds nothing changes.
 */
const codespaceHost =
  process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    ? `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
    : null;

export default function config(phase: string): NextConfig {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  // Hostnames only (allowedDevOrigins ignores ports).
  const devHosts = [...(dev ? ["*.app.github.dev"] : []), ...(codespaceHost ? [codespaceHost] : [])];
  // Server Actions compare host[:port] of the Origin header.
  const actionHosts = [...devHosts, ...(dev ? ["localhost:3000", "127.0.0.1:3000"] : [])];
  if (actionHosts.length === 0) return {};
  return {
    allowedDevOrigins: devHosts,
    experimental: { serverActions: { allowedOrigins: actionHosts } },
  };
}
