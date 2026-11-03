"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { LogoutButton } from "@/components/logout-button";
import { useT } from "@/lib/i18n/client";
import { BeeMark } from "@/components/bee-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { SIDEBAR_COOKIE } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { NAV_MOBILE, NAV_PRIMARY, NAV_SECONDARY, PRACTICE_ROUTES, type NavItem } from "./nav-items";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SideLink({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const t = useT();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? t(item.label) : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
        collapsed && "justify-center px-0",
        active ? "bg-primary-soft font-semibold text-primary-strong" : "text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon aria-hidden className="size-[18px] shrink-0" />
      <span className={collapsed ? "sr-only" : undefined}>{t(item.label)}</span>
    </Link>
  );
}

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/dashboard"
      aria-label="BijNederlands"
      className={cn("flex items-center gap-2 font-semibold tracking-tight text-ink", collapsed && "justify-center")}
    >
      <BeeMark className="size-9 shrink-0" />
      {!collapsed && <span className="text-lg">Bij<span className="text-primary-strong">Nederlands</span></span>}
    </Link>
  );
}

export function AppShell({ children, defaultCollapsed = false }: { children: ReactNode; defaultCollapsed?: boolean }) {
  const t = useT();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "open"}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }
  const ToggleIcon = collapsed ? ChevronRight : ChevronLeft;

  return (
    <div className={cn("min-h-screen transition-[padding] duration-200", collapsed ? "lg:pl-[96px]" : "lg:pl-[276px]")}>
      {/* Desktop sidebar: a floating, collapsible panel */}
      <aside
        className={cn(
          "fixed bottom-3 left-3 top-3 z-30 hidden rounded-2xl border border-line bg-surface shadow-xl shadow-black/10 transition-[width] duration-200 lg:block",
          collapsed ? "w-[72px]" : "w-[252px]",
        )}
      >
        <div className={cn("flex h-full flex-col py-5", collapsed ? "px-2.5" : "px-4")}>
          <Logo collapsed={collapsed} />
          <Link
            href="/search"
            aria-label={t("Search")}
            title={collapsed ? t("Search") : undefined}
            className={cn(
              "mt-5 flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-muted hover:bg-surface-2",
              collapsed && "justify-center px-0",
            )}
          >
            <Search aria-hidden className="size-4" />
            {!collapsed && t("Search…")}
          </Link>
          <nav aria-label={t("Main")} className="mt-5 flex flex-1 flex-col gap-0.5 overflow-y-auto">
            {NAV_PRIMARY.map((item) => (
              <SideLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
            ))}
            <div className="my-3 border-t border-line" />
            {NAV_SECONDARY.map((item) => (
              <SideLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
            ))}
          </nav>
          <div className={cn("mt-4 flex gap-1", collapsed ? "flex-col items-center" : "justify-end")}>
            <LanguageToggle />
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
        {/* Collapse handle straddling the sidebar's right edge */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? t("Expand sidebar") : t("Collapse sidebar")}
          title={collapsed ? t("Expand sidebar") : t("Collapse sidebar")}
          className="absolute -right-3.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-muted shadow-sm hover:bg-surface-2 hover:text-ink"
        >
          <ToggleIcon aria-hidden className="size-4" />
        </button>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
          <Logo />
          <div className="flex items-center">
            <LanguageToggle />
            <ThemeToggle />
            <LogoutButton />
            <Link href="/search" aria-label={t("Search")} className="rounded-lg p-2 text-muted hover:bg-surface-2">
              <Search aria-hidden className="size-5" />
            </Link>
          </div>
        </header>


        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label={t("Main")}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {NAV_MOBILE.map((item) => {
          const active =
            item.href === "/practice"
              ? PRACTICE_ROUTES.some((r) => isActive(pathname, r))
              : item.href === "/more"
                ? ["/more", "/dictionary", "/grammar", "/mistakes", "/progress", "/settings", "/admin"].some((r) => isActive(pathname, r))
                : isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px]",
                active ? "font-semibold text-primary-strong" : "text-muted",
              )}
            >
              <Icon aria-hidden className="size-5" />
              {t(item.label)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
