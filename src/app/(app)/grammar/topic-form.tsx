"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import { saveMyGrammarTopicAction } from "./actions";
import { useT } from "@/lib/i18n/client";

export type TopicFormValues = { id?: string; title: string; level: string; summary: string; explanation: string; examples: string };

export function TopicForm({ initial }: { initial: TopicFormValues }) {
  const router = useRouter();
  const t = useT();
  const [v, setV] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof TopicFormValues) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const r = await saveMyGrammarTopicAction({ ...v, level: v.level as "A2" | "B1" | "B2" | "C1" });
        if (r.ok) router.push(`/grammar/${r.slug}`);
        else setError(r.error);
      } catch {
        setError(t("Couldn't save. Please try again."));
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <FormError message={error} />
      <Field id="g-title" label={t("Title")}>
        <Input id="g-title" value={v.title} onChange={set("title")} maxLength={120} required placeholder={t("e.g. Word order after “omdat”")} />
      </Field>
      <Field id="g-level" label={t("Level")}>
        <Select id="g-level" value={v.level} onChange={set("level")}>
          <option value="A2">{t("A2 (Voorbereiding)")}</option>
          <option value="B1">{t("B1 (Programma I)")}</option>
          <option value="B2">{t("B2 (Programma II)")}</option>
          <option value="C1">C1</option>
        </Select>
      </Field>
      <Field id="g-summary" label={t("Short summary (optional)")}>
        <Input id="g-summary" value={v.summary} onChange={set("summary")} maxLength={300} />
      </Field>
      <Field id="g-explanation" label={t("What I learnt")} hint={t("Rules, tricks, exceptions. Markdown is supported.")}>
        <Textarea id="g-explanation" value={v.explanation} onChange={set("explanation")} rows={8} maxLength={20000} required />
      </Field>
      <Field id="g-examples" label={t("Examples (optional)")} hint={t("One per line: Dutch sentence = English translation")}>
        <Textarea id="g-examples" value={v.examples} onChange={set("examples")} rows={5} placeholder={t("Ik blijf thuis omdat ik ziek ben. = I stay home because I'm ill.")} />
      </Field>
      <Button type="submit" disabled={pending}>{pending ? t("Saving…") : t("Save topic")}</Button>
    </form>
  );
}
