import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WritingEditor } from "./editor";

export const metadata: Metadata = { title: "Write" };

export default async function NewWritingPage({ searchParams }: PageProps<"/writing/new">) {
  await requireProfile();
  const { prompt: slug } = await searchParams;
  const prompt = typeof slug === "string" ? await db.writingPrompt.findUnique({ where: { slug } }) : null;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/writing" className="text-sm text-primary hover:underline">← Writing</Link>
      {prompt ? (
        <Card>
          <div className="flex flex-wrap gap-1.5">
            <LevelBadge level={prompt.level} />
            <Badge>{prompt.register.toLowerCase()} register</Badge>
            {prompt.isNt2 && <Badge tone="accent">NT2-style</Badge>}
          </div>
          <h1 className="mt-3 text-2xl font-semibold">{prompt.title}</h1>
          <p className="mt-2">{prompt.instructions}</p>
          <p className="mt-2 text-sm text-muted">Write {prompt.minWords}–{prompt.maxWords} words in Dutch.</p>
        </Card>
      ) : (
        <header>
          <h1 className="text-2xl font-semibold">Free writing</h1>
          <p className="mt-1 text-muted">Write anything in Dutch — a message, diary entry or answer — and get feedback.</p>
        </header>
      )}
      <WritingEditor promptId={prompt?.id} minWords={prompt?.minWords} maxWords={prompt?.maxWords} />
    </div>
  );
}
