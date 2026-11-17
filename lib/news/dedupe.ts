/**
 * Fusion des doublons : deux articles publiés à moins de 18 h d'intervalle dont les
 * titres partagent ≥ 60 % de mots significatifs (indice de Jaccard) sont fusionnés.
 * Les sociétés détectées doivent être les mêmes (sauf titres quasi identiques).
 * L'article le plus ancien est conservé ; les autres sources sont listées.
 */
import { normalize } from "@/lib/text";
import type { Article } from "@/lib/types";

const STOP = new Set(
  "le la les un une des du de d l et ou a au aux en dans sur pour par avec sans ce ces son sa ses qui que quoi est sont the of to in on for and with by at from as is are its it".split(" "),
);

function tokens(title: string): Set<string> {
  return new Set(normalize(title).trim().split(" ").filter((w) => w.length > 1 && !STOP.has(w)));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  a.forEach((w) => { if (b.has(w)) inter++; });
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Deux articles sur des sociétés différentes ne sont fusionnés que si leurs titres sont quasi identiques. */
function sameEntities(a: Article, b: Article): boolean {
  if (a.symbols.length !== b.symbols.length) return false;
  const sa = new Set(a.symbols);
  return b.symbols.every((s) => sa.has(s));
}

export function dedupeArticles(articles: Article[], threshold = 0.6): Article[] {
  const sorted = [...articles].sort((x, y) => x.publishedAt - y.publishedAt);
  const kept: { a: Article; t: Set<string> }[] = [];
  const byUrl = new Map<string, Article>();
  for (const art of sorted) {
    if (byUrl.has(art.url) && !art.demo) continue;
    const t = tokens(art.title);
    const twin = kept.find((k) => Math.abs(k.a.publishedAt - art.publishedAt) < 18 * 3600_000 && (() => {
      const j = jaccard(k.t, t);
      return j >= 0.85 || (j >= threshold && sameEntities(k.a, art));
    })());
    if (twin) {
      const m = twin.a;
      if (m.source !== art.source && !m.sources.some((s) => s.name === art.source)) m.sources.push({ name: art.source, url: art.url });
      m.categories = Array.from(new Set([...m.categories, ...art.categories]));
      m.symbols = Array.from(new Set([...m.symbols, ...art.symbols]));
      if (!m.summary && art.summary) m.summary = art.summary;
      continue;
    }
    const copy = { ...art, sources: [...art.sources] };
    kept.push({ a: copy, t });
    byUrl.set(art.url, copy);
  }
  return kept.map((k) => k.a).sort((x, y) => y.publishedAt - x.publishedAt);
}
