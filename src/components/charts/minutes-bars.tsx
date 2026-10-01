import { cn } from "@/lib/cn";

/**
 * Single-series bar chart of study minutes per day. Bars have rounded data-ends
 * anchored to the baseline, a 2px gap, a hover/focus tooltip and a visually
 * hidden table for screen readers. The goal line is a recessive dashed rule.
 */
export function MinutesBars({
  days,
  goal,
  title = "Study minutes per day",
  className,
}: {
  days: { date: Date; minutes: number }[];
  goal: number;
  title?: string;
  className?: string;
}) {
  const max = Math.max(goal, ...days.map((d) => d.minutes), 1);
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const short = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "narrow", timeZone: "UTC" });
  return (
    <figure className={cn("w-full", className)}>
      <figcaption className="mb-2 text-sm font-medium text-ink">{title}</figcaption>
      <div className="relative h-28" aria-hidden="true">
        <div
          className="absolute inset-x-0 border-t border-dashed border-muted/40"
          style={{ bottom: `${(goal / max) * 100}%` }}
        >
          <span className="absolute -top-4 right-0 text-[10px] text-muted">goal {goal}m</span>
        </div>
        <div className="flex h-full items-end gap-[2px]">
          {days.map((d) => (
            <div key={d.date.toISOString()} className="group relative flex h-full flex-1 items-end justify-center">
              <div
                className={cn(
                  "w-full max-w-7 rounded-t-[4px] transition-colors",
                  d.minutes >= goal ? "bg-primary" : d.minutes > 0 ? "bg-primary/45" : "bg-surface-2",
                )}
                style={{ height: `${Math.max(d.minutes > 0 ? 6 : 3, (d.minutes / max) * 100)}%` }}
              />
              <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink shadow-sm group-hover:block">
                {fmt(d.date)}: <strong>{d.minutes} min</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 flex gap-[2px] text-center text-[11px] text-muted" aria-hidden="true">
        {days.map((d) => (
          <span key={d.date.toISOString()} className="flex-1">
            {days.length <= 14 ? short(d.date) : ""}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Minutes</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date.toISOString()}>
              <td>{fmt(d.date)}</td>
              <td>{d.minutes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
