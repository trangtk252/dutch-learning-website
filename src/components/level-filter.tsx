import Link from "next/link";
import { CEFR_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/cn";

/** Level tabs as links (works without JS). `all` shows every level. */
export function LevelFilter({ basePath, current, recommended }: { basePath: string; current: string | null; recommended: string[] }) {
  const items = [{ key: null, label: `My levels (${recommended.join("–")})` }, ...CEFR_LEVELS.map((l) => ({ key: l, label: l })), { key: "all", label: "All" }];
  return (
    <nav aria-label="Filter by level" className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = (current ?? null) === it.key;
        return (
          <Link
            key={it.label}
            href={it.key ? `${basePath}?level=${it.key}` : basePath}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              active ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface text-muted hover:text-ink",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
