"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/(public)/auth-actions";
import { useT } from "@/lib/i18n/client";

/** Icon button that signs the learner out; sits next to the language and theme toggles. */
export function LogoutButton() {
  const t = useT();
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        aria-label={t("Log out")}
        title={t("Log out")}
        className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink"
      >
        <LogOut aria-hidden className="size-5" />
      </button>
    </form>
  );
}
