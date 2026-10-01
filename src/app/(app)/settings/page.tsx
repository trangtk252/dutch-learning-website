import type { Metadata } from "next";
import { requireProfile } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { AccountForms, DangerZone, DisplayForm, PrivacyForm, ProfileForm } from "./forms";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { user, profile } = await requireProfile();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Your learning plan, accessibility, privacy and account." />
      <ProfileForm
        profile={{
          currentLevel: profile.currentLevel,
          targetLevel: profile.targetLevel,
          motivation: profile.motivation ?? "",
          preparingNt2: profile.preparingNt2,
          nt2Program: profile.nt2Program,
          examDate: profile.examDate?.toISOString().slice(0, 10) ?? "",
          dailyMinutes: profile.dailyMinutes,
          weeklyGoalDays: profile.weeklyGoalDays,
          newCardsPerDay: profile.newCardsPerDay,
          preferredActivities: profile.preferredActivities,
          strengths: profile.strengths,
          weaknesses: profile.weaknesses,
          timezone: profile.timezone,
        }}
      />
      <DisplayForm fontScale={profile.fontScale} />
      <PrivacyForm store={profile.storeConversations} days={profile.conversationRetentionDays} />
      <AccountForms name={user.name} email={user.email} />
      <DangerZone email={user.email} />
    </div>
  );
}
