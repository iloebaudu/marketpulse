/** Adaptateur Twelve Data (https://twelvedata.com/docs) — historiques et cotations de secours. */
import "server-only";
import { env } from "@/lib/env";
import { cached, fetchJson } from "@/lib/cache";
import type { Instrument, PricePoint } from "@/lib/types";

const BASE = "https://api.twelvedata.com";
export const tdSymbol = (i: Instrument) => i.providers?.twelvedata ?? i.symbol;

interface TdSeries { status: string; message?: string; values?: { datetime: string; close: string; volume?: string }[]; meta?: { exchange_timezone?: string } }
interface TdQuote { status?: string; message?: string; close: string; previous_close: string; change: string; percent_change: string; open: string; high: string; low: string; volume?: string; currency?: string }

async function series(inst: Instrument, interval: string, outputsize: number, ttl: number): Promise<PricePoint[]> {
  const { value } = await cached(`td:s:${inst.symbol}:${interval}:${outputsize}`, ttl, async () => {
    const qs = new URLSearchParams({ symbol: tdSymbol(inst), interval, outputsize: String(outputsize), timezone: "UTC", apikey: env.twelveKey });
    const r = await fetchJson<TdSeries>(`${BASE}/time_series?${qs}`);
    if (r.status !== "ok" || !r.values) throw new Error(r.message ?? "Réponse Twelve Data invalide");
    return r.values
      .map((v) => ({ t: Math.floor(Date.parse(v.datetime.replace(" ", "T") + "Z") / 1000), v: Number(v.close) }))
      .filter((p) => Number.isFinite(p.v))
      .reverse();
  });
  return value;
}

/** ~5,5 ans de clôtures quotidiennes (cache 6 h) */
export const tdDaily = (inst: Instrument, size = 300) => series(inst, "1day", size, 6 * 3600_000);
export const tdIntraday = (inst: Instrument) => series(inst, "5min", 200, 5 * 60_000);
export const tdHourly = (inst: Instrument) => series(inst, "1h", 120, 30 * 60_000);
export const tdWeekly = (inst: Instrument) => series(inst, "1week", 270, 12 * 3600_000);

export async function tdQuote(inst: Instrument): Promise<TdQuote> {
  const { value } = await cached(`td:q:${inst.symbol}`, 55_000, async () => {
    const qs = new URLSearchParams({ symbol: tdSymbol(inst), apikey: env.twelveKey });
    const r = await fetchJson<TdQuote>(`${BASE}/quote?${qs}`);
    if (r.status === "error") throw new Error(r.message ?? "Erreur Twelve Data");
    return r;
  });
  return value;
}
