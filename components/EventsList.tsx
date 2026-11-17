import Link from "next/link";
import { fmtLongDay, fmtShortDay } from "@/lib/format";
import type { EventType, MarketEvent } from "@/lib/types";

export const EVENT_META: Record<EventType, { icon: string; label: string }> = {
  earnings: { icon: "📊", label: "Résultats" },
  salon: { icon: "🎪", label: "Salon / conférence" },
  regulation: { icon: "⚖️", label: "Réglementaire" },
  macro: { icon: "🏛️", label: "Macro" },
  dividend: { icon: "💶", label: "Dividende" },
};

function Importance({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" title={`Importance ${n}/3`} aria-label={`Importance ${n} sur 3`}>
      {[1, 2, 3].map((i) => <span key={i} className={`h-1.5 w-1.5 rounded-full ${i <= n ? "bg-brand" : "bg-line"}`} />)}
    </span>
  );
}

export function EventsList({ events, grouped = true, emptyText = "Aucun événement à venir." }: { events: MarketEvent[]; grouped?: boolean; emptyText?: string }) {
  if (!events.length) return <p className="py-4 text-sm text-muted">{emptyText}</p>;
  const groups = new Map<string, MarketEvent[]>();
  events.forEach((e) => groups.set(e.date, [...(groups.get(e.date) ?? []), e]));
  return (
    <div className="space-y-3">
      {Array.from(groups.entries()).map(([date, list]) => (
        <div key={date}>
          {grouped && <p className="mb-1 text-xs font-semibold capitalize text-muted">{fmtLongDay(date)}</p>}
          <ul className="space-y-1">
            {list.map((e) => (
              <li key={e.id} className="flex items-start gap-2 rounded-md px-1 py-1 text-sm">
                <span aria-hidden title={EVENT_META[e.type].label}>{EVENT_META[e.type].icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="leading-snug">
                    {e.country && <span className="mr-1">{e.country}</span>}
                    {e.symbol ? <Link href={`/valeur/${encodeURIComponent(e.symbol)}`} className="hover:text-brand">{e.title}</Link> : e.title}
                  </p>
                  <p className="text-[11px] text-muted">
                    {!grouped && <span className="capitalize">{fmtShortDay(e.date)} · </span>}
                    {EVENT_META[e.type].label}{e.time ? ` · ${e.time}` : ""}{e.demo ? " · fictif" : ""}
                  </p>
                </div>
                <Importance n={e.importance} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
