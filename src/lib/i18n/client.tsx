"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import { makeT, type Dictionary, type TFunction } from "./translate";

const I18nContext = createContext<{ locale: Locale; t: TFunction }>({ locale: "en", t: makeT(null) });

export function I18nProvider({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary | null; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: makeT(dictionary) }), [locale, dictionary]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Translator for client components. */
export const useT = () => useContext(I18nContext).t;
export const useLocale = () => useContext(I18nContext).locale;
