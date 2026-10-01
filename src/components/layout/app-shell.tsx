"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_MOBILE, NAV_PRIMARY, NAV_SECONDARY, PRACTICE_ROUTES, type NavItem } from "./nav-items";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SideLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
        active ? "bg-primary-soft font-semibold text-primary" : "text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon aria-hidden className="size-[18px] shrink-0" />
      {item.label}
    </Link>
  );
}

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight text-ink">
      <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-ink">
        nl
      </span>
      <span>Leer Nederlands</span>
    </Link>
  );
}

export function AppShell({
  children,
  userName,
  isAdmin,
  aiMock,
}: {
  children: ReactNode;
  userName: string;
  isAdmin: boolean;
  aiMock: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-line bg-surface lg:block">
        <div className="sticky top-0 flex h-screen flex-col px-4 py-5">
        <Logo />
        <Link
          href="/search"
          className="mt-5 flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-muted hover:bg-surface-2"
        >
          <Search aria-hidden className="size-4" /> Search…
        </Link>
        <nav aria-label="Main" className="mt-5 flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {NAV_PRIMARY.map((item) => (
            <SideLink key={item.href} item={item} pathname={pathname} />
          ))}
          <div className="my-3 border-t border-line" />
          {NAV_SECONDARY.map((item) => (
            <SideLink key={item.href} item={item} pathname={pathname} />
          ))}
          {isAdmin && (
            <Link
              href="/admin/blog"
              className={cn(
                "mt-1 rounded-xl px-3 py-2 text-sm",
                isActive(pathname, "/admin") ? "bg-primary-soft font-semibold text-primary" : "text-muted hover:bg-surface-2",
              )}
            >
              Admin · Blog
            </Link>
          )}
        </nav>
        <p className="mt-4 truncate px-3 text-xs text-muted">Signed in as {userName}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
          <Logo />
          <Link href="/search" aria-label="Search" className="rounded-lg p-2 text-muted hover:bg-surface-2">
            <Search aria-hidden className="size-5" />
          </Link>
        </header>

        {aiMock && (
          <div className="border-b border-warning/30 bg-warning-soft px-4 py-2 text-center text-xs text-warning" role="note">
            Offline AI mode: feedback comes from a simple rule checker. Set <code>AI_PROVIDER=anthropic</code> for full AI tutoring.
          </div>
        )}

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {NAV_MOBILE.map((item) => {
          const active =
            item.href === "/practice"
              ? PRACTICE_ROUTES.some((r) => isActive(pathname, r))
              : item.href === "/more"
                ? ["/more", "/mistakes", "/progress", "/settings", "/admin"].some((r) => isActive(pathname, r))
                : isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px]",
                active ? "font-semibold text-primary" : "text-muted",
              )}
            >
              <Icon aria-hidden className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
