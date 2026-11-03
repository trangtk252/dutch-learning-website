import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale, type Locale } from "./config";
import { makeT, type Dictionary, type TFunction } from "./translate";

export async function loadDictionary(locale: Locale): Promise<Dictionary | null> {
  if (locale === "vi") return (await import("./dictionaries/vi")).vi;
  return null;
}

export async function getLocale(): Promise<Locale> {
  return parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}

/** Translator for server components, server actions and `generateMetadata`. */
export const getT = cache(async (): Promise<TFunction> => makeT(await loadDictionary(await getLocale())));

/** `export const generateMetadata = pageTitle("Reading");` — a page title that follows the interface language. */
export const pageTitle = (title: string) => async (): Promise<{ title: string }> => ({ title: (await getT())(title) });
