"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { CATEGORIES } from "@/config/categories";
import { fetcher, REFRESH_QUOTES } from "@/lib/fetcher";
import { usePinned, useCustomCategories } from "@/lib/store";
import { Pct } from "./Change";
import type { CategoryDef, SectorSummary } from "@/lib/types";

function useSectors() {
  const { data } = useSWR<{ sectors: SectorSummary[] }>("/api/sectors", fetcher, { refreshInterval: REFRESH_QUOTES });
  return new Map((data?.sectors ?? []).map((s) => [s.slug, s]));
}

function order(pinned: string[]) {
  const pins = pinned.map((s) => CATEGORIES.find((c) => c.slug === s)).filter((c): c is CategoryDef => !!c);
  return { pins, rest: CATEGORIES.filter((c) => !pinned.includes(c.slug)) };
}

const hrefOf = (c: CategoryDef) => (c.custom ? `/categorie/perso/${c.slug}` : `/categorie/${c.slug}`);

export function Sidebar() {
  const path = usePathname();
  const { pinned } = usePinned();
  const { custom } = useCustomCategories();
  const sectors = useSectors();
  const { pins, rest } = order(pinned);

  const Item = ({ c }: { c: CategoryDef }) => {
    const href = hrefOf(c);
    const active = path === href;
    return (
      <Link
        href={href}
        style={{ ["--accent" as string]: c.color }}
        className={`group flex items-center gap-2 rounded-lg border-l-[3px] px-2 py-1.5 text-sm transition ${active ? "border-[color:var(--accent)] bg-surface2 font-semibold" : "border-transparent text-fg/85 hover:bg-surface2"}`}
      >
        <span className="w-5 text-center" aria-hidden>{c.icon}</span>
        <span className="flex-1 truncate">{c.shortName}</span>
        {sectors.get(c.slug) && <Pct v={sectors.get(c.slug)!.perf.d} className="text-[11px]" />}
      </Link>
    );
  };

  return (
    <nav aria-label="Secteurs" className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 overflow-y-auto border-r border-line px-3 py-4 lg:block">
      <Link href="/" className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${path === "/" ? "bg-surface2 font-semibold" : "hover:bg-surface2"}`}>
        <span className="w-5 text-center">🏠</span> Accueil
      </Link>
      <Link href="/watchlist" className={`mb-3 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${path === "/watchlist" ? "bg-surface2 font-semibold" : "hover:bg-surface2"}`}>
        <span className="w-5 text-center">★</span> Ma watchlist
      </Link>
      {pins.length > 0 && (
        <>
          <p className="card-title mb-1 px-2">📌 Favoris</p>
          <div className="mb-3 space-y-0.5">{pins.map((c) => <Item key={c.slug} c={c} />)}</div>
        </>
      )}
      <p className="card-title mb-1 px-2">Secteurs</p>
      <div className="space-y-0.5">{rest.map((c) => <Item key={c.slug} c={c} />)}</div>
      <p className="card-title mb-1 mt-4 px-2">Mes catégories</p>
      <div className="space-y-0.5">{custom.map((c) => <Item key={c.slug} c={c} />)}</div>
      <Link href="/mes-categories" className="mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-brand hover:bg-surface2">
        <span className="w-5 text-center">＋</span> Créer une catégorie
      </Link>
    </nav>
  );
}

/** Menu des catégories en défilement horizontal (mobile/tablette) */
export function MobileNav() {
  const path = usePathname();
  const { pinned } = usePinned();
  const { custom } = useCustomCategories();
  const { pins, rest } = order(pinned);
  const all = [...pins, ...custom, ...rest];
  const pill = (href: string, label: string, icon: string, color?: string) => {
    const active = path === href;
    return (
      <Link key={href} href={href} style={color ? { ["--accent" as string]: color } : undefined}
        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${active ? "border-[color:var(--accent,rgb(var(--brand)))] bg-surface2 font-semibold" : "border-line bg-surface"}`}>
        <span aria-hidden>{icon}</span>{label}
      </Link>
    );
  };
  return (
    <nav aria-label="Secteurs" className="no-scrollbar flex gap-2 overflow-x-auto border-b border-line bg-bg px-4 py-2 lg:hidden">
      {pill("/", "Accueil", "🏠")}
      {pill("/watchlist", "Watchlist", "★")}
      {all.map((c) => pill(hrefOf(c), c.shortName, `${pinned.includes(c.slug) ? "📌" : ""}${c.icon}`, c.color))}
      {pill("/mes-categories", "Créer", "＋")}
    </nav>
  );
}
