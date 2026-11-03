import type { Metadata } from "next";
import { BookA, BookText, ChartLine, CircleAlert, Search, Settings } from "lucide-react";
import { requireProfile } from "@/lib/session";
import { CardLink } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("More") };
}

export default async function MorePage() {
  await requireProfile();
  const t = await getT();
  const items = [
    { href: "/dictionary", icon: BookA, title: "Dictionary" },
    { href: "/grammar", icon: BookText, title: "Grammar" },
    { href: "/mistakes", icon: CircleAlert, title: "My mistakes" },
    { href: "/progress", icon: ChartLine, title: "Progress" },
    { href: "/search", icon: Search, title: "Search" },
    { href: "/settings", icon: Settings, title: "Settings" },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title={t("More")} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.href}>
            <CardLink href={i.href} className="flex items-center gap-3 py-4">
              <i.icon aria-hidden className="size-5 text-primary-strong" />
              <span className="font-medium">{t(i.title)}</span>
            </CardLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
