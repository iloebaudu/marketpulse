import { fmtChange, fmtPct, trendClass } from "@/lib/format";

export function Pct({ v, className = "", decimals = 2 }: { v: number | null | undefined; className?: string; decimals?: number }) {
  return <span className={`num ${trendClass(v)} ${className}`}>{fmtPct(v, decimals)}</span>;
}

export function Delta({ v, cls, className = "" }: { v: number | null | undefined; cls?: string; className?: string }) {
  return <span className={`num ${trendClass(v)} ${className}`}>{fmtChange(v, cls)}</span>;
}

/** Pastille colorée (fond vert/rouge léger) */
export function PctBadge({ v, className = "" }: { v: number | null | undefined; className?: string }) {
  const bg = v == null ? "bg-surface2" : v > 0 ? "bg-up/10" : v < 0 ? "bg-down/10" : "bg-surface2";
  return <span className={`num inline-block rounded-md px-1.5 py-0.5 text-right ${bg} ${trendClass(v)} ${className}`}>{fmtPct(v)}</span>;
}
