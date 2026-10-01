"use client";

import { Fragment, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Check, Clock, Volume2, X } from "lucide-react";
import { checkAnswerAction, submitAttemptAction } from "@/lib/actions/quiz";
import type { AnswerInput, ClientQuestion, QuestionResult } from "@/lib/quiz/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { useVoice } from "@/components/voice/voice-context";
import { cn } from "@/lib/cn";

type Kind = "READING" | "LISTENING" | "GRAMMAR" | "MOCK_EXAM";

const FOCUS_LABEL: Record<string, string> = {
  MAIN_IDEA: "Main idea", DETAIL: "Detail", INFERENCE: "Inference", VOCABULARY: "Vocabulary", GRAMMAR: "Grammar",
};

function Feedback({ result }: { result: QuestionResult }) {
  return (
    <div
      role="status"
      className={cn("mt-3 rounded-xl px-3 py-2 text-sm", result.correct ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}
    >
      <p className="flex items-center gap-1.5 font-medium">
        {result.correct ? <Check aria-hidden className="size-4" /> : <X aria-hidden className="size-4" />}
        {result.correct ? "Correct" : <>Not quite — answer: <span lang="nl">{result.correctAnswer}</span></>}
      </p>
      {result.explanation && <p className="mt-1 text-ink">{result.explanation}</p>}
    </div>
  );
}

export function QuizRunner({
  questions,
  kind,
  refId,
  mode = "PRACTICE",
  set,
  timeLimitSec,
  title = "Questions",
  onComplete,
  sections,
}: {
  questions: ClientQuestion[];
  kind: Kind;
  refId: string;
  mode?: "PRACTICE" | "EXAM";
  set?: "PRACTICE" | "QUIZ";
  timeLimitSec?: number;
  title?: string;
  onComplete?: (score: { correct: number; total: number }) => void;
  /** Optional grouping (e.g. mock-exam parts): content is shown before its questions. */
  sections?: { key: string; content: ReactNode; questionIds: string[] }[];
}) {
  const { tts } = useVoice();
  const [answers, setAnswers] = useState<Record<string, AnswerInput>>({});
  const [checked, setChecked] = useState<Record<string, QuestionResult>>({});
  const [final, setFinal] = useState<{ correct: number; total: number; results: QuestionResult[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [remaining, setRemaining] = useState(timeLimitSec ?? 0);
  const submitted = useRef(false);

  const finalById = new Map(final?.results.map((r) => [r.questionId, r]) ?? []);
  const answeredCount = questions.filter((q) => answers[q.id]?.optionId || answers[q.id]?.text?.trim()).length;

  function setAnswer(q: ClientQuestion, patch: Partial<AnswerInput>) {
    if (final || (mode === "PRACTICE" && checked[q.id])) return;
    setAnswers((a) => ({ ...a, [q.id]: { ...a[q.id], questionId: q.id, ...patch } }));
  }

  function check(q: ClientQuestion) {
    const a = answers[q.id];
    if (!a) return;
    start(async () => {
      const r = await checkAnswerAction(a);
      if (r) setChecked((c) => ({ ...c, [q.id]: r }));
    });
  }

  function submit() {
    if (submitted.current) return;
    submitted.current = true;
    setError(null);
    start(async () => {
      try {
        const res = await submitAttemptAction({
          kind,
          refId,
          mode,
          set,
          answers: Object.values(answers),
          durationSec: (Date.now() - startedAt.current) / 1000,
        });
        setFinal(res);
        onComplete?.({ correct: res.correct, total: res.total });
      } catch {
        submitted.current = false;
        setError("Couldn't submit your answers. Please try again.");
      }
    });
  }

  // Exam timer: auto-submit when time runs out.
  useEffect(() => {
    if (!timeLimitSec || final) return;
    const id = setInterval(() => {
      const left = Math.max(0, timeLimitSec - Math.floor((Date.now() - startedAt.current) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        submit();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLimitSec, final]);

  const mmss = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  return (
    <section aria-labelledby="quiz-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="quiz-title" className="text-lg font-semibold">{title}</h2>
        {timeLimitSec && !final && (
          <p className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-sm tabular-nums", remaining < 60 ? "bg-danger-soft text-danger" : "bg-surface-2 text-muted")} aria-live={remaining < 60 ? "polite" : "off"}>
            <Clock aria-hidden className="size-4" /> {mmss} left
          </p>
        )}
      </div>

      {final && (
        <div role="status" className="rounded-2xl border border-primary/30 bg-primary-soft p-4">
          <p className="text-lg font-semibold">
            Score: {final.correct} / {final.total} ({Math.round((final.correct / final.total) * 100)}%)
          </p>
          <p className="text-sm text-muted">
            {mode === "EXAM" ? "Practice score — not an official NT2 result. " : ""}
            Review the explanations below. Wrong answers on grammar questions were added to <a href="/mistakes" className="text-primary underline">My mistakes</a>.
          </p>
        </div>
      )}

      {(sections ?? [{ key: "all", content: null, questionIds: questions.map((q) => q.id) }]).map((section) => (
      <Fragment key={section.key}>
      {section.content}
      <ol className="space-y-4">
        {questions.filter((q) => section.questionIds.includes(q.id)).map((q) => {
          const i = questions.indexOf(q);
          const a = answers[q.id];
          const result = finalById.get(q.id) ?? (mode === "PRACTICE" ? checked[q.id] : undefined);
          const locked = Boolean(final || (mode === "PRACTICE" && checked[q.id]));
          const textInput = q.type === "FILL_BLANK" || q.type === "DICTATION" || q.type === "OPEN";
          return (
            <li key={q.id} className="rounded-2xl border border-line bg-surface p-4">
              <fieldset disabled={locked}>
                <legend className="w-full">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">
                      <span className="text-muted">{i + 1}. </span>
                      <span lang={q.type === "DICTATION" ? "en" : "nl"}>{q.prompt}</span>
                    </span>
                    {q.focus && FOCUS_LABEL[q.focus] && <span className="shrink-0 text-xs text-muted">{FOCUS_LABEL[q.focus]}</span>}
                  </span>
                </legend>
                {q.audioText && (
                  <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => tts.speak(q.audioText!, { rate: 0.85 })}>
                    <Volume2 aria-hidden className="size-4" /> Play audio
                  </Button>
                )}
                {textInput ? (
                  <div className="mt-3">
                    <label htmlFor={`ans-${q.id}`} className="sr-only">Your answer</label>
                    <Input
                      id={`ans-${q.id}`}
                      lang="nl"
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      value={a?.text ?? ""}
                      onChange={(e) => setAnswer(q, { text: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && mode === "PRACTICE") {
                          e.preventDefault();
                          check(q);
                        }
                      }}
                      className="max-w-md"
                      placeholder={q.type === "DICTATION" ? "Type what you hear…" : "Your answer"}
                    />
                  </div>
                ) : (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {q.options.map((o) => {
                      const chosen = a?.optionId === o.id;
                      const isRight = result && o.text === result.correctAnswer;
                      return (
                        <label
                          key={o.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40",
                            chosen ? "border-primary bg-primary-soft" : "border-line hover:bg-surface-2",
                            result && isRight && "border-success bg-success-soft",
                            result && chosen && !result.correct && "border-danger bg-danger-soft",
                            locked && "cursor-default",
                          )}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={o.id}
                            checked={chosen}
                            onChange={() => setAnswer(q, { optionId: o.id })}
                            className="mt-0.5 accent-[var(--primary)]"
                          />
                          <span lang="nl">{o.text}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </fieldset>
              {mode === "PRACTICE" && !final && !checked[q.id] && (
                <Button size="sm" variant="secondary" className="mt-3" onClick={() => check(q)} disabled={!a || pending}>
                  Check
                </Button>
              )}
              {result && <Feedback result={result} />}
            </li>
          );
        })}
      </ol>
      </Fragment>
      ))}

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {!final && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={submit} disabled={pending}>
            {pending ? "Submitting…" : mode === "EXAM" ? "Hand in exam" : "Finish & save score"}
          </Button>
          <span className="text-sm text-muted">{answeredCount} of {questions.length} answered</span>
        </div>
      )}
    </section>
  );
}
