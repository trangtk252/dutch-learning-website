import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { getT } from "@/lib/i18n/server";
import { BeeMark } from "@/components/bee-logo";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const t = await getT();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
            <BeeMark className="size-9" />
            <span className="text-lg font-semibold tracking-tight">Bij<span className="text-primary-strong">Nederlands</span></span>
          </Link>
          <nav aria-label={t("Site")} className="flex items-center gap-2 text-sm">
            <LanguageToggle />
            <ThemeToggle />
            <ButtonLink href="/dashboard" size="sm">{t("Go to app")}</ButtonLink>
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1">{children}</main>
      <footer className="border-t border-line py-8 text-center text-xs text-muted">
        <p>{t("Practice scores and level estimates are not official CEFR or NT2 results.")}</p>
        <p className="mt-1">{t("External media are linked to their legitimate providers; we don't host copyrighted audio or video.")}</p>
      </footer>
    </div>
  );
}
