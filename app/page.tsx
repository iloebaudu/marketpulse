import Link from "next/link";
import { getSectorSummaries } from "@/lib/market";
import { queryNews } from "@/lib/news/query";
import { currentWeekRange, getEvents } from "@/lib/events";
import { fmtLongDay, parisDate } from "@/lib/format";
import { Heatmap } from "@/components/Heatmap";
import { HomeNews } from "@/components/HomeNews";
import { EventsList } from "@/components/EventsList";
import { ErrorNotice } from "@/components/ErrorNotice";
import { WatchlistMini } from "@/components/WatchlistMini";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const week = currentWeekRange();
  const [sectors, news, agenda] = await Promise.all([
    getSectorSummaries(),
    queryNews({ perCategory: 3 }).catch(() => ({ byCategory: {} as Record<string, Article[]>, errors: [{ source: "Actualités", message: "indisponible" }] })),
    getEvents({ ...week }),
  ]);
  const byCategory = ("byCategory" in news ? news.byCategory : undefined) ?? {};
  const weekAgenda = agenda.filter((e) => e.type === "macro" || e.importance >= 2);

  return (
    <div className="space-y-8">
      <section aria-labelledby="heatmap">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 id="heatmap" className="text-2xl font-bold">Les marchés par secteur</h1>
            <p className="text-sm text-muted"><span className="capitalize">{fmtLongDay(parisDate())}</span> · variation du jour, indices sectoriels pondérés</p>
          </div>
          <p className="text-[11px] text-muted">Cours rafraîchis toutes les 60 s</p>
        </div>
        <ErrorNotice errors={[...sectors.errors, ...news.errors]} className="mb-3" />
        <Heatmap initial={sectors.sectors} />
      </section>

      <WatchlistMini />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section aria-labelledby="dernieres">
          <h2 id="dernieres" className="mb-3 text-lg font-bold">Dernières actualités par secteur</h2>
          <HomeNews initial={{ byCategory }} />
        </section>
        <aside aria-labelledby="agenda-semaine" className="xl:sticky xl:top-20 xl:self-start">
          <div className="card p-4">
            <h2 id="agenda-semaine" className="mb-1 text-lg font-bold">Agenda économique de la semaine</h2>
            <p className="mb-3 text-xs text-muted">Heure de Paris · indicateurs macro et publications majeures</p>
            <EventsList events={weekAgenda} emptyText="Aucun événement cette semaine." />
            <Link href="/categorie/macro" className="mt-3 block text-sm text-brand">Macroéconomie & banques centrales →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
