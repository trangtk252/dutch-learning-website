"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { addWordAction } from "./actions";
import { useT } from "@/lib/i18n/client";

export function QuickAdd() {
  const [state, action, pending] = useActionState(addWordAction, null);
  const t = useT();
  return (
    <form action={action} className="rounded-2xl border border-line bg-surface p-4">
      <label htmlFor="quick-word" className="text-sm font-medium">
        {t("Save a Dutch word")}
      </label>
      <div className="mt-2 flex gap-2">
        <Input
          id="quick-word"
          name="word"
          placeholder={t("e.g. gezellig, afspreken, het huis")}
          autoComplete="off"
          required
          maxLength={80}
          aria-describedby="quick-word-hint"
          aria-invalid={state?.error ? true : undefined}
        />
        <Button type="submit" disabled={pending} className="shrink-0">
          <Plus aria-hidden className="size-4" />
          {pending ? t("Adding…") : t("Add")}
        </Button>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Input name="meaning" placeholder={t("Meaning (optional, auto-filled)")} autoComplete="off" maxLength={300} aria-label={t("Meaning in English")} />
        <Input name="example" placeholder={t("Example (optional, auto-filled)")} autoComplete="off" maxLength={300} aria-label={t("Example sentence")} />
      </div>
      <p id="quick-word-hint" className="mt-1.5 text-xs text-muted">
        {pending ? t("Adding…") : t("Meaning, word type and an example are looked up in Wiktionary. Fill the fields only to override them.")}
      </p>
      {state?.error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {t(state.error)}
        </p>
      )}
    </form>
  );
}
