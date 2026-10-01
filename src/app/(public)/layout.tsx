import Link from "next/link";
import { getSession } from "@/lib/session";
import { ButtonLink } from "@/components/ui/button";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
            <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-ink">nl</span>
            Leer Nederlands
          </Link>
          <nav aria-label="Site" className="flex items-center gap-2 text-sm">
            <Link href="/blog" className="rounded-lg px-3 py-2 text-muted hover:bg-surface-2 hover:text-ink">Blog</Link>
            {session ? (
              <ButtonLink href="/dashboard" size="sm">Go to app</ButtonLink>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-muted hover:bg-surface-2 hover:text-ink">Log in</Link>
                <ButtonLink href="/signup" size="sm">Start free</ButtonLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1">{children}</main>
      <footer className="border-t border-line py-8 text-center text-xs text-muted">
        <p>Practice scores and level estimates are not official CEFR or NT2 results.</p>
        <p className="mt-1">External media are linked to their legitimate providers; we don&apos;t host copyrighted audio or video.</p>
      </footer>
    </div>
  );
}
