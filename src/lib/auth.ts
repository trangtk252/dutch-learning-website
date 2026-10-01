import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import { adminEmails, env } from "./env";
import { getEmailProvider } from "./email";

/**
 * Authentication (Better Auth): email + password with DB-backed sessions.
 * Social providers can be added later via `socialProviders` — the Account
 * table already supports multiple providers per user.
 */
/**
 * Development only: accept logins both from GitHub Codespaces' forwarded URLs
 * (https://<codespace>-3000.app.github.dev) and from localhost on any port (e.g. VS Code
 * desktop forwarding a codespace port to localhost:3001), whatever BETTER_AUTH_URL is set to.
 * Production trusts only BETTER_AUTH_URL.
 */
const devTrustedOrigins =
  process.env.NODE_ENV === "development"
    ? ["https://*.app.github.dev", "http://localhost:*", "http://127.0.0.1:*"]
    : [];

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: devTrustedOrigins,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    async sendResetPassword({ user, url }) {
      await getEmailProvider().send({
        to: user.email,
        subject: "Reset your password",
        text: `Hallo ${user.name},\n\nUse this link to choose a new password (valid for 1 hour):\n${url}\n\nIf you didn't request this, you can ignore this email.`,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "USER", input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        async before(user) {
          const role = adminEmails.has(user.email.toLowerCase()) ? "ADMIN" : "USER";
          return { data: { ...user, role } };
        },
      },
    },
  },
  plugins: [nextCookies()],
});
