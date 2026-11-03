import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WritingEditor } from "./editor";
import { getT, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Write");

export default async function NewWritingPage({ searchParams }: PageProps<"/writing/new">) {
  await requireProfile();
  const t = await getT();
  const { prompt: slug } = await searchParams;
  const prompt = typeof slug === "string" ? await db.writingPrompt.findUnique({ where: { slug } }) : null;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/writing" className="text-sm text-primary-strong hover:underline">{t("← Writing")}</Link>
      {prompt ? (
        <Card>
          <div className="flex flex-wrap gap-1.5">
            <LevelBadge level={prompt.level} />
            <Badge>{t("{register} register", { register: t(prompt.register.toLowerCase()) })}</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-semibold">{prompt.title}</h1>
          <p className="mt-2">{prompt.instructions}</p>
          <p className="mt-2 text-sm text-muted">{t("Write {min}–{max} words in Dutch.", { min: prompt.minWords, max: prompt.maxWords })}</p>
        </Card>
      ) : (
        <header>
          <h1 className="text-2xl font-semibold">{t("Free writing")}</h1>
          <p className="mt-1 text-muted">{t("Write anything in Dutch — a message, diary entry or answer — and get feedback.")}</p>
        </header>
      )}
      <WritingEditor promptId={prompt?.id} minWords={prompt?.minWords} maxWords={prompt?.maxWords} />
    </div>
  );
}
