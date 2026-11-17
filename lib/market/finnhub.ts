/** Adaptateur Finnhub (https://finnhub.io/docs/api) — cotations, profil, ratios, news, agenda résultats. */
import "server-only";
import { env } from "@/lib/env";
import { cached, fetchJson } from "@/lib/cache";
import type { Instrument } from "@/lib/types";

const BASE = "https://finnhub.io/api/v1";
const url = (path: string, params: Record<string, string>) =>
  `${BASE}${path}?${new URLSearchParams({ ...params, token: env.finnhubKey })}`;

export const finnhubSymbol = (i: Instrument) => i.providers?.finnhub ?? i.symbol;

export interface FhQuote { c: number; d: number | null; dp: number | null; h: number; l: number; o: number; pc: number; t: number }

export async function fhQuote(inst: Instrument): Promise<FhQuote> {
  const { value } = await cached(`fh:q:${inst.symbol}`, 55_000, async () => {
    const q = await fetchJson<FhQuote>(url("/quote", { symbol: finnhubSymbol(inst) }));
    if (!q || !q.c) throw new Error("Symbole non couvert par Finnhub");
    return q;
  });
  return value;
}

export interface FhFundamentals { marketCap: number | null; pe: number | null; dividendYield: number | null; currency?: string }

/** Profil + ratios (cache 12 h : ces données bougent peu). */
export async function fhFundamentals(inst: Instrument): Promise<FhFundamentals> {
  const { value } = await cached(`fh:f:${inst.symbol}`, 12 * 3600_000, async () => {
    const sym = finnhubSymbol(inst);
    const [profile, metric] = await Promise.all([
      fetchJson<{ marketCapitalization?: number; currency?: string }>(url("/stock/profile2", { symbol: sym })).catch(() => ({} as { marketCapitalization?: number; currency?: string })),
      fetchJson<{ metric?: Record<string, number> }>(url("/stock/metric", { symbol: sym, metric: "all" })).catch(() => ({} as { metric?: Record<string, number> })),
    ]);
    const m = metric.metric ?? {};
    return {
      marketCap: profile.marketCapitalization ? profile.marketCapitalization / 1000 : null, // millions → milliards
      pe: m.peTTM ?? m.peBasicExclExtraTTM ?? null,
      dividendYield: m.currentDividendYieldTTM ?? m.dividendYieldIndicatedAnnual ?? null,
      currency: profile.currency,
    };
  });
  return value;
}

export interface FhNews { id: number; headline: string; summary: string; url: string; source: string; datetime: number; related: string }

export async function fhMarketNews(category: "general" | "crypto" | "merger"): Promise<FhNews[]> {
  return fetchJson<FhNews[]>(url("/news", { category }));
}

export async function fhCompanyNews(symbol: string, fromIso: string, toIso: string): Promise<FhNews[]> {
  return fetchJson<FhNews[]>(url("/company-news", { symbol, from: fromIso, to: toIso }));
}

export interface FhEarning { date: string; hour: string; symbol: string; epsEstimate: number | null; quarter: number; year: number }

export async function fhEarningsCalendar(fromIso: string, toIso: string): Promise<FhEarning[]> {
  const { value } = await cached(`fh:earn:${fromIso}:${toIso}`, 6 * 3600_000, async () => {
    const r = await fetchJson<{ earningsCalendar: FhEarning[] }>(url("/calendar/earnings", { from: fromIso, to: toIso }));
    return r.earningsCalendar ?? [];
  });
  return value;
}
