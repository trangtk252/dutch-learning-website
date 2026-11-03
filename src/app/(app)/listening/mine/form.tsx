"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import { addMediaAction } from "./actions";
import { useT } from "@/lib/i18n/client";

export function AddMediaForm() {
  const [state, action, pending] = useActionState(addMediaAction, null);
  const t = useT();
  return (
    <Card>
      <form action={action} className="space-y-4">
        <FormError message={state?.error} />
        <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
          <Field id="mediaType" label={t("What is it?")}>
            <Select id="mediaType" name="mediaType" defaultValue="PODCAST">
              <option value="PODCAST">{t("Podcast")}</option>
              <option value="VIDEO">{t("YouTube video")}</option>
              <option value="FILM_TV">{t("Film or TV show")}</option>
            </Select>
          </Field>
          <Field id="url" label={t("Link")} hint={t("YouTube, Apple Podcasts, a podcast RSS feed (uses the newest episode), a direct audio file — or any link, if you paste the transcript below.")}>
            <Input id="url" name="url" type="url" required placeholder="https://" />
          </Field>
        </div>
        <Field id="title" label={t("Title (optional)")} hint={t("Filled in automatically when the link tells us.")}>
          <Input id="title" name="title" maxLength={160} />
        </Field>
        <details className="rounded-xl border border-line px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium">{t("I have a transcript or subtitles (optional)")}</summary>
          <div className="mt-3">
            <Field id="transcript" label={t("Transcript")} hint={t("Plain text, or the contents of an .srt / .vtt subtitle file. Used instead of an automatic transcript — handy for Netflix, Spotify and other services we can't read.")}>
              <Textarea id="transcript" name="transcript" rows={6} />
            </Field>
          </div>
        </details>
        <Button type="submit" disabled={pending}>{pending ? t("Adding… transcribing can take a few minutes") : t("Add to my library")}</Button>
      </form>
    </Card>
  );
}
