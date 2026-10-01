import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger";
const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone], className)}>
      {children}
    </span>
  );
}

const levelTone: Record<string, Tone> = { A1: "success", A2: "success", B1: "primary", B2: "accent", C1: "danger" };

export function LevelBadge({ level }: { level: string | null | undefined }) {
  if (!level) return null;
  return (
    <Badge tone={levelTone[level] ?? "neutral"} className="font-semibold">
      <span className="sr-only">CEFR level </span>
      {level}
    </Badge>
  );
}
