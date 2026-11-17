"use client";
import Link from "next/link";
import useSWR from "swr";
import { fetcher, REFRESH_NEWS, REFRESH_QUOTES } from "@/lib/fetcher";
import { fmtCap, fmtChange, fmtNumber, fmtPct, fmtPrice, fmtVolume, trendClass } from "@/lib/format";
import { PriceChart } from "./PriceChart";
import { WatchButton } from "./WatchButton";
import { NewsList } from "./NewsList";
import { EventsList } from "./EventsList";
import { ErrorNotice } from "./ErrorNotice";
import { TimeAgo } from "./TimeAgo";
import type { ApiError, Article, CategoryDef, Instrument, MarketEvent, Quote } from "@/lib/types";

interface Props {
  inst: Instrument;
  categories: Pick<CategoryDef, "slug" | "name" | "icon" | "color">[];
  initialQuote: Quote;
  initialNews: Article[];
  events: MarketEvent[];
  errors: ApiError[];
}

export function StockDetail({ inst, categories, initialQuote, initialNews, events, errors }: Props) {
  const { data } = useSWR<{ quotes: Quote[]; errors: ApiError[] }>(`/api/quotes?symbols=${encodeURIComponent(inst.symbol)}`, fetcher, {
    refreshInterval: REFRESH_QUOTES,
    fallbackData: { quotes: [initialQuote], errors },
  });
  const keywords = [inst.name, ...(inst.aliases ?? [])].join(",");
  const news = useSWR<{ articles: Article[] }>(`/api/news?symbols=${encodeURIComponent(inst.symbol)}&keywords=${encodeURIComponent(keywords)}&limit=20`, fetcher, {
    refreshInterval: REFRESH_NEWS,
    fallbackData: { articles: initialNews },
  });
  const q = data?.quotes[0] ?? initialQuote;
  const isStock = inst.class === "stock";

  const facts: [string, string][] = [
    ["Capitalisation", fmtCap(q.marketCap, q.capCurrency)],
    ["PER", q.pe != null && q.pe > 0 ? fmtNumber(q.pe, 1) : "—"],
    ["Rendement dividende", q.dividendYield != null ? fmtPct(q.dividendYield).replace("+", "") : "—"],
    ["Volume", fmtVolume(q.volume)],
    ["Ouverture", fmtPrice(q.open, q.currency, q.class)],
    ["Clôture veille", fmtPrice(q.prevClose, q.currency, q.class)],
    ["Plus haut (jour)", fmtPrice(q.high, q.currency, q.class)],
    ["Plus bas (jour)", fmtPrice(q.low, q.currency, q.class)],
  ];
  const shown = isStock ? facts : facts.filter(([k]) => !["PER", "Rendement dividende", ...(inst.class === "crypto" ? [] : ["Capitalisation"])].includes(k));

  return (
    <div className="space-y-4">
      <nav className="text-xs text-muted" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-fg">Accueil</Link>
        {categories[0] && <> / <Link href={`/categorie/${categories[0].slug}`} className="hover:text-fg">{categories[0].name}</Link></>}
        {" "}/ <span className="text-fg">{inst.name}</span>
      </nav>

      <section className="card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{inst.name}</h1>
            <p className="num text-sm text-muted">{inst.symbol} · {inst.exchange}{inst.unit ? ` · ${inst.unit}` : ""} · {inst.currency === "GBX" ? "pence (GBX)" : inst.currency}</p>
            {inst.description && <p className="mt-1 text-sm text-muted">{inst.description}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <Link key={c.slug} href={`/categorie/${c.slug}`} className="chip" style={{ borderColor: `${c.color}88` }}>{c.icon} {c.name}</Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <p className="num text-3xl font-bold">{fmtPrice(q.price, q.currency, q.class)}</p>
            <p className={`num text-sm font-semibold ${trendClass(q.changePct)}`}>
              {fmtChange(q.change, q.class)} ({fmtPct(q.changePct)}) <span className="font-normal text-muted">aujourd&apos;hui</span>
            </p>
            <p className="text-[11px] text-muted">
              {q.source === "demo" ? "Données fictives (démo)" : q.source === "unavailable" ? "Cotation indisponible" : `Source : ${q.source === "finnhub" ? "Finnhub" : "Twelve Data"} · peut être différé`}
              {" · "}<TimeAgo ms={q.updatedAt} />
            </p>
            <WatchButton symbol={inst.symbol} withLabel />
          </div>
        </div>
      </section>

      <ErrorNotice errors={data?.errors} />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-4 lg:col-span-2" aria-label="Graphique">
          <PriceChart symbol={inst.symbol} cls={inst.class} />
        </section>
        <section className="card p-4" aria-labelledby="donnees">
          <h2 id="donnees" className="card-title mb-3">Données clés</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {shown.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] text-muted">{k}</dt>
                <dd className="num text-sm font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 grid grid-cols-4 gap-1 border-t border-line pt-3 text-center">
            {([["Jour", q.perf.d], ["Sem.", q.perf.w], ["Mois", q.perf.m], ["An", q.perf.y]] as const).map(([k, v]) => (
              <div key={k}>
                <p className="text-[10px] uppercase text-muted">{k}</p>
                <p className={`num text-xs font-semibold ${trendClass(v)}`}>{fmtPct(v, 1)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card px-4 lg:col-span-2" aria-labelledby="news-valeur">
          <h2 id="news-valeur" className="card-title border-b border-line py-3">Actualités liées</h2>
          <NewsList articles={news.data?.articles ?? []} emptyText="Aucune actualité récente sur cette valeur." />
        </section>
        <section className="card p-4" aria-labelledby="ev-valeur">
          <h2 id="ev-valeur" className="card-title mb-3">Événements à venir</h2>
          <EventsList events={events} emptyText="Aucun événement programmé." />
        </section>
      </div>
    </div>
  );
}
