"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormError, Input, Select } from "@/components/ui/form";
import { CEFR_LEVELS, READING_GENRE_LABELS } from "@/lib/constants";
import { generateReadingAction } from "../actions";

export function GenerateReadingForm({ defaultLevel }: { defaultLevel: string }) {
  const [state, action, pending] = useActionState(generateReadingAction, null);
  return (
    <Card>
      <form action={action} className="space-y-4">
        <FormError message={state?.error} />
        <Field id="level" label="Level">
          <Select id="level" name="level" defaultValue={defaultLevel}>
            {CEFR_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </Select>
        </Field>
        <Field id="genre" label="Text type">
          <Select id="genre" name="genre" defaultValue="EVERYDAY">
            {Object.entries(READING_GENRE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field id="topic" label="Topic" hint="e.g. a day at the market, a problem with a neighbour, working from home">
          <Input id="topic" name="topic" required maxLength={120} />
        </Field>
        <Button type="submit" disabled={pending}>{pending ? "Writing your text… (this can take a little while)" : "Generate"}</Button>
      </form>
    </Card>
  );
}
