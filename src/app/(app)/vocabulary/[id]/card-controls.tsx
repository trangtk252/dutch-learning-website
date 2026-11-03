"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select, Textarea } from "@/components/ui/form";
import { deleteCardAction, updateCardAction } from "../actions";
import { useT } from "@/lib/i18n/client";

export function CardControls({ cardId, note, importance, suspended }: { cardId: string; note: string; importance: number; suspended: boolean }) {
  const [pending, start] = useTransition();
  const t = useT();
  const [saved, setSaved] = useState(false);
  const [noteValue, setNote] = useState(note);
  const [imp, setImp] = useState(String(importance));

  return (
    <Card className="space-y-4">
      <h2 className="font-semibold">{t("Your notes")}</h2>
      <Field id="note" label={t("Personal note")} hint={t("Mnemonics, your own example, where you heard it…")}>
        <Textarea id="note" value={noteValue} onChange={(e) => { setNote(e.target.value); setSaved(false); }} maxLength={2000} rows={3} />
      </Field>
      <Field id="importance" label={t("Importance")}>
        <Select id="importance" value={imp} onChange={(e) => { setImp(e.target.value); setSaved(false); }}>
          <option value="1">{t("Low")}</option>
          <option value="2">{t("Normal")}</option>
          <option value="3">{t("High")}</option>
        </Select>
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() => start(async () => { await updateCardAction(cardId, { personalNote: noteValue, importance: Number(imp) }); setSaved(true); })}
        >
          {t("Save")}
        </Button>
        <span role="status" className="text-xs text-success">{saved ? t("Saved") : ""}</span>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => start(() => updateCardAction(cardId, { suspended: !suspended }))}>
          {suspended ? t("Resume reviews") : t("Suspend reviews")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-danger!"
          disabled={pending}
          onClick={() => {
            if (confirm(t("Remove this word from your vocabulary? Its review history will be deleted."))) start(() => deleteCardAction(cardId));
          }}
        >
          {t("Remove word")}
        </Button>
      </div>
    </Card>
  );
}
