"use client";
import Link from "next/link";
import useSWR from "swr";
import { fetcher, REFRESH_QUOTES } from "@/lib/fetcher";
import { fmtPrice } from "@/lib/format";
import { Pct } from "./Change";
import type { Quote } from "@/lib/types";

export function TickerTape({ symbols, initial }: { symbols: string[]; initial: Quote[] }) {
  const { data } = useSWR<{ quotes: Quote[] }>(`/api/quotes?symbols=${symbols.join(",")}`, fetcher, {
    refreshInterval: REFRESH_QUOTES,
    fallbackData: { quotes: initial },
  });
  const quotes = data?.quotes ?? initial;
  const row = quotes.map((q) => (
    <Link key={q.symbol} href={`/valeur/${encodeURIComponent(q.symbol)}`} className="flex shrink-0 items-baseline gap-2 px-4 hover:opacity-80">
      <span className="text-xs font-semibold">{q.name}</span>
      <span className="num text-xs">{fmtPrice(q.price, q.currency, q.class)}</span>
      <Pct v={q.changePct} className="text-xs" />
    </Link>
  ));
  return (
    <div className="tape relative overflow-hidden border-b border-line bg-surface" aria-label="Grands indices et marchés">
      <div className="flex w-max animate-marquee py-1.5">
        <div className="flex">{row}</div>
        <div className="flex" aria-hidden>{row}</div>
      </div>
    </div>
  );
}
