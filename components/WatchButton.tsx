"use client";
import { useWatchlist } from "@/lib/store";

export function WatchButton({ symbol, withLabel = false }: { symbol: string; withLabel?: boolean }) {
  const { has, toggle } = useWatchlist();
  const on = has(symbol);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(symbol); }}
      className={`inline-flex items-center gap-1.5 rounded-md text-sm transition ${withLabel ? "border border-line bg-surface px-3 py-1.5 hover:bg-surface2" : "px-1"} ${on ? "text-amber-500" : "text-muted hover:text-amber-500"}`}
      aria-pressed={on}
      aria-label={on ? `Retirer ${symbol} de la watchlist` : `Ajouter ${symbol} à la watchlist`}
      title={on ? "Retirer de la watchlist" : "Ajouter à la watchlist"}
    >
      <span aria-hidden>{on ? "★" : "☆"}</span>
      {withLabel && <span className="text-fg">{on ? "Dans ma watchlist" : "Ajouter à ma watchlist"}</span>}
    </button>
  );
}
