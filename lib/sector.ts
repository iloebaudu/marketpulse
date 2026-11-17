import { FX_TO_EUR } from "@/config/instruments";
import type { Perf, Quote } from "@/lib/types";

/**
 * Performance d'un secteur = moyenne des performances des valeurs suivies,
 * pondérée par la capitalisation (convertie en EUR). Si une valeur n'a pas
 * de capitalisation (indices, matières premières, taux), moyenne équipondérée.
 */
export function sectorPerf(quotes: Quote[]): Perf {
  const out: Perf = { d: null, w: null, m: null, y: null };
  const useCap = quotes.length > 0 && quotes.every((q) => q.marketCap != null);
  for (const k of ["d", "w", "m", "y"] as const) {
    let s = 0;
    let sw = 0;
    for (const q of quotes) {
      const v = q.perf[k];
      if (v == null || !Number.isFinite(v)) continue;
      const w = useCap ? q.marketCap! * (FX_TO_EUR[q.capCurrency] ?? 1) : 1;
      s += v * w;
      sw += w;
    }
    out[k] = sw > 0 ? s / sw : null;
  }
  return out;
}
