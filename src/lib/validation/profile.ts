import { z } from "zod";
import { CEFR_LEVELS, SKILLS, levelIndex } from "../constants";

const skillList = z.array(z.enum(SKILLS)).max(6);

export const ProfileSchema = z
  .object({
    currentLevel: z.enum(CEFR_LEVELS),
    targetLevel: z.enum(CEFR_LEVELS),
    motivation: z.string().trim().max(500).optional().default(""),
    preparingNt2: z.boolean(),
    nt2Program: z.enum(["NONE", "PROGRAMMA_I", "PROGRAMMA_II"]),
    examDate: z
      .string()
      .optional()
      .transform((s) => (s ? new Date(`${s}T09:00:00Z`) : null))
      .refine((d) => d === null || !Number.isNaN(d.getTime()), "Invalid date"),
    dailyMinutes: z.coerce.number().int().min(5).max(180),
    preferredActivities: skillList,
    strengths: skillList,
    weaknesses: skillList,
    timezone: z.string().max(64).optional(),
  })
  .refine((p) => levelIndex(p.targetLevel) >= levelIndex(p.currentLevel), {
    message: "Your target level should be the same as or above your current level.",
    path: ["targetLevel"],
  })
  .transform((p) => ({
    ...p,
    nt2Program: p.preparingNt2 ? p.nt2Program : ("NONE" as const),
    examDate: p.preparingNt2 ? p.examDate : null,
  }));

export type ProfileInput = z.input<typeof ProfileSchema>;

/** Validates an IANA time-zone name, falling back to Amsterdam. */
export function safeTimeZone(tz: string | undefined): string {
  if (!tz) return "Europe/Amsterdam";
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return "Europe/Amsterdam";
  }
}
