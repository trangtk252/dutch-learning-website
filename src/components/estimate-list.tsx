import type { SkillEstimate } from "@/lib/server/stats";
import { ProgressBar } from "@/components/ui/progress";

export function EstimateList({ items, compact = false }: { items: SkillEstimate[]; compact?: boolean }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className={item.key === "OVERALL" ? "font-semibold text-ink" : "text-sm text-ink"}>{item.label}</span>
            <span className="text-sm tabular-nums text-muted">{item.value == null ? "—" : `${item.value}%`}</span>
          </div>
          <ProgressBar value={item.value ?? 0} label={item.label} tone={item.key === "NT2" ? "accent" : "primary"} />
          {!compact && <p className="mt-1 text-xs text-muted">{item.detail}</p>}
        </li>
      ))}
    </ul>
  );
}
