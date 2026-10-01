"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select, Textarea } from "@/components/ui/form";
import { deleteCardAction, updateCardAction } from "../actions";

export function CardControls({ cardId, note, importance, suspended }: { cardId: string; note: string; importance: number; suspended: boolean }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [noteValue, setNote] = useState(note);
  const [imp, setImp] = useState(String(importance));

  return (
    <Card className="space-y-4">
      <h2 className="font-semibold">Your notes</h2>
      <Field id="note" label="Personal note" hint="Mnemonics, your own example, where you heard it…">
        <Textarea id="note" value={noteValue} onChange={(e) => { setNote(e.target.value); setSaved(false); }} maxLength={2000} rows={3} />
      </Field>
      <Field id="importance" label="Importance">
        <Select id="importance" value={imp} onChange={(e) => { setImp(e.target.value); setSaved(false); }}>
          <option value="1">Low</option>
          <option value="2">Normal</option>
          <option value="3">High</option>
        </Select>
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() => start(async () => { await updateCardAction(cardId, { personalNote: noteValue, importance: Number(imp) }); setSaved(true); })}
        >
          Save
        </Button>
        <span role="status" className="text-xs text-success">{saved ? "Saved" : ""}</span>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => start(() => updateCardAction(cardId, { suspended: !suspended }))}>
          {suspended ? "Resume reviews" : "Suspend reviews"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-danger!"
          disabled={pending}
          onClick={() => {
            if (confirm("Remove this word from your vocabulary? Its review history will be deleted.")) start(() => deleteCardAction(cardId));
          }}
        >
          Remove word
        </Button>
      </div>
    </Card>
  );
}
