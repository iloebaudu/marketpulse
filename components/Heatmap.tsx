"use client";
import Link from "next/link";
import useSWR from "swr";
import { CATEGORIES } from "@/config/categories";
import { fetcher, REFRESH_QUOTES } from "@/lib/fetcher";
import { fmtPct } from "@/lib/format";
import { usePinned } from "@/lib/store";
import type { SectorSummary } from "@/lib/types";

function tileBg(v: number | null): string {
  if (v == null) return "rgb(var(--surface2))";
  const a = Math.min(Math.abs(v) / 2.5, 1) * 0.5 + 0.08;
  return v >= 0 ? `rgb(var(--up) / ${a.toFixed(2)})` : `rgb(var(--down) / ${a.toFixed(2)})`;
}

export function Heatmap({ initial }: { initial: SectorSummary[] }) {
  const { data } = useSWR<{ sectors: SectorSummary[] }>("/api/sectors", fetcher, { refreshInterval: REFRESH_QUOTES, fallbackData: { sectors: initial } });
  const { pinned } = usePinned();
  const map = new Map((data?.sectors ?? initial).map((s) => [s.slug, s]));
  const cats = [...CATEGORIES].sort((a, b) => Number(pinned.includes(b.slug)) - Number(pinned.includes(a.slug)));
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {cats.map((c) => {
        const s = map.get(c.slug);
        const d = s?.perf.d ?? null;
        return (
          <Link
            key={c.slug}
            href={`/categorie/${c.slug}`}
            style={{ background: tileBg(d), ["--accent" as string]: c.color }}
            className="group relative flex min-h-[92px] flex-col justify-between overflow-hidden rounded-xl border border-line p-3 transition hover:-translate-y-0.5 hover:shadow-lg"
            aria-label={`${c.name} : ${fmtPct(d)} aujourd'hui`}
          >
            <span className="absolute inset-y-0 left-0 w-1 bg-[var(--accent)]" aria-hidden />
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <span aria-hidden>{c.icon}</span>
              <span className="truncate">{c.shortName}</span>
              {pinned.includes(c.slug) && <span className="ml-auto text-xs" aria-label="épinglé">📌</span>}
            </span>
            <span className="num text-xl font-bold">{fmtPct(d)}</span>
            <span className="num text-[11px] opacity-75">Sem. {fmtPct(s?.perf.w ?? null, 1)} · An {fmtPct(s?.perf.y ?? null, 1)}</span>
          </Link>
        );
      })}
    </div>
  );
}
