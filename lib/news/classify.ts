/**
 * Classement des articles par catégorie, à partir des règles de config/categories.ts
 * (mots-clés) et des valeurs de config/instruments.ts (noms, alias, tickers).
 */
import { CATEGORIES } from "@/config/categories";
import { INSTRUMENTS } from "@/config/instruments";
import { containsPhrase, normalize } from "@/lib/text";
import type { CategoryDef } from "@/lib/types";

interface CompiledCat { slug: string; keywords: string[]; symbols: Set<string> }
interface CompiledInst { symbol: string; phrases: string[]; ticker: RegExp | null }

const strip = (s: string) => normalize(s).trim();

function compileCategory(c: Pick<CategoryDef, "slug" | "keywords" | "symbols">): CompiledCat {
  return { slug: c.slug, keywords: c.keywords.map(strip).filter(Boolean), symbols: new Set(c.symbols) };
}

const COMPILED_CATS = CATEGORIES.map(compileCategory);

// Tickers trop courts ou ambigus ignorés pour la détection en majuscules
const TICKER_BLACKLIST = new Set(["COIN", "META", "SAP", "IBM", "AMD", "BP"]);
const COMPILED_INSTS: CompiledInst[] = INSTRUMENTS.filter((i) => i.class !== "index" || (i.aliases?.length ?? 0) > 0).map((i) => {
  const plainTicker = /^[A-Z]{3,5}$/.test(i.symbol) && !TICKER_BLACKLIST.has(i.symbol) ? i.symbol : null;
  return {
    symbol: i.symbol,
    phrases: Array.from(new Set([i.name, ...(i.aliases ?? [])].map(strip).filter((p) => p.length >= 2))),
    ticker: plainTicker ? new RegExp(`(^|[^A-Za-z0-9$])\\$?${plainTicker}([^A-Za-z0-9]|$)`) : null,
  };
});

/** Valeurs mentionnées dans un texte */
export function detectSymbols(text: string, extra: string[] = []): string[] {
  const norm = normalize(text);
  const found = new Set<string>(extra.filter((s) => COMPILED_INSTS.some((c) => c.symbol === s)));
  for (const inst of COMPILED_INSTS) {
    if (inst.phrases.some((p) => containsPhrase(norm, p)) || (inst.ticker && inst.ticker.test(text))) found.add(inst.symbol);
  }
  return Array.from(found);
}

export function matchesRules(text: string, symbols: string[], rules: CompiledCat): boolean {
  if (symbols.some((s) => rules.symbols.has(s))) return true;
  const norm = normalize(text);
  return rules.keywords.some((k) => containsPhrase(norm, k));
}

export function classify(title: string, summary: string, relatedSymbols: string[] = []) {
  const text = `${title} ${summary}`;
  const symbols = detectSymbols(text, relatedSymbols);
  const categories = COMPILED_CATS.filter((c) => matchesRules(text, symbols, c)).map((c) => c.slug);
  return { symbols, categories };
}

/** Filtre pour une catégorie personnalisée (valeurs + mots-clés choisis par l'utilisateur) */
export function customMatcher(symbols: string[], keywords: string[]) {
  const rules = compileCategory({ slug: "custom", symbols, keywords });
  return (a: { title: string; summary: string; symbols: string[] }) => matchesRules(`${a.title} ${a.summary}`, a.symbols, rules);
}
