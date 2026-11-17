"use client";
import Link from "next/link";
import useSWR from "swr";
import { fetcher, REFRESH_NEWS, REFRESH_QUOTES } from "@/lib/fetcher";
import { useWatchlist } from "@/lib/store";
import { QuotesTable } from "@/components/QuotesTable";
import { TopFlop } from "@/components/TopFlop";
import { NewsList } from "@/components/NewsList";
import type { Article, Quote } from "@/lib/types";

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  const syms = encodeURIComponent(watchlist.join(","));
  const { data } = useSWR<{ quotes: Quote[] }>(watchlist.length ? `/api/quotes?symbols=${syms}` : null, fetcher, { refreshInterval: REFRESH_QUOTES });
  const news = useSWR<{ articles: Article[] }>(watchlist.length ? `/api/news?symbols=${syms}&limit=30` : null, fetcher, { refreshInterval: REFRESH_NEWS });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">★ Ma watchlist</h1>
        <p className="text-sm text-muted">Sauvegardée localement dans ce navigateur. Ajoutez des valeurs avec l&apos;étoile ☆ dans les tableaux ou sur les fiches.</p>
      </div>
      {!watchlist.length ? (
        <div className="card p-8 text-center text-muted">
          Votre watchlist est vide. <Link href="/categorie/tech" className="text-brand underline">Parcourir le secteur Tech</Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <section className="card"><QuotesTable quotes={data?.quotes ?? []} /></section>
            <section className="card px-4">
              <h2 className="card-title border-b border-line py-3">Actualités de mes valeurs</h2>
              <NewsList articles={news.data?.articles ?? []} emptyText="Aucune actualité récente." />
            </section>
          </div>
          <aside><section className="card p-3"><h2 className="card-title mb-2 px-1">Top / Flop</h2><TopFlop quotes={data?.quotes ?? []} /></section></aside>
        </div>
      )}
    </div>
  );
}
