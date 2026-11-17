"use client";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { fmtNumber, fmtPct, parisOffsetSec, priceDecimals, trendClass } from "@/lib/format";
import type { PricePoint, Range } from "@/lib/types";

const RANGES: Range[] = ["1J", "1S", "1M", "1A", "5A"];
const REFRESH: Record<Range, number> = { "1J": 60_000, "1S": 300_000, "1M": 0, "1A": 0, "5A": 0 };

export function PriceChart({ symbol, cls }: { symbol: string; cls?: string }) {
  const [range, setRange] = useState<Range>("1J");
  const { data, error, isLoading } = useSWR<{ points: PricePoint[]; error?: string }>(`/api/history?symbol=${encodeURIComponent(symbol)}&range=${range}`, fetcher, {
    refreshInterval: REFRESH[range],
    keepPreviousData: true,
  });
  const box = useRef<HTMLDivElement>(null);
  const points = data?.points ?? [];
  const first = points[0]?.v;
  const last = points[points.length - 1]?.v;
  const varPct = first && last ? (last / first - 1) * 100 : null;

  useEffect(() => {
    if (!box.current || points.length < 2) return;
    let disposed = false;
    let cleanup = () => {};
    import("lightweight-charts").then(({ createChart, ColorType, CrosshairMode }) => {
      if (disposed || !box.current) return;
      const css = getComputedStyle(document.documentElement);
      const rgb = (v: string) => `rgb(${css.getPropertyValue(v).trim().replace(/ /g, ",")})`;
      const rgba = (v: string, a: number) => `rgba(${css.getPropertyValue(v).trim().replace(/ /g, ",")},${a})`;
      const up = (last ?? 0) >= (first ?? 0);
      const line = up ? rgb("--up") : rgb("--down");
      const intraday = range === "1J" || range === "1S";
      const chart = createChart(box.current, {
        autoSize: true,
        layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: rgb("--muted"), fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11 },
        grid: { vertLines: { visible: false }, horzLines: { color: rgba("--line", 0.6) } },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false, timeVisible: intraday, secondsVisible: false, fixLeftEdge: true, fixRightEdge: true },
        crosshair: { mode: CrosshairMode.Magnet },
        localization: {
          locale: "fr-FR",
          priceFormatter: (p: number) => fmtNumber(p, priceDecimals(p, cls)),
        },
        handleScroll: false,
        handleScale: false,
      });
      const series = chart.addAreaSeries({ lineColor: line, topColor: up ? rgba("--up", 0.25) : rgba("--down", 0.25), bottomColor: "rgba(0,0,0,0)", lineWidth: 2, priceLineVisible: false });
      // lightweight-charts affiche en UTC : on décale vers l'heure de Paris
      const off = parisOffsetSec(Date.now());
      series.setData(points.map((p) => ({ time: (p.t + (intraday ? off : 0)) as never, value: p.v })));
      chart.timeScale().fitContent();
      cleanup = () => chart.remove();
    });
    return () => { disposed = true; cleanup(); };
  }, [points, range, first, last, cls]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="Période" className="inline-flex rounded-lg border border-line bg-surface2 p-0.5">
          {RANGES.map((r) => (
            <button key={r} role="tab" aria-selected={r === range} onClick={() => setRange(r)} className={`num rounded-md px-3 py-1 text-xs font-semibold ${r === range ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"}`}>
              {r}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">
          Variation sur la période : <span className={`num font-semibold ${trendClass(varPct)}`}>{fmtPct(varPct)}</span>
        </span>
      </div>
      <div className="relative h-[300px] md:h-[360px]">
        {(error || data?.error) && <p className="absolute inset-0 grid place-items-center text-sm text-muted">{data?.error ?? "Historique indisponible pour le moment."}</p>}
        {isLoading && !points.length && <p className="absolute inset-0 grid place-items-center text-sm text-muted">Chargement…</p>}
        <div ref={box} className="h-full w-full" />
      </div>
    </div>
  );
}
