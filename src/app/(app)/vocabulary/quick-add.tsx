"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { addWordAction } from "./actions";

export function QuickAdd({ aiMock }: { aiMock: boolean }) {
  const [state, action, pending] = useActionState(addWordAction, null);
  return (
    <form action={action} className="rounded-2xl border border-line bg-surface p-4">
      <label htmlFor="quick-word" className="text-sm font-medium">
        Save a Dutch word
      </label>
      <div className="mt-2 flex gap-2">
        <Input
          id="quick-word"
          name="word"
          placeholder="e.g. gezellig, afspreken, het huis"
          autoComplete="off"
          required
          maxLength={80}
          aria-describedby="quick-word-hint"
          aria-invalid={state?.error ? true : undefined}
        />
        <Button type="submit" disabled={pending} className="shrink-0">
          <Plus aria-hidden className="size-4" />
          {pending ? "Adding…" : "Add"}
        </Button>
      </div>
      <p id="quick-word-hint" className="mt-1.5 text-xs text-muted">
        {pending
          ? aiMock
            ? "Looking it up…"
            : "Looking it up and adding meaning, forms and examples…"
          : "We'll fill in the meaning, article, plural or conjugation, and example sentences."}
      </p>
      {state?.error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
