import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

/** Admin-only overview of registered accounts. Sign-up needs the invite code, so every non-admin account came through it. */
export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { cards: true } } },
  });
  const learners = users.filter((u) => u.role !== "ADMIN").length;
  const fmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

  return (
    <div className="space-y-6">
      <PageHeader title="Users" />
      <p className="text-sm text-muted-foreground">
        {users.length} accounts ({learners} learners, {users.length - learners} admin). Times are UTC.
      </p>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2 text-right font-medium">Cards</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="whitespace-nowrap px-4 py-2">{fmt.format(u.createdAt)}</td>
                <td className="px-4 py-2 text-right">{u._count.cards}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
