"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormError, Input } from "@/components/ui/form";
import { importCsvAction } from "../actions";

export function ImportForm() {
  const [state, action, pending] = useActionState(importCsvAction, null);
  return (
    <Card>
      <form action={action} className="space-y-4">
        {state && "error" in state && <FormError message={state.error} />}
        <Field id="file" label="CSV file">
          <Input id="file" name="file" type="file" accept=".csv,text/csv" required className="h-auto py-2" />
        </Field>
        <Button type="submit" disabled={pending}>{pending ? "Importing…" : "Import"}</Button>
      </form>
      {state && "imported" in state && (
        <div role="status" className="mt-4 rounded-xl bg-success-soft p-3 text-sm text-success">
          <p><strong>{state.imported}</strong> words added to your deck{state.existing ? ` (${state.existing} matched existing dictionary entries)` : ""}.</p>
          {state.skipped.length > 0 && (
            <details className="mt-2 text-ink">
              <summary>{state.skipped.length} row(s) skipped</summary>
              <ul className="mt-1 list-disc pl-5">
                {state.skipped.slice(0, 50).map((s) => <li key={s.row}>Row {s.row}: {s.reason}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </Card>
  );
}
