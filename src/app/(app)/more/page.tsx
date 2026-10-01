import type { Metadata } from "next";
import { ChartLine, CircleAlert, Newspaper, Search, Settings, Shield } from "lucide-react";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { CardLink } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "More" };

export default async function MorePage() {
  const { user } = await requireProfile();
  const me = await db.user.findUnique({ where: { id: user.id }, select: { role: true } });
  const items = [
    { href: "/mistakes", icon: CircleAlert, title: "My mistakes" },
    { href: "/progress", icon: ChartLine, title: "Progress" },
    { href: "/search", icon: Search, title: "Search" },
    { href: "/blog", icon: Newspaper, title: "Blog" },
    { href: "/settings", icon: Settings, title: "Settings" },
    ...(me?.role === "ADMIN" ? [{ href: "/admin/blog", icon: Shield, title: "Admin · Blog" }] : []),
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="More" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.href}>
            <CardLink href={i.href} className="flex items-center gap-3 py-4">
              <i.icon aria-hidden className="size-5 text-primary" />
              <span className="font-medium">{i.title}</span>
            </CardLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
