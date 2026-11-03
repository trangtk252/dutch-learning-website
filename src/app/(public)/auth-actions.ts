"use server";

import { randomUUID, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearAttempts, tooManyAttempts } from "@/lib/auth/rate-limit";
import { createSession, destroySession } from "@/lib/session";

type State = { error?: string } | null;

const Email = z.string().trim().toLowerCase().email().max(200);
const SignupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: Email,
  password: z.string().min(8).max(200),
});

async function clientKey(email: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${ip}|${email}`;
}

function sameString(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function loginAction(_prev: State, fd: FormData): Promise<State> {
  const email = Email.safeParse(fd.get("email"));
  const password = String(fd.get("password") ?? "");
  if (!email.success || !password) return { error: "Enter your email and password." };
  const key = await clientKey(email.data);
  if (tooManyAttempts(key)) return { error: "Too many attempts. Wait a few minutes and try again." };

  const user = await db.user.findUnique({
    where: { email: email.data },
    include: { accounts: { where: { providerId: "credential" } } },
  });
  const stored = user?.accounts[0]?.password;
  // Verify even when the user is unknown so response time doesn't reveal which emails exist.
  const ok = await verifyPassword(password, stored ?? "00:00");
  if (!user || !stored || !ok) return { error: "Wrong email or password." };

  clearAttempts(key);
  await createSession(user.id);
  redirect("/dashboard");
}

export async function signupAction(_prev: State, fd: FormData): Promise<State> {
  const parsed = SignupSchema.safeParse({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) {
    const field = parsed.error.issues[0].path[0];
    if (field === "password") return { error: "Use a password of at least 8 characters." };
    if (field === "email") return { error: "Enter a valid email address." };
    return { error: "Enter your name." };
  }

  const expected = env.INVITE_CODE;
  if (!expected && process.env.NODE_ENV === "production") return { error: "Sign-up is closed." };
  const key = await clientKey("signup");
  if (tooManyAttempts(key)) return { error: "Too many attempts. Wait a few minutes and try again." };
  if (expected && !sameString(String(fd.get("invite") ?? "").trim(), expected)) return { error: "That invite code isn't right." };

  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return { error: "An account with this email already exists. Log in instead." };
  }
  const user = await db.user.create({
    data: {
      id: randomUUID(),
      name,
      email,
      emailVerified: true,
      role: env.ADMIN_EMAIL?.toLowerCase() === email ? "ADMIN" : "USER",
      accounts: {
        create: { id: randomUUID(), accountId: email, providerId: "credential", password: await hashPassword(password) },
      },
    },
  });
  clearAttempts(key);
  await createSession(user.id);
  redirect("/onboarding");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
