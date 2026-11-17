import { fmtPct, trendClass } from "@/lib/format";
import { PinButton } from "./PinButton";
import { TimeAgo } from "./TimeAgo";
import type { CategoryDef, Perf } from "@/lib/types";

const LABELS: [keyof Perf, string][] = [["d", "Jour"], ["w", "Semaine"], ["m", "Mois"], ["y", "Année"]];

export function SectorHeader({ def, perf, count, updatedAt, actions }: { def: CategoryDef; perf: Perf; count: number; updatedAt?: number; actions?: React.ReactNode }) {
  return (
    <section className="card overflow-hidden" style={{ ["--accent" as string]: def.color }}>
      <div className="h-1 bg-[var(--accent)]" />
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: `${def.color}22` }} aria-hidden>{def.icon}</span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold md:text-2xl">{def.name}</h1>
              <p className="text-sm text-muted">{def.description}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{count} valeur{count > 1 ? "s" : ""} suivie{count > 1 ? "s" : ""} · indice pondéré par la capitalisation</span>
            {updatedAt && <span>· MAJ <TimeAgo ms={updatedAt} /></span>}
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-3 md:items-end">
          <div className="grid grid-cols-4 gap-2">
            {LABELS.map(([k, label]) => (
              <div key={k} className="min-w-[76px] rounded-lg border border-line bg-surface2 px-2.5 py-2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
                <p className={`num text-sm font-semibold md:text-base ${trendClass(perf[k])}`}>{fmtPct(perf[k])}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 md:justify-end">{actions ?? (!def.custom && <PinButton slug={def.slug} />)}</div>
        </div>
      </div>
    </section>
  );
}
