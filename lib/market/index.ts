/**
 * Service de données de marché : choisit la source selon le mode (démo / live),
 * gère le cache et les erreurs. En mode live, aucune donnée fictive n'est mélangée :
 * une donnée indisponible est affichée « — ».
 */
import "server-only";
import { getDataMode, env } from "@/lib/env";
import { cached } from "@/lib/cache";
import { getInstrument } from "@/config/instruments";
import { sectorPerf } from "@/lib/sector";
export { sectorPerf };
import { CATEGORIES } from "@/config/categories";
import type { ApiError, Instrument, PricePoint, Quote, Range, SectorSummary } from "@/lib/types";
import { mockHistory, mockQuote } from "./mock";
import { fhFundamentals, fhQuote } from "./finnhub";
import { tdDaily, tdHourly, tdIntraday, tdQuote, tdWeekly } from "./twelvedata";

export interface QuotesResult {
  quotes: Quote[];
  errors: ApiError[];
  mode: "demo" | "live";
  updatedAt: number;
}

function emptyQuote(inst: Instrument): Quote {
  return {
    symbol: inst.symbol, name: inst.name, currency: inst.currency, class: inst.class,
    price: null, change: null, changePct: null, prevClose: null, open: null, high: null, low: null,
    volume: null, marketCap: null, capCurrency: inst.capCurrency ?? inst.currency, pe: null, dividendYield: null,
    perf: { d: null, w: null, m: null, y: null }, spark: [], updatedAt: Date.now(), source: "unavailable",
  };
}

async function liveQuote(inst: Instrument, errors: ApiError[]): Promise<Quote> {
  const q = emptyQuote(inst);
  // 1) cotation : Finnhub, puis Twelve Data en secours
  let ok = false;
  if (env.finnhubKey) {
    try {
      const f = await fhQuote(inst);
      Object.assign(q, { price: f.c, change: f.d, changePct: f.dp, prevClose: f.pc, open: f.o, high: f.h, low: f.l, source: "finnhub", updatedAt: f.t * 1000 || Date.now() });
      ok = true;
    } catch (e) {
      errors.push({ source: `Finnhub (${inst.symbol})`, message: (e as Error).message });
    }
  }
  if (!ok && env.twelveKey) {
    try {
      const t = await tdQuote(inst);
      Object.assign(q, {
        price: Number(t.close), change: Number(t.change), changePct: Number(t.percent_change), prevClose: Number(t.previous_close),
        open: Number(t.open), high: Number(t.high), low: Number(t.low), volume: t.volume ? Number(t.volume) : null, source: "twelvedata",
      });
      ok = true;
    } catch (e) {
      errors.push({ source: `Twelve Data (${inst.symbol})`, message: (e as Error).message });
    }
  }
  // 2) fondamentaux (actions uniquement)
  if (env.finnhubKey && inst.class === "stock") {
    try {
      const f = await fhFundamentals(inst);
      q.marketCap = f.marketCap;
      q.pe = f.pe;
      q.dividendYield = f.dividendYield;
      if (f.currency) q.capCurrency = f.currency;
    } catch { /* non bloquant */ }
  }
  // 3) historique quotidien → performances + sparkline
  if (env.twelveKey) {
    try {
      const daily = await tdDaily(inst);
      const closes = daily.map((p) => p.v);
      const price = q.price ?? closes[closes.length - 1];
      const ago = (n: number) => closes[closes.length - 1 - n];
      const pct = (ref?: number) => (ref && price ? (price / ref - 1) * 100 : null);
      q.perf = { d: q.changePct, w: pct(ago(5)), m: pct(ago(21)), y: pct(ago(252)) };
      q.spark = [...closes.slice(-22), ...(q.price ? [q.price] : [])];
    } catch (e) {
      errors.push({ source: `Historique (${inst.symbol})`, message: (e as Error).message });
    }
  }
  q.perf.d = q.changePct;
  return q;
}

export async function getQuotes(symbols: string[]): Promise<QuotesResult> {
  const mode = getDataMode();
  const insts = Array.from(new Set(symbols)).map(getInstrument).filter((i): i is Instrument => !!i);
  const errors: ApiError[] = [];
  const now = Date.now();
  let quotes: Quote[];
  if (mode === "demo") {
    quotes = insts.map((i) => mockQuote(i, now));
  } else {
    quotes = await Promise.all(
      insts.map(async (i) => {
        try {
          const { value, stale } = await cached(`q:${i.symbol}`, 55_000, () => liveQuote(i, errors));
          return stale ? { ...value, stale: true } : value;
        } catch (e) {
          errors.push({ source: i.symbol, message: (e as Error).message });
          return emptyQuote(i);
        }
      }),
    );
  }
  return { quotes, errors: dedupeErrors(errors), mode, updatedAt: now };
}

function dedupeErrors(errors: ApiError[]): ApiError[] {
  const seen = new Set<string>();
  return errors.filter((e) => (seen.has(e.source) ? false : (seen.add(e.source), true))).slice(0, 10);
}

export async function getHistory(symbol: string, range: Range): Promise<{ points: PricePoint[]; error?: string }> {
  const inst = getInstrument(symbol);
  if (!inst) return { points: [], error: "Valeur inconnue" };
  if (getDataMode() === "demo") return { points: mockHistory(inst, range) };
  if (!env.twelveKey) return { points: [], error: "Historique indisponible : ajoutez TWELVEDATA_API_KEY." };
  try {
    switch (range) {
      case "1J": {
        const pts = await tdIntraday(inst);
        const lastDay = pts.length ? new Date(pts[pts.length - 1].t * 1000).toISOString().slice(0, 10) : "";
        return { points: pts.filter((p) => new Date(p.t * 1000).toISOString().slice(0, 10) === lastDay) };
      }
      case "1S": {
        const pts = await tdHourly(inst);
        const from = Date.now() / 1000 - 7 * 86400;
        return { points: pts.filter((p) => p.t >= from) };
      }
      case "1M": return { points: (await tdDaily(inst)).slice(-22) };
      case "1A": return { points: (await tdDaily(inst)).slice(-252) };
      case "5A": return { points: await tdWeekly(inst) };
    }
  } catch (e) {
    return { points: [], error: `Source indisponible : ${(e as Error).message}` };
  }
}

export async function getSectorSummaries(): Promise<{ sectors: SectorSummary[]; errors: ApiError[]; mode: "demo" | "live" }> {
  const all = Array.from(new Set(CATEGORIES.flatMap((c) => c.symbols)));
  const { quotes, errors, mode } = await getQuotes(all);
  const bySym = new Map(quotes.map((q) => [q.symbol, q]));
  const sectors = CATEGORIES.map((c) => {
    const qs = c.symbols.map((s) => bySym.get(s)).filter((q): q is Quote => !!q);
    return { slug: c.slug, perf: sectorPerf(qs), count: qs.length };
  });
  return { sectors, errors, mode };
}
