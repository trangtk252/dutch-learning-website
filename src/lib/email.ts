import "server-only";
import { env } from "./env";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

/** Abstraction so a real transactional email service can be plugged in later. */
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  async send({ to, subject, text }: EmailMessage) {
    console.info(`\n[email] from=${env.EMAIL_FROM} to=${to}\n[email] subject: ${subject}\n${text}\n`);
  }
}

export function getEmailProvider(): EmailProvider {
  switch (env.EMAIL_PROVIDER) {
    case "console":
    default:
      return new ConsoleEmailProvider();
  }
}
