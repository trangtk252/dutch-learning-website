"use client";

import { useActionState, useState } from "react";
import { CEFR_LEVELS, SKILLS, SKILL_LABELS } from "@/lib/constants";
import { Button, buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormError, Input, Label, Select, Textarea } from "@/components/ui/form";
import {
  deleteAccountAction,
  deleteHistoryAction,
  saveDisplayAction,
  savePrivacyAction,
  saveProfileAction,
  updateNameAction,
} from "./actions";
import { useT } from "@/lib/i18n/client";

function Saved({ state }: { state: { ok?: boolean; error?: string } | null }) {
  const t = useT();
  if (!state) return null;
  return state.error ? (
    <FormError message={state.error} />
  ) : (
    <p role="status" className="text-sm text-success">{t("Saved.")}</p>
  );
}

function SkillChecks({ name, legend, value }: { name: string; legend: string; value: string[] }) {
  const t = useT();
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {SKILLS.map((s) => (
          <label key={s} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 py-1 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
            <input type="checkbox" name={name} value={s} defaultChecked={value.includes(s)} className="accent-[var(--primary)]" />
            {t(SKILL_LABELS[s])}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface ProfileValues {
  currentLevel: string; targetLevel: string; motivation: string; preparingNt2: boolean; nt2Program: string; examDate: string;
  dailyMinutes: number; weeklyGoalDays: number; newCardsPerDay: number; preferredActivities: string[]; strengths: string[];
  weaknesses: string[]; timezone: string;
}

export function ProfileForm({ profile: p }: { profile: ProfileValues }) {
  const t = useT();
  const [state, action, pending] = useActionState(saveProfileAction, null);
  const [nt2, setNt2] = useState(p.preparingNt2);
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">{t("Learning plan")}</h2>
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <Field id="currentLevel" label={t("Current level")}>
          <Select id="currentLevel" name="currentLevel" defaultValue={p.currentLevel}>{CEFR_LEVELS.map((l) => <option key={l}>{l}</option>)}</Select>
        </Field>
        <Field id="targetLevel" label={t("Target level")}>
          <Select id="targetLevel" name="targetLevel" defaultValue={p.targetLevel}>{CEFR_LEVELS.map((l) => <option key={l}>{l}</option>)}</Select>
        </Field>
        <Field id="motivation" label={t("Why you're learning Dutch")} className="sm:col-span-2">
          <Textarea id="motivation" name="motivation" defaultValue={p.motivation} maxLength={500} rows={2} />
        </Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="preparingNt2" checked={nt2} onChange={(e) => setNt2(e.target.checked)} className="size-4 accent-[var(--primary)]" />
          {t("I'm preparing for the NT2 Staatsexamen")}
        </label>
        {nt2 && (
          <>
            <Field id="nt2Program" label={t("Programme")}>
              <Select id="nt2Program" name="nt2Program" defaultValue={p.nt2Program === "NONE" ? "PROGRAMMA_I" : p.nt2Program}>
                <option value="PROGRAMMA_I">{t("Programma I (B1)")}</option>
                <option value="PROGRAMMA_II">{t("Programma II (B2)")}</option>
              </Select>
            </Field>
            <Field id="examDate" label={t("Exam date")}>
              <Input id="examDate" name="examDate" type="date" defaultValue={p.examDate} />
            </Field>
          </>
        )}
        <Field id="dailyMinutes" label={t("Daily study time (minutes)")}>
          <Input id="dailyMinutes" name="dailyMinutes" type="number" min={5} max={180} defaultValue={p.dailyMinutes} />
        </Field>
        <Field id="weeklyGoalDays" label={t("Study days per week (goal)")}>
          <Input id="weeklyGoalDays" name="weeklyGoalDays" type="number" min={1} max={7} defaultValue={p.weeklyGoalDays} />
        </Field>
        <Field id="newCardsPerDay" label={t("New flashcards per day")}>
          <Input id="newCardsPerDay" name="newCardsPerDay" type="number" min={0} max={50} defaultValue={p.newCardsPerDay} />
        </Field>
        <Field id="timezone" label={t("Time zone")} hint={t("Used for your daily streak and due cards.")}>
          <Input id="timezone" name="timezone" defaultValue={p.timezone} maxLength={64} />
        </Field>
        <div className="space-y-4 sm:col-span-2">
          <SkillChecks name="preferredActivities" legend={t("Preferred activities")} value={p.preferredActivities} />
          <SkillChecks name="strengths" legend={t("Strengths")} value={p.strengths} />
          <SkillChecks name="weaknesses" legend={t("Areas to improve")} value={p.weaknesses} />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={pending}>{t("Save plan")}</Button>
          <Saved state={state} />
        </div>
      </form>
    </Card>
  );
}

export function DisplayForm({ fontScale }: { fontScale: number }) {
  const t = useT();
  const [state, action, pending] = useActionState(saveDisplayAction, null);
  const [value, setValue] = useState(fontScale);
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">{t("Display & accessibility")}</h2>
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="fontScale">{t("Text size: {value}%", { value })}</Label>
          <input id="fontScale" name="fontScale" type="range" min={85} max={150} step={5} value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full max-w-sm accent-[var(--primary)]" />
          <p className="mt-2 text-muted" style={{ fontSize: `${value}%` }} lang="nl">{t("Voorbeeld: Het was een heel gezellige avond.")}</p>
        </div>
        <p className="text-xs text-muted">{t("The app follows your system's light/dark mode and “reduce motion” settings automatically.")}</p>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>{t("Save")}</Button>
          <Saved state={state} />
        </div>
      </form>
    </Card>
  );
}

export function PrivacyForm({ store, days }: { store: boolean; days: number }) {
  const t = useT();
  const [state, action, pending] = useActionState(savePrivacyAction, null);
  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold">{t("Privacy")}</h2>
      <p className="mb-4 text-sm text-muted">
        {t("We never store audio recordings. Voice is converted to text in your browser. Conversation text is used to generate replies and feedback.")}
      </p>
      <form action={action} className="space-y-4">
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="storeConversations" defaultChecked={store} className="mt-0.5 size-4 accent-[var(--primary)]" />
          <span>{t("Keep conversation transcripts so I can review them later")}<span className="block text-xs text-muted">{t("When off, transcripts are deleted as soon as you finish a conversation; the feedback report and corrections in “My mistakes” are kept.")}</span></span>
        </label>
        <Field id="conversationRetentionDays" label={t("Delete transcripts after (days)")} hint={t("0 = keep until I delete them.")}>
          <Input id="conversationRetentionDays" name="conversationRetentionDays" type="number" min={0} max={3650} defaultValue={days} className="max-w-32" />
        </Field>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>{t("Save privacy settings")}</Button>
          <Saved state={state} />
        </div>
      </form>
      <div className="mt-6 border-t border-line pt-4">
        <h3 className="font-medium">{t("Your data")}</h3>
        <p className="mt-1 text-sm text-muted">{t("Download everything we store about you (profile, vocabulary, reviews, conversations, writing, mistakes, results).")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="/api/account/export" className={buttonClass("secondary", "sm")}>{t("Export all data (JSON)")}</a>
        </div>
      </div>
    </Card>
  );
}

export function AccountForms({ name }: { name: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(updateNameAction, null);
  return (
    <Card className="space-y-6">
      <h2 className="text-lg font-semibold">{t("Your name")}</h2>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <Field id="name" label={t("Name")}><Input id="name" name="name" defaultValue={name} maxLength={80} /></Field>
        <Button type="submit" variant="secondary" disabled={pending}>{t("Update name")}</Button>
        <Saved state={state} />
      </form>
    </Card>
  );
}

export function DangerZone() {
  const t = useT();
  const [hState, hAction, hPending] = useActionState(deleteHistoryAction, null);
  const [aState, aAction, aPending] = useActionState(deleteAccountAction, null);
  const parts = [
    ["vocabulary", t("Vocabulary & review history")], ["conversations", t("Conversations & speaking reports")], ["writing", t("Writing submissions")],
    ["mistakes", t("Mistake history")], ["attempts", t("Exercise & exam results")], ["activity", t("Study time, streaks & milestones")],
  ];
  return (
    <Card className="space-y-6 border-danger/30">
      <h2 className="text-lg font-semibold text-danger">{t("Delete data")}</h2>
      <form action={hAction} onSubmit={(e) => { if (!confirm(t("Delete the selected learning history? This cannot be undone."))) e.preventDefault(); }} className="space-y-3">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t("Delete learning history")}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {parts.map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 text-sm"><input type="checkbox" name="parts" value={v} className="size-4 accent-[var(--danger)]" /> {l}</label>
            ))}
          </div>
        </fieldset>
        <div className="flex items-center gap-3">
          <Button type="submit" variant="secondary" disabled={hPending}>{t("Delete selected")}</Button>
          <Saved state={hState} />
        </div>
      </form>
      <form action={aAction} className="space-y-3 border-t border-line pt-4">
        <p className="text-sm font-medium">{t("Delete account")}</p>
        <p className="text-sm text-muted">{t("Permanently deletes your account and all learning data. Type")} <strong>{t("delete")}</strong> {t("to confirm.")}</p>
        <FormError message={aState?.error} />
        <div className="flex flex-wrap items-end gap-3">
          <Field id="confirm" label={t("Confirmation")}><Input id="confirm" name="confirm" autoComplete="off" /></Field>
          <Button type="submit" variant="danger" disabled={aPending}>{t("Delete my account")}</Button>
        </div>
      </form>
    </Card>
  );
}
