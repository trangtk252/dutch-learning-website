import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { cookies } from "next/headers";
import { FONT_SCALE_COOKIE, THEME_COOKIE } from "@/lib/constants";
import { I18nProvider } from "@/lib/i18n/client";
import { getLocale, getT, loadDictionary } from "@/lib/i18n/server";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-serif-reading", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: { default: t("BijNederlands — learn Dutch from A2 to B1 and beyond"), template: "%s · BijNederlands" },
    description: t(
      "Learn Dutch with spaced-repetition vocabulary, an AI speaking partner, listening and reading practice, writing practice and mistake tracking.",
    ),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9f1" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1b1b" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const locale = await getLocale();
  const t = await getT();
  const scale = Number(jar.get(FONT_SCALE_COOKIE)?.value ?? 100);
  const theme = jar.get(THEME_COOKIE)?.value;
  const fontScale = Number.isFinite(scale) ? Math.min(150, Math.max(85, scale)) / 100 : 1;
  return (
    <html
      suppressHydrationWarning
      lang={locale}
      data-theme={theme === "light" || theme === "dark" ? theme : undefined}
      className={`${inter.variable} ${serif.variable} h-full antialiased`}
      style={{ ["--font-scale" as string]: fontScale }}
    >
      <body className="min-h-full font-sans" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-ink"
        >
          {t("Skip to content")}
        </a>
        <I18nProvider locale={locale} dictionary={await loadDictionary(locale)}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
