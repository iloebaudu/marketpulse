"use client";
import Link from "next/link";
import useSWR from "swr";
import { fetcher, REFRESH_QUOTES } from "@/lib/fetcher";
import { useWatchlist } from "@/lib/store";
import { fmtPrice } from "@/lib/format";
import { Pct } from "./Change";
import { Sparkline } from "./Sparkline";
import type { Quote } from "@/lib/types";

export function WatchlistMini() {
  const { watchlist } = useWatchlist();
  const { data } = useSWR<{ quotes: Quote[] }>(watchlist.length ? `/api/quotes?symbols=${encodeURIComponent(watchlist.join(","))}` : null, fetcher, { refreshInterval: REFRESH_QUOTES });
  if (!watchlist.length) return null;
  return (
    <section aria-labelledby="wl">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="wl" className="text-lg font-bold">★ Ma watchlist</h2>
        <Link href="/watchlist" className="text-sm text-brand">Tout voir →</Link>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {(data?.quotes ?? []).map((q) => (
          <Link key={q.symbol} href={`/valeur/${encodeURIComponent(q.symbol)}`} className="card min-w-[170px] p-3 hover:bg-surface2">
            <p className="truncate text-sm font-semibold">{q.name}</p>
            <p className="num text-xs text-muted">{q.symbol}</p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <div>
                <p className="num text-sm">{fmtPrice(q.price, q.currency, q.class)}</p>
                <Pct v={q.changePct} className="text-xs" />
              </div>
              <Sparkline data={q.spark} width={64} height={24} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
