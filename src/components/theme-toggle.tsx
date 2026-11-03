"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { THEME_COOKIE } from "@/lib/constants";
import { useT } from "@/lib/i18n/client";

type Theme = "light" | "dark";

function current(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => void listeners.delete(cb);
};

/** Switches between light and dark; the choice is remembered in a cookie so the server renders it without a flash. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useT();
  const theme = useSyncExternalStore(subscribe, current, () => "light" as Theme);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    listeners.forEach((cb) => cb());
  }

  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")}
      title={theme === "dark" ? t("Light mode") : t("Dark mode")}
      className={`rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink ${className}`}
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );
}
