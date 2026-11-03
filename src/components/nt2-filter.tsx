"use client";

import Link from "next/link";
import { NT2_TRACKS, NT2_TRACK_INFO, type Nt2Section, type Nt2Track } from "@/lib/nt2";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/client";

interface Props {
  basePath: string;
  track: Nt2Track | "all";
  section?: string;
  sections: Nt2Section<string>[];
  skillLabel: string;
}

function href(basePath: string, track: string, section?: string) {
  const q = new URLSearchParams({ track });
  if (section) q.set("section", section);
  return `${basePath}?${q}`;
}

const pill = (active: boolean) =>
  cn("rounded-full border px-3 py-1 text-sm", active ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface text-muted hover:text-ink");

/** NT2 programme tabs + Staatsexamen section tabs, as links (works without JS). */
export function Nt2Filter({ basePath, track, section, sections, skillLabel }: Props) {
  const t = useT();
  return (
    <div className="space-y-3">
      <nav aria-label={t("NT2 programme")} className="flex flex-wrap gap-2">
        {NT2_TRACKS.map((tr) => (
          <Link key={tr} href={href(basePath, tr)} aria-current={track === tr ? "page" : undefined} className={pill(track === tr)}>
            {t(NT2_TRACK_INFO[tr].label)}
          </Link>
        ))}
        <Link href={href(basePath, "all")} aria-current={track === "all" ? "page" : undefined} className={pill(track === "all")}>{t("All levels")}</Link>
      </nav>
      {track !== "all" && <p className="text-sm text-muted">{t(NT2_TRACK_INFO[track].blurb)}</p>}
      <nav aria-label={t("{skill} sections", { skill: t(skillLabel) })} className="flex flex-wrap gap-2 border-t border-line pt-3">
        <Link href={href(basePath, track)} aria-current={!section ? "page" : undefined} className={pill(!section)}>{t("All sections")}</Link>
        {sections.map((s) => (
          <Link key={s.key} href={href(basePath, track, s.key)} title={t(s.hint)} aria-current={section === s.key ? "page" : undefined} className={pill(section === s.key)}>
            {t(s.label)}
          </Link>
        ))}
      </nav>
    </div>
  );
}
