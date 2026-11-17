/**
 * Agenda : publications de résultats, salons, échéances réglementaires, macroéconomie.
 * - Événements manuels (config/events.ts) : toujours affichés.
 * - Mode live : calendrier des résultats Finnhub pour les valeurs suivies.
 * - Mode démo : agenda fictif généré autour de la semaine en cours.
 */
import "server-only";
import { MANUAL_EVENTS } from "@/config/events";
import { CATEGORIES, categoriesForSymbol } from "@/config/categories";
import { INSTRUMENTS } from "@/config/instruments";
import { env, getDataMode } from "@/lib/env";
import { u01 } from "@/lib/random";
import { parisDate } from "@/lib/format";
import { fhEarningsCalendar, finnhubSymbol } from "@/lib/market/finnhub";
import type { MarketEvent } from "@/lib/types";

const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const addDays = (isoDate: string, n: number) => iso(Date.parse(`${isoDate}T12:00:00Z`) + n * DAY);

export function weekStart(isoDate = parisDate()): string {
  const wd = new Date(`${isoDate}T12:00:00Z`).getUTCDay(); // 0 = dimanche
  return addDays(isoDate, wd === 0 ? -6 : 1 - wd);
}

function skipWeekend(isoDate: string): string {
  const wd = new Date(`${isoDate}T12:00:00Z`).getUTCDay();
  return wd === 6 ? addDays(isoDate, 2) : wd === 0 ? addDays(isoDate, 1) : isoDate;
}

const MACRO_WEEK: [number, string, string, string, 1 | 2 | 3][] = [
  [0, "14:30", "🇺🇸", "Indice manufacturier Empire State", 1],
  [1, "11:00", "🇩🇪", "Indice ZEW du sentiment économique", 2],
  [1, "16:00", "🇺🇸", "Ventes de logements existants", 1],
  [2, "11:00", "🇪🇺", "Inflation zone euro (estimation finale)", 3],
  [2, "20:00", "🇺🇸", "Compte rendu de la dernière réunion du FOMC", 3],
  [3, "10:00", "🇪🇺", "PMI flash manufacturier et services", 2],
  [3, "14:30", "🇺🇸", "Inscriptions hebdomadaires au chômage", 2],
  [4, "08:45", "🇫🇷", "Confiance des ménages (Insee)", 1],
  [4, "10:00", "🇩🇪", "Climat des affaires Ifo", 2],
  [4, "16:00", "🇺🇸", "Confiance des consommateurs (Univ. du Michigan)", 2],
];
const MACRO_NEXT: [number, string, string, string, 1 | 2 | 3][] = [
  [1, "14:30", "🇺🇸", "PIB américain (2e estimation)", 3],
  [3, "08:45", "🇫🇷", "Inflation France (Insee, provisoire)", 3],
  [3, "14:30", "🇺🇸", "Indice des prix PCE", 3],
  [4, "11:00", "🇪🇺", "Taux de chômage zone euro", 2],
];

const SECTOR_EVENTS: Record<string, [number, "salon" | "regulation", string][]> = {
  tech: [[9, "salon", "Conférence développeurs d'un grand éditeur de logiciels"], [23, "regulation", "Échéance d'application du Digital Markets Act (UE)"]],
  quantique: [[6, "salon", "Sommet européen de l'informatique quantique"], [19, "regulation", "Publication de normes de cryptographie post-quantique"]],
  ia: [[4, "salon", "Conférence annuelle sur l'IA générative"], [16, "regulation", "Étape de mise en œuvre de l'AI Act européen"]],
  luxe: [[8, "salon", "Salon international de la haute horlogerie"], [20, "salon", "Semaine de la haute joaillerie"]],
  banques: [[12, "regulation", "Résultats des tests de résistance bancaires"], [26, "salon", "Forum européen de la banque d'investissement"]],
  energie: [[3, "regulation", "Réunion ministérielle de l'OPEP+"], [17, "salon", "Conférence internationale sur le GNL"]],
  renouvelables: [[10, "salon", "Salon européen de l'éolien en mer"], [22, "regulation", "Résultats d'enchères pour l'éolien en mer"]],
  sante: [[5, "regulation", "Avis attendu d'un comité consultatif de la FDA"], [18, "salon", "Congrès international d'oncologie"]],
  auto: [[11, "salon", "Salon automobile international"], [24, "regulation", "Publication des immatriculations européennes (ACEA)"]],
  "aero-defense": [[7, "salon", "Salon international de l'aéronautique et du spatial"], [21, "regulation", "Vote du budget de défense"]],
  conso: [[2, "salon", "Black Friday et Cyber Monday : bilan des ventes"], [15, "salon", "Salon international de l'agroalimentaire"]],
  crypto: [[4, "regulation", "Échéance réglementaire MiCA"], [13, "salon", "Conférence internationale bitcoin"]],
  "matieres-premieres": [[1, "regulation", "Rapport mensuel de l'Agence internationale de l'énergie"], [14, "salon", "Semaine des métaux de Londres"]],
  macro: [],
};

function demoEvents(): MarketEvent[] {
  const ws = weekStart();
  const out: MarketEvent[] = [];
  MACRO_WEEK.forEach(([d, time, country, title, importance], i) =>
    out.push({ id: `dm-${ws}-${i}`, date: addDays(ws, d), time, type: "macro", title, categories: ["macro"], importance, country, demo: true }),
  );
  MACRO_NEXT.forEach(([d, time, country, title, importance], i) =>
    out.push({ id: `dn-${ws}-${i}`, date: addDays(ws, 7 + d), time, type: "macro", title, categories: ["macro"], importance, country, demo: true }),
  );
  for (const inst of INSTRUMENTS) {
    if (inst.class !== "stock") continue;
    const offset = inst.symbol === "NVDA" ? 2 : Math.floor(u01(`earn:${inst.symbol}:${ws.slice(0, 7)}`) * 45);
    const date = skipWeekend(addDays(ws, offset));
    const before = u01(`earnt:${inst.symbol}`) < 0.5;
    const cats = categoriesForSymbol(inst.symbol).map((c) => c.slug);
    out.push({
      id: `de-${inst.symbol}-${date}`,
      date,
      time: inst.symbol === "NVDA" ? "Après clôture" : before ? "Avant ouverture" : "Après clôture",
      type: "earnings",
      title: `Résultats trimestriels — ${inst.name}`,
      symbol: inst.symbol,
      categories: cats,
      importance: (inst.cap ?? 0) > 500 ? 3 : (inst.cap ?? 0) > 50 ? 2 : 1,
      demo: true,
    });
  }
  for (const [slug, list] of Object.entries(SECTOR_EVENTS)) {
    list.forEach(([d, type, title], i) =>
      out.push({ id: `ds-${slug}-${i}`, date: skipWeekend(addDays(ws, d)), type, title, categories: [slug], importance: 2, demo: true }),
    );
  }
  return out;
}

async function liveEvents(fromIso: string, toIso: string): Promise<MarketEvent[]> {
  if (!env.finnhubKey) return [];
  const map = new Map(INSTRUMENTS.filter((i) => i.class === "stock").map((i) => [finnhubSymbol(i), i]));
  try {
    const cal = await fhEarningsCalendar(fromIso, toIso);
    return cal
      .filter((e) => map.has(e.symbol))
      .map((e) => {
        const inst = map.get(e.symbol)!;
        return {
          id: `fe-${e.symbol}-${e.date}`,
          date: e.date,
          time: e.hour === "bmo" ? "Avant ouverture" : e.hour === "amc" ? "Après clôture" : undefined,
          type: "earnings" as const,
          title: `Résultats T${e.quarter} ${e.year} — ${inst.name}`,
          symbol: inst.symbol,
          categories: categoriesForSymbol(inst.symbol).map((c) => c.slug),
          importance: (inst.cap ?? 0) > 500 ? 3 : 2,
        };
      });
  } catch {
    return [];
  }
}

export interface EventQuery {
  from?: string;
  to?: string;
  category?: string;
  symbols?: string[];
  limit?: number;
}

export async function getEvents(q: EventQuery = {}): Promise<MarketEvent[]> {
  const from = q.from ?? parisDate();
  const to = q.to ?? addDays(from, 45);
  const base = getDataMode() === "demo" ? demoEvents() : await liveEvents(from, to);
  let list = [...MANUAL_EVENTS, ...base].filter((e) => e.date >= from && e.date <= to);
  if (q.category) {
    const cat = CATEGORIES.find((c) => c.slug === q.category);
    list = list.filter((e) => e.categories.includes(q.category!) || (e.symbol && cat?.symbols.includes(e.symbol)));
  }
  if (q.symbols) {
    const set = new Set(q.symbols);
    list = list.filter((e) => e.symbol && set.has(e.symbol));
  }
  list.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "") || b.importance - a.importance);
  return q.limit ? list.slice(0, q.limit) : list;
}

export function currentWeekRange(): { from: string; to: string } {
  const ws = weekStart();
  return { from: ws, to: addDays(ws, 6) };
}
