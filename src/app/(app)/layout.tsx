import { AppShell } from "@/components/layout/app-shell";
import { isAiMock } from "@/lib/ai";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { user } = await requireProfile();
  const row = await db.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return (
    <AppShell userName={user.name} isAdmin={row?.role === "ADMIN"} aiMock={isAiMock()}>
      {children}
    </AppShell>
  );
}
