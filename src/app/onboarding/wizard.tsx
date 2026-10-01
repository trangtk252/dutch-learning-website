"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckChips, RadioCards } from "@/components/ui/choice";
import { Field, FormError, Input, Textarea } from "@/components/ui/form";
import { ProgressBar } from "@/components/ui/progress";
import {
  CEFR_DESCRIPTIONS,
  CEFR_LEVELS,
  SKILL_LABELS,
  SKILLS,
  levelIndex,
  type Cefr,
  type SkillKey,
} from "@/lib/constants";
import { saveOnboarding } from "./actions";

const skillOptions = SKILLS.map((s) => ({ value: s, label: SKILL_LABELS[s] }));
const STEPS = ["Your level", "Your goal", "Your routine", "Strengths"] as const;

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [currentLevel, setCurrent] = useState<Cefr>("A2");
  const [targetLevel, setTarget] = useState<Cefr>("B1");
  const [motivation, setMotivation] = useState("");
  const [preparingNt2, setPreparing] = useState<"yes" | "no">("no");
  const [nt2Program, setProgram] = useState<"PROGRAMMA_I" | "PROGRAMMA_II">("PROGRAMMA_I");
  const [examDate, setExamDate] = useState("");
  const [dailyMinutes, setMinutes] = useState("20");
  const [preferred, setPreferred] = useState<SkillKey[]>(["VOCABULARY", "SPEAKING"]);
  const [strengths, setStrengths] = useState<SkillKey[]>([]);
  const [weaknesses, setWeaknesses] = useState<SkillKey[]>([]);

  function next() {
    setError(null);
    if (step === 0 && levelIndex(targetLevel) < levelIndex(currentLevel)) {
      setError("Your target should be the same as or above your current level.");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveOnboarding({
        currentLevel,
        targetLevel,
        motivation,
        preparingNt2: preparingNt2 === "yes",
        nt2Program: preparingNt2 === "yes" ? nt2Program : "NONE",
        examDate: preparingNt2 === "yes" && examDate ? examDate : undefined,
        dailyMinutes: Number(dailyMinutes),
        preferredActivities: preferred,
        strengths,
        weaknesses,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (res?.error) setError(res.error);
    });
  }

  const levelOptions = CEFR_LEVELS.map((l) => ({ value: l, label: l, description: CEFR_DESCRIPTIONS[l] }));

  return (
    <div className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-8">
      <div className="mb-6">
        <p className="mb-2 text-sm text-muted">
          Step {step + 1} of {STEPS.length} · <span className="font-medium text-ink">{STEPS[step]}</span>
        </p>
        <ProgressBar value={step + 1} max={STEPS.length} label="Onboarding progress" />
      </div>

      <div className="space-y-6">
        <FormError message={error} />

        {step === 0 && (
          <>
            <RadioCards name="current" legend="What is your Dutch level right now?" options={levelOptions} value={currentLevel} onChange={setCurrent} />
            <p className="text-xs text-muted">Not sure? Pick the level that feels comfortable — we use it to choose material, never as a judgement.</p>
            <RadioCards name="target" legend="Which level are you working towards?" options={levelOptions} value={targetLevel} onChange={setTarget} />
          </>
        )}

        {step === 1 && (
          <>
            <Field id="motivation" label="Why are you learning Dutch?" hint="Optional — e.g. work, partner, integration, living in Belgium.">
              <Textarea id="motivation" value={motivation} onChange={(e) => setMotivation(e.target.value)} maxLength={500} rows={3} />
            </Field>
            <RadioCards
              name="nt2"
              legend="Are you preparing for the NT2 Staatsexamen?"
              value={preparingNt2}
              onChange={setPreparing}
              options={[
                { value: "yes", label: "Yes", description: "Show exam practice and track readiness" },
                { value: "no", label: "No / not yet", description: "Focus on general Dutch" },
              ]}
            />
            {preparingNt2 === "yes" && (
              <>
                <RadioCards
                  name="program"
                  legend="Which programme?"
                  value={nt2Program}
                  onChange={setProgram}
                  options={[
                    { value: "PROGRAMMA_I", label: "Programma I", description: "B1 level — vocational education, work" },
                    { value: "PROGRAMMA_II", label: "Programma II", description: "B2 level — higher education, professional work" },
                  ]}
                />
                <Field id="examDate" label="Exam date (if known)">
                  <Input id="examDate" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="max-w-xs" />
                </Field>
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <RadioCards
              name="minutes"
              legend="How much time can you study per day?"
              value={dailyMinutes}
              onChange={setMinutes}
              columns={5}
              options={["10", "15", "20", "30", "45"].map((m) => ({ value: m, label: `${m} min` }))}
            />
            <CheckChips
              legend="Which activities do you enjoy most?"
              hint="We'll give these a bit more room in your daily plan."
              options={skillOptions}
              value={preferred}
              onChange={setPreferred}
            />
          </>
        )}

        {step === 3 && (
          <>
            <CheckChips legend="What are you already good at?" options={skillOptions} value={strengths} onChange={setStrengths} />
            <CheckChips
              legend="What would you like to improve most?"
              hint="Your plan will include these more often."
              options={skillOptions}
              value={weaknesses}
              onChange={setWeaknesses}
            />
          </>
        )}
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || pending}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button onClick={submit} disabled={pending}>
            {pending ? "Creating your plan…" : "Create my plan"}
          </Button>
        )}
      </div>
    </div>
  );
}
