"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetcher, REFRESH_NEWS, REFRESH_QUOTES } from "@/lib/fetcher";
import { sectorPerf } from "@/lib/sector";
import { SectorHeader } from "./SectorHeader";
import { QuotesTable } from "./QuotesTable";
import { NewsList } from "./NewsList";
import { TopFlop } from "./TopFlop";
import { EventsList } from "./EventsList";
import { ErrorNotice } from "./ErrorNotice";
import type { ApiError, Article, CategoryDef, MarketEvent, Quote } from "@/lib/types";

export interface CategoryInitial {
  quotes: Quote[];
  articles: Article[];
  events: MarketEvent[];
  errors: ApiError[];
  updatedAt: number;
}

export function CategoryView({ def, initial, actions }: { def: CategoryDef; initial?: CategoryInitial; actions?: React.ReactNode }) {
  const syms = def.symbols.join(",");
  const q = useSWR<{ quotes: Quote[]; errors: ApiError[]; updatedAt: number }>(
    def.symbols.length ? `/api/quotes?symbols=${encodeURIComponent(syms)}` : null,
    fetcher,
    { refreshInterval: REFRESH_QUOTES, fallbackData: initial && { quotes: initial.quotes, errors: initial.errors, updatedAt: initial.updatedAt } },
  );
  const newsUrl = def.custom
    ? `/api/news?symbols=${encodeURIComponent(syms)}&keywords=${encodeURIComponent(def.keywords.join(","))}&limit=40`
    : `/api/news?category=${def.slug}&limit=40`;
  const n = useSWR<{ articles: Article[]; errors: ApiError[] }>(newsUrl, fetcher, {
    refreshInterval: REFRESH_NEWS,
    fallbackData: initial && { articles: initial.articles, errors: [] },
  });
  const eventsUrl = def.custom ? (def.symbols.length ? `/api/events?symbols=${encodeURIComponent(syms)}&limit=12` : null) : `/api/events?category=${def.slug}&limit=12`;
  const ev = useSWR<{ events: MarketEvent[] }>(eventsUrl, fetcher, { refreshInterval: 30 * 60_000, fallbackData: initial && { events: initial.events } });

  const [shown, setShown] = useState(12);
  const quotes = q.data?.quotes ?? [];
  const perf = sectorPerf(quotes);
  const errors = [...(q.data?.errors ?? []), ...(n.data?.errors ?? [])];
  const loading = !q.data && def.symbols.length > 0;

  return (
    <div className="space-y-4">
      <SectorHeader def={def} perf={perf} count={def.symbols.length} updatedAt={q.data?.updatedAt} actions={actions} />
      <ErrorNotice errors={q.error ? [{ source: "Cotations", message: "Impossible de joindre le serveur" }, ...errors] : errors} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="card" aria-labelledby="valeurs">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 id="valeurs" className="card-title">Valeurs du secteur</h2>
              <span className="text-[11px] text-muted">Rafraîchi toutes les 60 s · cliquez un en-tête pour trier</span>
            </div>
            {loading ? <p className="p-4 text-sm text-muted">Chargement des cours…</p> : <QuotesTable quotes={quotes} emptyText="Ajoutez des valeurs à cette catégorie." />}
          </section>

          <section className="card px-4" aria-labelledby="actus">
            <div className="flex items-center justify-between border-b border-line py-3">
              <h2 id="actus" className="card-title">Fil d&apos;actualités</h2>
              <span className="text-[11px] text-muted">Filtré par mots-clés et tickers · MAJ toutes les 5 min</span>
            </div>
            {!n.data ? <p className="py-4 text-sm text-muted">Chargement des actualités…</p> : (
              <>
                <NewsList articles={n.data.articles.slice(0, shown)} hideCategory={def.slug} />
                {n.data.articles.length > shown && (
                  <button onClick={() => setShown((v) => v + 12)} className="my-3 w-full rounded-lg border border-line py-2 text-sm text-brand hover:bg-surface2">
                    Afficher plus d&apos;actualités ({n.data.articles.length - shown})
                  </button>
                )}
              </>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-3" aria-labelledby="topflop">
            <h2 id="topflop" className="card-title mb-2 px-1">Top / Flop du jour</h2>
            <TopFlop quotes={quotes} />
          </section>
          <section className="card p-4" aria-labelledby="agenda">
            <h2 id="agenda" className="card-title mb-3">Prochains événements</h2>
            <EventsList events={ev.data?.events ?? []} />
          </section>
        </aside>
      </div>
    </div>
  );
}
