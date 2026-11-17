import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getDataMode } from "@/lib/env";
import { getQuotes } from "@/lib/market";
import { TAPE_SYMBOLS } from "@/config/instruments";
import { TickerTape } from "@/components/TickerTape";
import { Sidebar, MobileNav } from "@/components/CategoryNav";
import { SearchBox } from "@/components/SearchBox";
import { ThemeToggle, themeScript } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "MarketPulse — L'actualité boursière par secteur", template: "%s · MarketPulse" },
  description: "Cours, actualités et agenda des marchés financiers, organisés par secteur d'activité.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const mode = getDataMode();
  const tape = await getQuotes(TAPE_SYMBOLS).catch(() => ({ quotes: [] }));
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans">
        <a href="#contenu" className="sr-only focus:not-sr-only">Aller au contenu</a>
        <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4">
            <Link href="/" className="flex shrink-0 items-center gap-2 font-bold tracking-tight">
              <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
                <rect width="32" height="32" rx="8" className="fill-brand" />
                <path d="M4 17h6l3-7 5 13 3-6h7" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Market<span className="text-brand">Pulse</span></span>
            </Link>
            <div className="flex flex-1 justify-center"><SearchBox /></div>
            {mode === "demo" && (
              <span className="hidden rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 md:inline" title="Aucune clé API configurée : données fictives">
                DÉMO · données fictives
              </span>
            )}
            <ThemeToggle />
          </div>
        </header>
        <TickerTape symbols={TAPE_SYMBOLS} initial={tape.quotes} />
        <MobileNav />
        <div className="mx-auto flex max-w-[1600px]">
          <Sidebar />
          <main id="contenu" className="min-w-0 flex-1 px-4 py-5 lg:px-6">{children}</main>
        </div>
        <Footer mode={mode} />
      </body>
    </html>
  );
}
