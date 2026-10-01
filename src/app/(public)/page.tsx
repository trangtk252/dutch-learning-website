import { BookOpen, GraduationCap, Headphones, Layers, Mic, PenLine } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const FEATURES = [
  { icon: Layers, title: "Vocabulary that sticks", text: "Save words from anything you read or hear. Each word is enriched with gender, plurals, conjugations and examples, and scheduled with the FSRS spaced-repetition algorithm." },
  { icon: Mic, title: "A patient speaking partner", text: "Practise real situations — the huisarts, a job interview, the gemeente — by voice or text. Get corrections and a short report after each conversation." },
  { icon: Headphones, title: "Listening at your level", text: "Short dialogues and announcements with transcripts and questions, plus curated podcasts and series from legitimate sources." },
  { icon: BookOpen, title: "Reading with a tap-to-translate", text: "Texts from A2 to C1. Tap any word to see its meaning and save it to your deck." },
  { icon: PenLine, title: "Writing feedback", text: "Write emails and opinions, get corrections, explanations and a more natural version." },
  { icon: GraduationCap, title: "NT2 preparation", text: "Original practice exams in practice or timed exam mode, with a readiness overview per skill." },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-24">
        <p className="text-sm font-medium text-primary">For English speakers · A2 → B1 → B2 → C1</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Learn Dutch a little every day — and actually use it.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          A calm daily plan that combines spaced-repetition vocabulary, an AI speaking partner, listening and reading practice,
          grammar that targets <em>your</em> recurring mistakes, and NT2 exam preparation.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/signup" size="lg">Create your plan</ButtonLink>
          <ButtonLink href="/blog" size="lg" variant="secondary">Read the blog</ButtonLink>
        </div>
      </section>
      <section aria-label="Features" className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <f.icon aria-hidden className="size-6 text-primary" />
              <h2 className="mt-3 font-semibold">{f.title}</h2>
              <p className="mt-1.5 text-sm text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
