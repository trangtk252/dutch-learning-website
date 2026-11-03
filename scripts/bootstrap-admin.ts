/**
 * Creates the admin account on a fresh server from ADMIN_EMAIL + ADMIN_PASSWORD, if it doesn't exist yet.
 * Runs on every start; it never changes an existing account.
 */
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log(`Admin account not created: ${!email ? "ADMIN_EMAIL" : "ADMIN_PASSWORD"} is not set for this build.`);
    return;
  }
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  const db = new PrismaClient();
  try {
    if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
      console.log(`Admin account ${email} already exists; left unchanged.`);
      return;
    }
    await db.user.create({
      data: {
        id: randomUUID(), name: "Admin", email, emailVerified: true, role: "ADMIN",
        accounts: { create: { id: randomUUID(), accountId: email, providerId: "credential", password: await hashPassword(password) } },
      },
    });
    console.log(`Created admin account ${email}.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
