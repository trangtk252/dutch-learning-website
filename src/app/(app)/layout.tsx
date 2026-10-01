import { AppShell } from "@/components/layout/app-shell";
import { isAiMock } from "@/lib/ai";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { getVoiceConfig } from "@/lib/speech/config";
import { VoiceProvider } from "@/components/voice/voice-context";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { user, profile } = await requireProfile();
  const row = await db.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return (
    <>
    {/* Apply the learner's text size on every device (the cookie only covers public pages). */}
    <style>{`:root{--font-scale:${Math.min(150, Math.max(85, profile.fontScale)) / 100}}`}</style>
    <AppShell userName={user.name} isAdmin={row?.role === "ADMIN"} aiMock={isAiMock()}>
      <VoiceProvider config={getVoiceConfig()}>{children}</VoiceProvider>
    </AppShell>
    </>
  );
}
