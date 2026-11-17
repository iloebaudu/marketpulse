"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Res = {
  instruments: { symbol: string; name: string; exchange: string; class: string }[];
  categories: { slug: string; name: string; icon: string; color: string }[];
};

export function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Res | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 1) { setRes(null); return; }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal }).then((r) => r.json()).then(setRes).catch(() => {});
    }, 150);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const items = [
    ...(res?.categories ?? []).map((c) => ({ href: `/categorie/${c.slug}`, label: `${c.icon} ${c.name}`, sub: "Secteur" })),
    ...(res?.instruments ?? []).map((i) => ({ href: `/valeur/${encodeURIComponent(i.symbol)}`, label: i.name, sub: `${i.symbol} · ${i.exchange}` })),
  ];

  const go = (href: string) => { setOpen(false); setQ(""); router.push(href); };

  return (
    <div ref={box} className="relative w-full max-w-md">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && items[active]) return go(items[active].href);
          if (q.trim()) go(`/recherche?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden>⌕</span>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Rechercher une valeur, un ticker, un mot-clé…"
          aria-label="Recherche globale"
          className="h-9 w-full rounded-lg border border-line bg-surface2 pl-8 pr-3 text-sm outline-none placeholder:text-muted focus:border-brand focus:bg-surface"
        />
      </form>
      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          {items.length === 0 && <p className="px-3 py-2 text-sm text-muted">Aucune valeur ni secteur — Entrée pour chercher dans les actualités.</p>}
          {items.map((it, i) => (
            <Link key={it.href} href={it.href} onClick={() => { setOpen(false); setQ(""); }} className={`flex items-center justify-between gap-3 px-3 py-2 text-sm ${i === active ? "bg-surface2" : "hover:bg-surface2"}`}>
              <span className="truncate">{it.label}</span>
              <span className="num shrink-0 text-xs text-muted">{it.sub}</span>
            </Link>
          ))}
          <Link href={`/recherche?q=${encodeURIComponent(q.trim())}`} onClick={() => setOpen(false)} className="block border-t border-line px-3 py-2 text-xs text-brand hover:bg-surface2">
            Tous les résultats et actualités pour « {q.trim()} » →
          </Link>
        </div>
      )}
    </div>
  );
}
