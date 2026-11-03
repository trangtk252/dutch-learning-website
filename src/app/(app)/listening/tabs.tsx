"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/client";

const TABS = [
  { href: "/listening", label: "Exercises" },
  { href: "/listening/podcasts", label: "Podcasts" },
  { href: "/listening/watch", label: "Film & TV" },
  { href: "/listening/mine", label: "My library" },
];

export function ListeningTabs({ active }: { active: string }) {
  const t = useT();
  return (
    <nav aria-label={t("Listening sections")} className="flex gap-1 border-b border-line">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={active === tab.href ? "page" : undefined}
          className={cn("-mb-px border-b-2 px-3 py-2 text-sm", active === tab.href ? "border-primary font-semibold text-primary-strong" : "border-transparent text-muted hover:text-ink")}
        >
          {t(tab.label)}
        </Link>
      ))}
    </nav>
  );
}
