import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { db } from "./db";

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** Returns the signed-in user or redirects to /login. Use in every protected page/action. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user as typeof session.user & { role?: string };
}

/** Like requireUser, but also loads the profile and sends un-onboarded users to onboarding. */
export const requireProfile = cache(async () => {
  const user = await requireUser();
  const profile = await db.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.onboardedAt) redirect("/onboarding");
  return { user, profile };
});

export async function requireAdmin() {
  const user = await requireUser();
  const row = await db.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (row?.role !== "ADMIN") redirect("/dashboard");
  return user;
}
