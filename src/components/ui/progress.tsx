import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  max = 100,
  label,
  className,
  tone = "primary",
}: {
  value: number;
  max?: number;
  label: string;
  className?: string;
  tone?: "primary" | "accent" | "success";
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color = { primary: "bg-primary", accent: "bg-accent", success: "bg-success" }[tone];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div className={cn("h-full rounded-full transition-[width]", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}
