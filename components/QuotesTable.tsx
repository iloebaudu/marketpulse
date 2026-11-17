"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { fmtCap, fmtPrice } from "@/lib/format";
import { FX_TO_EUR as FX_SAFE } from "@/config/instruments";
import { Pct } from "./Change";
import { Sparkline } from "./Sparkline";
import { WatchButton } from "./WatchButton";
import type { Quote } from "@/lib/types";

type Col = "name" | "symbol" | "price" | "changePct" | "marketCap";

const COLS: { key: Col; label: string; className: string; numeric?: boolean }[] = [
  { key: "name", label: "Nom", className: "text-left" },
  { key: "symbol", label: "Ticker", className: "text-left hidden sm:table-cell" },
  { key: "price", label: "Cours", className: "text-right", numeric: true },
  { key: "changePct", label: "Var. jour", className: "text-right", numeric: true },
  { key: "marketCap", label: "Capitalisation", className: "text-right hidden md:table-cell", numeric: true },
];

export function QuotesTable({ quotes, emptyText = "Aucune valeur." }: { quotes: Quote[]; emptyText?: string }) {
  const [sort, setSort] = useState<{ key: Col; dir: 1 | -1 }>({ key: "marketCap", dir: -1 });

  const rows = useMemo(() => {
    const val = (q: Quote): number | string | null => {
      if (sort.key === "marketCap") return q.marketCap != null ? q.marketCap * (FX_SAFE[q.capCurrency] ?? 1) : null;
      return q[sort.key];
    };
    return [...quotes].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "string" || typeof vb === "string") return String(va).localeCompare(String(vb), "fr") * sort.dir;
      return (va - vb) * sort.dir;
    });
  }, [quotes, sort]);

  if (!quotes.length) return <p className="p-4 text-sm text-muted">{emptyText}</p>;

  const header = (c: (typeof COLS)[number]) => {
    const active = sort.key === c.key;
    const ariaSort = active ? (sort.dir === 1 ? "ascending" : "descending") : "none";
    return (
      <th key={c.key} scope="col" aria-sort={ariaSort} className={`px-3 py-2 font-medium ${c.className}`}>
        <button
          onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key ? (s.dir === 1 ? -1 : 1) : c.numeric ? -1 : 1 }))}
          className={`inline-flex items-center gap-1 hover:text-fg ${active ? "text-fg" : ""}`}
        >
          {c.label}
          <span className="text-[10px]" aria-hidden>{active ? (sort.dir === 1 ? "▲" : "▼") : "↕"}</span>
        </button>
      </th>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            <th className="w-8" aria-label="Watchlist" />
            {COLS.map(header)}
            <th scope="col" className="hidden px-3 py-2 text-right font-medium sm:table-cell">1 mois</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((q) => (
            <tr key={q.symbol} className="border-b border-line/60 last:border-0 hover:bg-surface2/60">
              <td className="pl-2"><WatchButton symbol={q.symbol} /></td>
              <td className="max-w-[180px] px-3 py-2">
                <Link href={`/valeur/${encodeURIComponent(q.symbol)}`} className="block truncate font-medium hover:text-brand">{q.name}</Link>
                <span className="num text-[11px] text-muted sm:hidden">{q.symbol}</span>
              </td>
              <td className="hidden px-3 py-2 sm:table-cell">
                <Link href={`/valeur/${encodeURIComponent(q.symbol)}`} className="num text-xs text-muted hover:text-brand">{q.symbol}</Link>
              </td>
              <td className="num whitespace-nowrap px-3 py-2 text-right">
                {fmtPrice(q.price, q.currency, q.class)}
                {q.stale && <span title="Dernière valeur connue (source indisponible)" className="ml-1 text-amber-500">•</span>}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right"><Pct v={q.changePct} /></td>
              <td className="num hidden whitespace-nowrap px-3 py-2 text-right text-muted md:table-cell">{fmtCap(q.marketCap, q.capCurrency)}</td>
              <td className="hidden px-3 py-1 text-right sm:table-cell"><Sparkline data={q.spark} className="ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
