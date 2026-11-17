/** Formatage français (nombres, devises, dates en heure de Paris). */
export const TZ = "Europe/Paris";

const CURRENCY_SUFFIX: Record<string, string> = {
  EUR: "€", USD: "$", GBP: "£", GBX: "p", CHF: "CHF", HKD: "HK$", DKK: "kr", JPY: "¥", CNY: "¥", "%": "%",
};

export function currencySymbol(c: string): string {
  return CURRENCY_SUFFIX[c] ?? c;
}

function nf(min: number, max: number) {
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: min, maximumFractionDigits: max });
}
const nf0 = nf(0, 0);
const nf1 = nf(1, 1);
const nf2 = nf(2, 2);
const nf4 = nf(4, 4);

export function fmtNumber(v: number | null | undefined, decimals = 2): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return (decimals === 0 ? nf0 : decimals === 1 ? nf1 : decimals === 4 ? nf4 : nf2).format(v);
}

export function priceDecimals(v: number, cls?: string): number {
  if (cls === "fx") return 4;
  if (Math.abs(v) < 1) return 4;
  return 2;
}

export function fmtPrice(v: number | null | undefined, currency?: string, cls?: string): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const s = fmtNumber(v, priceDecimals(v, cls));
  if (!currency || cls === "index" || cls === "fx") return s;
  return `${s} ${currencySymbol(currency)}`;
}

export function fmtPct(v: number | null | undefined, decimals = 2): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${fmtNumber(Math.abs(v), decimals)} %`;
}

export function fmtChange(v: number | null | undefined, cls?: string): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${fmtNumber(Math.abs(v), priceDecimals(Math.abs(v) || 1, cls))}`;
}

/** Capitalisation en milliards → « 3 950 Md$ » */
export function fmtCap(billions: number | null | undefined, currency: string): string {
  if (billions == null || !Number.isFinite(billions)) return "—";
  const d = billions >= 100 ? 0 : 1;
  return `${fmtNumber(billions, d)} Md${currencySymbol(currency === "GBX" ? "GBP" : currency)}`;
}

export function fmtVolume(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v >= 1e9) return `${fmtNumber(v / 1e9, 2)} Md`;
  if (v >= 1e6) return `${fmtNumber(v / 1e6, 2)} M`;
  if (v >= 1e3) return `${fmtNumber(v / 1e3, 1)} k`;
  return fmtNumber(v, 0);
}

const timeFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const dateFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
const shortDateFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, day: "2-digit", month: "2-digit" });
const longDayFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
const dayFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });

export const fmtTime = (ms: number) => timeFmt.format(ms);
export const fmtDate = (ms: number) => dateFmt.format(ms);
export const fmtDateTime = (ms: number) => `${dateFmt.format(ms)} ${timeFmt.format(ms)}`;
export const fmtShortDateTime = (ms: number) => `${shortDateFmt.format(ms)} ${timeFmt.format(ms)}`;

/** « YYYY-MM-DD » → « mardi 18 novembre » */
export function fmtLongDay(isoDate: string): string {
  return longDayFmt.format(new Date(`${isoDate}T12:00:00Z`));
}
export function fmtShortDay(isoDate: string): string {
  return dayFmt.format(new Date(`${isoDate}T12:00:00Z`));
}

/** Date du jour à Paris au format YYYY-MM-DD */
export function parisDate(ms: number = Date.now()): string {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(ms);
  return p; // en-CA → YYYY-MM-DD
}

/** Minutes écoulées depuis minuit, heure de Paris */
export function parisMinutes(ms: number = Date.now()): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(ms);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

/** Décalage Paris/UTC en secondes à un instant donné */
export function parisOffsetSec(ms: number): number {
  const d = new Date(ms);
  const local = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
  const utc = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
  return Math.round((local.getTime() - utc.getTime()) / 1000);
}

export function timeAgo(ms: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - ms);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "hier" : `il y a ${d} j`;
}

export function trendClass(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v) || v === 0) return "text-muted";
  return v > 0 ? "text-up" : "text-down";
}
