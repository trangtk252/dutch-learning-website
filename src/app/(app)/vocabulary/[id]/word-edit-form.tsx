"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import { CEFR_LEVELS, PARTS_OF_SPEECH, POS_LABELS } from "@/lib/constants";
import { updateWordAction } from "../actions";

interface Props {
  cardId: string;
  word: { english: string; partOfSpeech: string; article: string | null; plural: string | null; cefrLevel: string | null; notes: string | null; example: string; exampleEnglish: string };
}

export function WordEditForm({ cardId, word }: Props) {
  const [state, action, pending] = useActionState(updateWordAction.bind(null, cardId), null);
  return (
    <Card>
      <details>
        <summary className="cursor-pointer font-semibold">Edit this entry</summary>
        <form action={action} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><FormError message={state?.error} /></div>
          {state?.ok && <p role="status" className="text-sm text-success sm:col-span-2">Saved.</p>}
          <Field id="english" label="English meaning" className="sm:col-span-2">
            <Input id="english" name="english" defaultValue={word.english} required maxLength={300} />
          </Field>
          <Field id="partOfSpeech" label="Word type">
            <Select id="partOfSpeech" name="partOfSpeech" defaultValue={word.partOfSpeech}>
              {PARTS_OF_SPEECH.map((p) => <option key={p} value={p}>{POS_LABELS[p]}</option>)}
            </Select>
          </Field>
          <Field id="article" label="Article (nouns)">
            <Select id="article" name="article" defaultValue={word.article ?? ""}>
              <option value="">—</option><option value="DE">de</option><option value="HET">het</option><option value="DE_HET">de / het</option>
            </Select>
          </Field>
          <Field id="plural" label="Plural">
            <Input id="plural" name="plural" defaultValue={word.plural ?? ""} maxLength={80} />
          </Field>
          <Field id="cefrLevel" label="CEFR level">
            <Select id="cefrLevel" name="cefrLevel" defaultValue={word.cefrLevel ?? ""}>
              <option value="">Unknown</option>
              {CEFR_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </Field>
          <Field id="example" label="Example sentence (Dutch)" className="sm:col-span-2">
            <Input id="example" name="example" defaultValue={word.example} maxLength={300} lang="nl" />
          </Field>
          <Field id="exampleEnglish" label="Example translation" className="sm:col-span-2">
            <Input id="exampleEnglish" name="exampleEnglish" defaultValue={word.exampleEnglish} maxLength={300} />
          </Field>
          <Field id="notes" label="Usage notes" className="sm:col-span-2">
            <Textarea id="notes" name="notes" defaultValue={word.notes ?? ""} maxLength={2000} rows={2} />
          </Field>
          <div className="sm:col-span-2"><Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save entry"}</Button></div>
        </form>
      </details>
    </Card>
  );
}
