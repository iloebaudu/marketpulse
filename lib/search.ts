import { INSTRUMENTS } from "@/config/instruments";
import { CATEGORIES } from "@/config/categories";
import { normalize } from "@/lib/text";
import type { Article, CategoryDef, Instrument } from "@/lib/types";

export function searchInstruments(q: string, limit = 12): Instrument[] {
  const n = normalize(q).trim();
  if (!n) return [];
  const scored = INSTRUMENTS.map((i) => {
    const sym = i.symbol.toLowerCase();
    const name = normalize(i.name).trim();
    const aliases = (i.aliases ?? []).map((a) => normalize(a).trim());
    let s = 0;
    if (sym === n) s = 100;
    else if (sym.startsWith(n)) s = 80;
    else if (name.startsWith(n)) s = 70;
    else if (name.includes(n)) s = 50;
    else if (aliases.some((a) => a.startsWith(n))) s = 40;
    else if (aliases.some((a) => a.includes(n))) s = 20;
    return { i, s };
  }).filter((x) => x.s > 0);
  return scored.sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.i);
}

export function searchCategories(q: string): CategoryDef[] {
  const n = normalize(q).trim();
  if (!n) return [];
  return CATEGORIES.filter((c) => normalize(`${c.name} ${c.shortName}`).includes(n) || c.keywords.some((k) => normalize(k).trim() === n));
}

export function searchArticles(articles: Article[], q: string, limit = 30): Article[] {
  const words = normalize(q).trim().split(" ").filter(Boolean);
  if (!words.length) return [];
  const syms = new Set(searchInstruments(q, 3).filter((i) => i.symbol.toLowerCase() === words.join(" ") || normalize(i.name).trim() === words.join(" ")).map((i) => i.symbol));
  return articles
    .filter((a) => {
      if (a.symbols.some((s) => syms.has(s))) return true;
      const t = normalize(`${a.title} ${a.summary}`);
      return words.every((w) => t.includes(` ${w}`));
    })
    .slice(0, limit);
}
