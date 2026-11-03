import { AppShell } from "@/components/layout/app-shell";
import { cookies } from "next/headers";
import { SIDEBAR_COOKIE } from "@/lib/constants";
import { requireProfile } from "@/lib/session";
import { getVoiceConfig } from "@/lib/speech/config";
import { VoiceProvider } from "@/components/voice/voice-context";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { profile } = await requireProfile();
  return (
    <>
    {/* Apply the learner's text size on every device (the cookie only covers public pages). */}
    <style>{`:root{--font-scale:${Math.min(150, Math.max(85, profile.fontScale)) / 100}}`}</style>
    <AppShell defaultCollapsed={(await cookies()).get(SIDEBAR_COOKIE)?.value === "collapsed"}>
      <VoiceProvider config={getVoiceConfig()}>{children}</VoiceProvider>
    </AppShell>
    </>
  );
}
