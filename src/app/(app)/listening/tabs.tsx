import Link from "next/link";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/listening", label: "Exercises" },
  { href: "/listening/podcasts", label: "Podcasts" },
  { href: "/listening/watch", label: "Film & TV" },
];

export function ListeningTabs({ active }: { active: string }) {
  return (
    <nav aria-label="Listening sections" className="flex gap-1 border-b border-line">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={active === t.href ? "page" : undefined}
          className={cn("-mb-px border-b-2 px-3 py-2 text-sm", active === t.href ? "border-primary font-semibold text-primary" : "border-transparent text-muted hover:text-ink")}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
