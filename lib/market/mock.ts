/**
 * Générateur de données de marché FICTIVES mais réalistes (mode démo).
 * - Marche aléatoire géométrique déterministe (même résultat pour tous les visiteurs),
 * - facteurs de corrélation marché / secteur / idiosyncratique,
 * - évolution intraday toutes les minutes (heure de Paris).
 */
import type { Instrument, PricePoint, Quote, Range } from "@/lib/types";
import { gauss, u01 } from "@/lib/random";
import { parisDate, parisMinutes, parisOffsetSec } from "@/lib/format";

const DAY = 86_400_000;
const ANCHOR = dayIndex("2026-11-02");
const STEPS = 288; // pas de 5 minutes

function dayIndex(iso: string): number {
  return Math.floor(Date.parse(`${iso}T00:00:00Z`) / DAY);
}
function isWeekend(d: number): boolean {
  const wd = new Date(d * DAY).getUTCDay();
  return wd === 0 || wd === 6;
}
function trades(inst: Instrument, d: number): boolean {
  return inst.class === "crypto" || !isWeekend(d);
}
function yearDays(inst: Instrument) {
  return inst.class === "crypto" ? 365 : 252;
}
function drift(inst: Instrument): number {
  return (u01(`mu:${inst.symbol}`) - 0.35) * 0.4;
}

// Facteur global d'amortissement de la volatilité (réalisme du mode démo)
const VOL_SCALE = 0.75;

function shock(inst: Instrument, key: string): number {
  const mkt = gauss(`m:${key}`);
  const sign = inst.group === "vol" ? -1 : 1;
  const mw = inst.class === "rate" || inst.class === "fx" || inst.group === "metals" ? 0.15 : 0.45;
  return VOL_SCALE * (sign * mw * mkt + 0.55 * gauss(`g:${inst.group}:${key}`) + 0.7 * gauss(`i:${inst.symbol}:${key}`));
}

function dailyReturn(inst: Instrument, d: number): number {
  if (!trades(inst, d)) return 0;
  const n = yearDays(inst);
  return drift(inst) / n + (inst.vol / Math.sqrt(n)) * shock(inst, `d${d}`);
}

export interface DailyBar {
  day: number;
  close: number;
}

const dailyCache = new Map<string, DailyBar[]>();

/** Clôtures quotidiennes (jours de cotation) strictement avant aujourd'hui, ~5,5 ans. */
export function dailySeries(inst: Instrument, now = Date.now()): DailyBar[] {
  const today = dayIndex(parisDate(now));
  const key = `${inst.symbol}:${today}`;
  const hit = dailyCache.get(key);
  if (hit) return hit;

  const start = today - 2000;
  const lo = Math.min(start, ANCHOR);
  const hi = Math.max(today - 1, ANCHOR);
  const logs: number[] = new Array(hi - lo + 1);
  let acc = 0;
  for (let d = lo; d <= hi; d++) {
    acc += d === lo ? 0 : dailyReturn(inst, d);
    logs[d - lo] = acc;
  }
  const offset = Math.log(inst.price) - logs[ANCHOR - lo];
  const out: DailyBar[] = [];
  for (let d = start; d <= today - 1; d++) {
    if (!trades(inst, d)) continue;
    out.push({ day: d, close: Math.exp(logs[d - lo] + offset) });
  }
  if (dailyCache.size > 2000) dailyCache.clear();
  dailyCache.set(key, out);
  return out;
}

/** Chemin intraday du jour (log-rendements cumulés par pas de 5 min jusqu'à `steps`). */
function intradayPath(inst: Instrument, today: number, steps: number): number[] {
  const n = yearDays(inst);
  const sigma = inst.vol / Math.sqrt(n) / Math.sqrt(STEPS);
  const mu = drift(inst) / n / STEPS;
  const path = [0];
  let acc = 0;
  for (let k = 1; k <= steps; k++) {
    acc += mu + sigma * shock(inst, `t${today}:${k}`);
    path.push(acc);
  }
  return path;
}

function midnightParisMs(now: number): number {
  const iso = parisDate(now);
  const utcMidnight = Date.parse(`${iso}T00:00:00Z`);
  return utcMidnight - parisOffsetSec(now) * 1000;
}

function currentStep(now: number) {
  const min = parisMinutes(now);
  return { step: Math.floor(min / 5), min };
}

export function mockQuote(inst: Instrument, now = Date.now()): Quote {
  const series = dailySeries(inst, now);
  const today = dayIndex(parisDate(now));
  const prevClose = series[series.length - 1].close;
  const { step, min } = currentStep(now);
  const path = intradayPath(inst, today, step);
  // petite variation à la minute pour que le cours « vive » entre deux pas de 5 min
  const jitter = (inst.vol / Math.sqrt(yearDays(inst)) / Math.sqrt(STEPS * 5)) * gauss(`j:${inst.symbol}:${today}:${min}`);
  const last = path[path.length - 1] + jitter;
  const price = prevClose * Math.exp(last);
  const open = prevClose * Math.exp(path[Math.min(1, path.length - 1)]);
  const high = prevClose * Math.exp(Math.max(...path, last));
  const low = prevClose * Math.exp(Math.min(...path, last));

  const closes = series.map((b) => b.close);
  const ago = (n: number) => closes[closes.length - n] ?? null;
  const isCrypto = inst.class === "crypto";
  const pct = (ref: number | null) => (ref ? (price / ref - 1) * 100 : null);

  const capCur = inst.capCurrency ?? inst.currency;
  const marketCap = inst.cap != null ? inst.cap * (price / inst.price) : null;
  let volume: number | null = null;
  if (inst.class === "stock" || inst.class === "crypto") {
    const shares = ((inst.cap ?? 10) * 1e9) / (inst.currency === "GBX" ? inst.price / 100 : inst.price);
    const turnover = inst.class === "crypto" ? 0.03 : 0.004 * (0.6 + inst.vol);
    volume = Math.round(shares * turnover * (0.15 + (0.85 * min) / 1440) * (0.7 + 0.6 * u01(`v:${inst.symbol}:${today}`)));
  }

  return {
    symbol: inst.symbol,
    name: inst.name,
    currency: inst.currency,
    class: inst.class,
    price,
    change: price - prevClose,
    changePct: (price / prevClose - 1) * 100,
    prevClose,
    open,
    high,
    low,
    volume,
    marketCap,
    capCurrency: capCur,
    pe: inst.pe != null ? inst.pe * (price / inst.price) : null,
    dividendYield: inst.div != null ? inst.div * (inst.price / price) : null,
    perf: {
      d: (price / prevClose - 1) * 100,
      w: pct(ago(isCrypto ? 7 : 5)),
      m: pct(ago(isCrypto ? 30 : 21)),
      y: pct(ago(isCrypto ? 365 : 252)),
    },
    spark: [...closes.slice(-(isCrypto ? 30 : 22)), price],
    updatedAt: now,
    source: "demo",
  };
}

/** Pont brownien entre deux prix (pour les vues 1 semaine). */
function bridge(inst: Instrument, a: number, b: number, n: number, seed: string): number[] {
  const out: number[] = [];
  const la = Math.log(a);
  const lb = Math.log(b);
  const sigma = inst.vol / Math.sqrt(yearDays(inst)) / Math.sqrt(n);
  let w = 0;
  const ws: number[] = [0];
  for (let k = 1; k <= n; k++) {
    w += sigma * gauss(`${seed}:${k}`);
    ws.push(w);
  }
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    out.push(Math.exp(la + (lb - la) * t + ws[k] - t * ws[n]));
  }
  return out;
}

export function mockHistory(inst: Instrument, range: Range, now = Date.now()): PricePoint[] {
  const series = dailySeries(inst, now);
  const q = mockQuote(inst, now);
  const price = q.price!;
  const today = dayIndex(parisDate(now));
  const midnight = midnightParisMs(now);
  const { step } = currentStep(now);
  const toSec = (ms: number) => Math.floor(ms / 1000);
  const dayClose = (d: number) => toSec(d * DAY + 16 * 3600_000); // ~17h30 Paris

  if (range === "1J") {
    const prevClose = series[series.length - 1].close;
    const path = intradayPath(inst, today, step);
    const pts = path.map((l, k) => ({ t: toSec(midnight + k * 300_000), v: prevClose * Math.exp(l) }));
    pts.push({ t: toSec(now), v: price });
    return dedupe(pts);
  }
  if (range === "1S") {
    const n = inst.class === "crypto" ? 7 : 5;
    const days = series.slice(-(n + 1));
    const pts: PricePoint[] = [];
    for (let i = 1; i < days.length; i++) {
      const seg = bridge(inst, days[i - 1].close, days[i].close, 12, `b:${inst.symbol}:${days[i].day}`);
      seg.forEach((v, k) => {
        if (k === 0 && i > 1) return;
        pts.push({ t: toSec(days[i].day * DAY + k * 2 * 3600_000), v });
      });
    }
    const prevClose = series[series.length - 1].close;
    const path = intradayPath(inst, today, step);
    for (let k = 12; k < path.length; k += 12) pts.push({ t: toSec(midnight + k * 300_000), v: prevClose * Math.exp(path[k]) });
    pts.push({ t: toSec(now), v: price });
    return dedupe(pts);
  }
  const take = range === "1M" ? 22 : range === "1A" ? 252 : 1260;
  const n = inst.class === "crypto" ? Math.round((take * 365) / 252) : take;
  let bars = series.slice(-n);
  if (range === "5A") bars = bars.filter((_, i) => (bars.length - 1 - i) % 5 === 0);
  const pts = bars.map((b) => ({ t: dayClose(b.day), v: b.close }));
  pts.push({ t: toSec(now), v: price });
  return dedupe(pts);
}

function dedupe(pts: PricePoint[]): PricePoint[] {
  const out: PricePoint[] = [];
  for (const p of pts) {
    if (out.length && p.t <= out[out.length - 1].t) continue;
    out.push(p);
  }
  return out;
}
