/**
 * Create a user, or reset an existing user's password.
 *   npm run user:create -- <email> <password> ["Name"] [admin]
 * Used to make the first admin account on a fresh server, and to let an existing
 * local learner (created before logins existed) sign in.
 */
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const [rawEmail, password, name = "Learner", flag] = process.argv.slice(2);
  if (!rawEmail || !password) {
    console.error('Usage: npm run user:create -- <email> <password> ["Name"] [admin]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }
  const email = rawEmail.trim().toLowerCase();
  const role = flag === "admin" ? "ADMIN" : undefined;
  const db = new PrismaClient();
  try {
    const hash = await hashPassword(password);
    const user = await db.user.upsert({
      where: { email },
      update: { ...(role ? { role } : {}) },
      create: { id: randomUUID(), name, email, emailVerified: true, role: role ?? "USER" },
    });
    await db.account.deleteMany({ where: { userId: user.id, providerId: "credential" } });
    await db.account.create({ data: { id: randomUUID(), userId: user.id, accountId: email, providerId: "credential", password: hash } });
    await db.session.deleteMany({ where: { userId: user.id } });
    console.log(`${user.role} ${email} is ready (password set).`);
  } finally {
    await db.$disconnect();
  }
}

void main();
