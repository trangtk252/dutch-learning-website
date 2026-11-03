"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
import { useLocale, useT } from "@/lib/i18n/client";

/** Switches the interface between English and Vietnamese; the choice is kept in a cookie. */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();

  function toggle() {
    const next = locale === "vi" ? "en" : "vi";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={locale === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}
      title={locale === "vi" ? "English" : "Tiếng Việt"}
      className={`flex items-center gap-1 rounded-lg p-2 text-sm text-muted hover:bg-surface-2 hover:text-ink ${className}`}
    >
      <Languages aria-hidden className="size-5" />
      <span className="font-medium">{locale === "vi" ? "VI" : "EN"}</span>
      <span className="sr-only">{t("Language")}</span>
    </button>
  );
}
