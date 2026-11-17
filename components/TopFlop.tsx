import Link from "next/link";
import { fmtPrice } from "@/lib/format";
import { PctBadge } from "./Change";
import type { Quote } from "@/lib/types";

function Row({ q }: { q: Quote }) {
  return (
    <li>
      <Link href={`/valeur/${encodeURIComponent(q.symbol)}`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-surface2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{q.name}</span>
          <span className="num text-[11px] text-muted">{fmtPrice(q.price, q.currency, q.class)}</span>
        </span>
        <PctBadge v={q.changePct} className="text-xs" />
      </Link>
    </li>
  );
}

export function TopFlop({ quotes, n = 3 }: { quotes: Quote[]; n?: number }) {
  const valid = quotes.filter((q) => q.changePct != null).sort((a, b) => b.changePct! - a.changePct!);
  const top = valid.filter((q) => q.changePct! > 0).slice(0, n);
  const flop = valid.filter((q) => q.changePct! < 0).reverse().slice(0, n);
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <p className="mb-1 px-2 text-xs font-semibold text-up">▲ Top</p>
        <ul>{top.length ? top.map((q) => <Row key={q.symbol} q={q} />) : <li className="px-2 text-xs text-muted">Aucune hausse</li>}</ul>
      </div>
      <div>
        <p className="mb-1 px-2 text-xs font-semibold text-down">▼ Flop</p>
        <ul>{flop.length ? flop.map((q) => <Row key={q.symbol} q={q} />) : <li className="px-2 text-xs text-muted">Aucune baisse</li>}</ul>
      </div>
    </div>
  );
}
