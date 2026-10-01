import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { cookies } from "next/headers";
import { FONT_SCALE_COOKIE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-serif-reading", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Leer Nederlands — from A2 to B1 and beyond", template: "%s · Leer Nederlands" },
  description:
    "Learn Dutch with spaced-repetition vocabulary, an AI speaking partner, listening and reading practice, grammar lessons and NT2 exam preparation.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#11171b" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const scale = Number((await cookies()).get(FONT_SCALE_COOKIE)?.value ?? 100);
  const fontScale = Number.isFinite(scale) ? Math.min(150, Math.max(85, scale)) / 100 : 1;
  return (
    <html
      lang="en"
      className={`${inter.variable} ${serif.variable} h-full antialiased`}
      style={{ ["--font-scale" as string]: fontScale }}
    >
      <body className="min-h-full font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
