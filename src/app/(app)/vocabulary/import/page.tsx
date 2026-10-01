import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ImportForm } from "./import-form";

export const metadata: Metadata = { title: "Import vocabulary" };

export default async function ImportPage() {
  await requireProfile();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/vocabulary" className="text-sm text-primary hover:underline">← Vocabulary</Link>
      <PageHeader title="Import vocabulary" description="Upload a CSV file to add words to your deck." />
      <Card>
        <h2 className="font-semibold">File format</h2>
        <p className="mt-1 text-sm text-muted">
          The first row must contain column names. Only <strong>Dutch</strong> is required; <strong>English</strong> is required for words
          that aren&apos;t in our dictionary yet. Words that already exist reuse the curated entry.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-surface-2 p-3 text-xs">
{`Dutch,English,Part of Speech,CEFR,Example,Notes
gezellig,cosy,adjective,A2,Het was gezellig.,
het huis,house,noun,A1,,my first word
afspreken,to arrange to meet,verb,A2,,`}
        </pre>
        <p className="mt-3 text-xs text-muted">
          Tip: Anki users can export a deck as “Notes in Plain Text” with a header row and rename the columns. Up to 2,000 rows per file.
        </p>
      </Card>
      <ImportForm />
    </div>
  );
}
