import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

export const SESSION_COOKIE = "session";
const SESSION_DAYS = 30;

/** The database stores only a hash of the cookie token, so a leaked DB can't be used to sign in. */
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Creates a session row and sets the cookie. Call from a server action or route handler. */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.session.create({ data: { id: randomUUID(), userId, token: hashToken(token), expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Deletes the current session (if any) and clears the cookie. */
export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { token: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { token: hashToken(token) }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
});

/** The signed-in user, or null. */
export const getSession = cache(async () => {
  const user = await getCurrentUser();
  return user ? { user } : null;
});

/** Returns the signed-in user, or sends the visitor to the login page. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Like requireUser, but also loads the profile and sends un-onboarded users to onboarding. */
export const requireProfile = cache(async () => {
  const user = await requireUser();
  const profile = await db.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.onboardedAt) redirect("/onboarding");
  return { user, profile };
});

/** Admin-only pages and actions. Everyone else goes back to the dashboard. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
