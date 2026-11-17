"use client";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { INSTRUMENTS } from "@/config/instruments";
import { useCustomCategories } from "@/lib/store";
import { normalize } from "@/lib/text";
import type { CategoryDef } from "@/lib/types";

const ICONS = ["⭐", "🚀", "🎯", "💡", "🔋", "🧬", "🛰️", "🎮", "🏗️", "🌍", "🍷", "📡", "🧠", "💼", "🔐", "🏠"];
const COLORS = ["#3b82f6", "#a855f7", "#06b6d4", "#22c55e", "#f97316", "#ec4899", "#eab308", "#14b8a6", "#ef4444", "#64748b"];

function Editor() {
  const router = useRouter();
  const params = useSearchParams();
  const { custom, save, remove } = useCustomCategories();
  const editing = custom.find((c) => c.slug === params.get("edit"));

  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [keywords, setKeywords] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!editing) return;
    setName(editing.name);
    setIcon(editing.icon);
    setColor(editing.color);
    setSymbols(editing.symbols);
    setKeywords(editing.keywords.join(", "));
  }, [editing]);

  const list = useMemo(() => {
    const f = normalize(filter).trim();
    return INSTRUMENTS.filter((i) => !f || normalize(`${i.name} ${i.symbol} ${(i.aliases ?? []).join(" ")}`).includes(f));
  }, [filter]);

  const toggle = (s: string) => setSymbols((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const def: CategoryDef = {
      slug: editing?.slug ?? `perso-${Date.now().toString(36)}`,
      name: name.trim(),
      shortName: name.trim().slice(0, 22),
      icon,
      color,
      description: `Catégorie personnalisée · ${symbols.length} valeur${symbols.length > 1 ? "s" : ""}`,
      symbols,
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      custom: true,
    };
    save(def);
    router.push(`/categorie/perso/${def.slug}`);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <form onSubmit={submit} className="card space-y-4 p-4 lg:col-span-2">
        <h2 className="text-lg font-bold">{editing ? `Modifier « ${editing.name} »` : "Nouvelle catégorie"}</h2>
        <label className="block">
          <span className="text-sm font-medium">Nom</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Mes valeurs de rendement" className="mt-1 h-10 w-full rounded-lg border border-line bg-surface2 px-3 text-sm outline-none focus:border-brand" />
        </label>
        <fieldset>
          <legend className="text-sm font-medium">Icône</legend>
          <div className="mt-1 flex flex-wrap gap-1">
            {ICONS.map((i) => (
              <button type="button" key={i} onClick={() => setIcon(i)} aria-pressed={icon === i} className={`grid h-9 w-9 place-items-center rounded-lg border text-lg ${icon === i ? "border-brand bg-brand/10" : "border-line"}`}>{i}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium">Couleur d&apos;accent</legend>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {COLORS.map((c) => (
              <button type="button" key={c} onClick={() => setColor(c)} aria-label={c} aria-pressed={color === c} className={`h-7 w-7 rounded-full border-2 ${color === c ? "border-fg" : "border-transparent"}`} style={{ background: c }} />
            ))}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Couleur personnalisée" className="h-7 w-10 cursor-pointer rounded border border-line bg-transparent" />
          </div>
        </fieldset>
        <label className="block">
          <span className="text-sm font-medium">Mots-clés pour filtrer les actualités</span>
          <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Ex. dividende, rachat d'actions, hydrogène" className="mt-1 h-10 w-full rounded-lg border border-line bg-surface2 px-3 text-sm outline-none focus:border-brand" />
          <span className="text-xs text-muted">Séparés par des virgules. Les articles mentionnant vos valeurs sont inclus automatiquement.</span>
        </label>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Valeurs ({symbols.length} sélectionnée{symbols.length > 1 ? "s" : ""})</span>
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrer…" className="h-8 w-40 rounded-lg border border-line bg-surface2 px-2 text-xs outline-none focus:border-brand" />
          </div>
          <div className="mt-2 grid max-h-72 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-line p-2 sm:grid-cols-2">
            {list.map((i) => (
              <label key={i.symbol} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-surface2">
                <input type="checkbox" checked={symbols.includes(i.symbol)} onChange={() => toggle(i.symbol)} className="accent-[rgb(var(--brand))]" />
                <span className="truncate">{i.name}</span>
                <span className="num ml-auto text-[11px] text-muted">{i.symbol}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90">{editing ? "Enregistrer" : "Créer la catégorie"}</button>
          {editing && (
            <button type="button" onClick={() => { remove(editing.slug); router.push("/mes-categories"); }} className="rounded-lg border border-down/50 px-4 py-2 text-sm text-down hover:bg-down/10">Supprimer</button>
          )}
        </div>
      </form>

      <aside className="card p-4">
        <h2 className="card-title mb-2">Mes catégories</h2>
        {custom.length === 0 ? (
          <p className="text-sm text-muted">Aucune pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-1">
            {custom.map((c) => (
              <li key={c.slug} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface2">
                <span className="h-4 w-1 rounded" style={{ background: c.color }} />
                <Link href={`/categorie/perso/${c.slug}`} className="flex-1 truncate text-sm">{c.icon} {c.name}</Link>
                <Link href={`/mes-categories?edit=${c.slug}`} className="text-xs text-brand">Modifier</Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted">Vos catégories sont stockées localement dans ce navigateur.</p>
      </aside>
    </div>
  );
}

export default function MyCategoriesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mes catégories</h1>
      <Suspense fallback={<p className="text-muted">Chargement…</p>}>
        <Editor />
      </Suspense>
    </div>
  );
}
