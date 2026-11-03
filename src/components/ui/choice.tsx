"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Accessible card-style radio group. */
export function RadioCards<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  legend: ReactNode;
  options: { value: T; label: ReactNode; description?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  columns?: 2 | 3 | 5;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">{legend}</legend>
      <div className={cn("grid gap-2", { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 5: "grid-cols-5" }[columns])}>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40",
              value === o.value ? "border-primary bg-primary-soft" : "border-line bg-surface hover:bg-surface-2",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span className="block font-medium text-ink">{o.label}</span>
            {o.description && <span className="mt-0.5 block text-xs text-muted">{o.description}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Accessible toggle-chip checkbox group. */
export function CheckChips<T extends string>({
  legend,
  options,
  value,
  onChange,
  hint,
}: {
  legend: ReactNode;
  options: { value: T; label: ReactNode }[];
  value: T[];
  onChange: (v: T[]) => void;
  hint?: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-ink">{legend}</legend>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = value.includes(o.value);
          return (
            <label
              key={o.value}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40",
                checked ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface text-ink hover:bg-surface-2",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => onChange(checked ? value.filter((v) => v !== o.value) : [...value, o.value])}
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
