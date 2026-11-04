import { redirect } from "next/navigation";
import {
  ArrowRight, BookA, BookOpen, BookText, CircleAlert, Download, Headphones, Layers, Mic, NotebookPen, PenLine,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { getT, pageTitle } from "@/lib/i18n/server";
import { ButtonLink } from "@/components/ui/button";

export const generateMetadata = pageTitle("Your personal Dutch notebook");

export default async function HomePage() {
  // Learners who are signed in go straight to their dashboard; first-time visitors see the landing page.
  if (await getSession()) redirect("/dashboard");
  const t = await getT();

  const pillars = [
    { icon: NotebookPen, title: "Your notebook", text: "Save every word, phrase and note you meet, with its article, plural, meaning and an example sentence. Everything lives in one place that is yours." },
    { icon: Layers, title: "Your study plan", text: "Spaced-repetition flashcards bring each word back just before you forget it, and a daily plan tells you what to do today." },
    { icon: CircleAlert, title: "Your mistakes", text: "Errors from quizzes, writing and speaking are collected in one list, so you can see what keeps going wrong and fix it." },
  ];

  const skills = [
    { icon: BookA, title: "Dictionary", text: "Dutch–English and English–Dutch, with inflected forms, verb parts and examples. Save any result as a flashcard." },
    { icon: BookText, title: "Grammar", text: "Short explanations, examples with audio, common mistakes, a quiz, and a box for your own notes." },
    { icon: BookOpen, title: "Lezen", text: "Reading texts where you tap any word to see its meaning and add it to your notebook." },
    { icon: Headphones, title: "Luisteren", text: "Listening practice with questions and transcripts to check what you caught." },
    { icon: PenLine, title: "Schrijven", text: "Writing tasks, from short messages to opinions, with feedback on your text." },
    { icon: Mic, title: "Spreken", text: "Speaking situations to rehearse out loud, with a report on what to improve." },
  ];

  const steps = [
    { n: "1", title: "Tell us your level", text: "Pick your current level and goal, from A2 up to B2, including NT2 Staatsexamen preparation." },
    { n: "2", title: "Collect as you learn", text: "Look words up, tap them while reading, or add starter decks. Your notebook grows with you." },
    { n: "3", title: "Review a little every day", text: "Open Today, do your due cards and one practice activity, and watch your progress build up." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-primary-soft/60 to-bg">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="inline-block rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
              {t("For learners of Dutch")}
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              {t("Your personal Dutch notebook.")}
              <span className="block text-primary-strong">{t("And a place to study it.")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              {t("Keep the words, grammar and mistakes from your Dutch journey in one notebook, then practise them with flashcards, reading, listening, writing and speaking, at your own pace.")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/signup" size="lg">
                {t("Start your notebook")} <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary" size="lg">{t("Log in")}</ButtonLink>
            </div>
          </div>

          {/* A sample notebook page */}
          <div aria-hidden className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 rounded-2xl border border-line bg-surface-2" />
            <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <div className="flex items-baseline justify-between border-b border-dashed border-line pb-3">
                <p className="text-2xl font-semibold text-ink"><span className="text-primary-strong">het</span> huis</p>
                <p className="text-xs text-muted">/ɦœys/ · noun</p>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-xs uppercase tracking-wide text-muted">{t("Meaning")}</dt><dd className="text-ink">{t("house, home")}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-muted">{t("Plural")}</dt><dd className="text-ink">huizen · <span className="text-muted">huisje</span></dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-muted">{t("Example")}</dt><dd className="italic text-ink">Wij hebben een klein huis aan het water.</dd></div>
              </dl>
              <div className="mt-5 rounded-xl bg-primary-soft p-3 text-sm text-ink">
                <span className="font-medium">{t("My note")}:</span> {t("“het” for house, but “de” for the plural: de huizen.")}
              </div>
              <div className="mt-4 flex gap-2 text-xs">
                <span className="rounded-full bg-success-soft px-2.5 py-1 text-success">{t("Due in 3 days")}</span>
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-muted">A2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What it is for */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink">
          {t("A notebook that also teaches you back.")}
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          {t("Most apps either give you lessons or give you a place to write things down. This one does both, around the words and sentences you actually meet.")}
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary-strong">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{t(title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(text)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="border-y border-line bg-surface-2/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">{t("Everything for self-study, in one place")}</h2>
          <p className="mt-3 max-w-2xl text-muted">
            {t("Work through the four skills and the tools around them, from A2 up to B2, with content shaped like the NT2 Staatsexamen.")}
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary-strong" aria-hidden />
                <div>
                  <h3 className="font-semibold text-ink">{t(title)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{t(text)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">{t("How it works")}</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map(({ n, title, text }) => (
            <li key={n}>
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-ink">{n}</span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{t(title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(text)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Final call to action */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl bg-accent px-6 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-semibold tracking-tight text-bg">{t("Start your own Dutch notebook today")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-bg/75">
            {t("Your words, notes and progress belong to you. Create an account to keep them, and export them whenever you like.")}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/signup" size="lg">{t("Create an account")}</ButtonLink>
            <ButtonLink href="/login" size="lg" variant="secondary">{t("Log in")}</ButtonLink>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-xs text-bg/60">
            <Download className="size-3.5" aria-hidden /> {t("Download all of your data at any time.")}
          </p>
        </div>
      </section>
    </>
  );
}
