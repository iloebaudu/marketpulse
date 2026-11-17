/**
 * Événements saisis manuellement (affichés en mode démo ET en mode live).
 * Calendriers officiels 2026 — à vérifier/mettre à jour sur :
 *   - BCE : https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.fr.html
 *   - Fed : https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
 *
 * `categories` : slugs de config/categories.ts où l'événement doit apparaître.
 */
import type { MarketEvent } from "@/lib/types";

export const MANUAL_EVENTS: MarketEvent[] = [
  // BCE — décisions de politique monétaire 2026 (14h15, heure de Paris)
  ...["2026-02-05", "2026-03-19", "2026-04-30", "2026-06-11", "2026-07-23", "2026-09-10", "2026-10-29", "2026-12-17"].map(
    (date): MarketEvent => ({
      id: `bce-${date}`,
      date,
      time: "14:15",
      type: "macro",
      title: "BCE : décision de politique monétaire",
      categories: ["macro", "banques"],
      importance: 3,
      country: "🇪🇺",
    }),
  ),
  // Fed — décisions FOMC 2026 (20h00, heure de Paris en général)
  ...["2026-01-28", "2026-03-18", "2026-04-29", "2026-06-17", "2026-07-29", "2026-09-16", "2026-10-28", "2026-12-09"].map(
    (date): MarketEvent => ({
      id: `fomc-${date}`,
      date,
      time: "20:00",
      type: "macro",
      title: "Fed : décision du FOMC sur les taux",
      categories: ["macro", "banques"],
      importance: 3,
      country: "🇺🇸",
    }),
  ),
];
