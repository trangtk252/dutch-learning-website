import type { Metadata } from "next";
import { BookOpen, Headphones, PenLine } from "lucide-react";
import { requireProfile } from "@/lib/session";
import { CardLink } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Practice") };
}

const ITEMS = [
  { href: "/listening", icon: Headphones, title: "Listening", text: "Dialogues, announcements, podcasts and series" },
  { href: "/reading", icon: BookOpen, title: "Reading", text: "Texts from A2 to C1 with tap-to-translate" },
  { href: "/writing", icon: PenLine, title: "Writing", text: "Emails, messages and opinions with feedback" },
];

/** Mobile hub for the skill sections (the bottom bar has room for five items). */
export default async function PracticePage() {
  await requireProfile();
  const t = await getT();
  return (
    <div className="space-y-6">
      <PageHeader title={t("Practice")} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {ITEMS.map((i) => (
          <li key={i.href}>
            <CardLink href={i.href} className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary-strong"><i.icon aria-hidden className="size-5" /></span>
              <span><span className="block font-semibold">{t(i.title)}</span><span className="block text-sm text-muted">{t(i.text)}</span></span>
            </CardLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
