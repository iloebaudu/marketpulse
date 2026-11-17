"use client";
import Link from "next/link";
import useSWR from "swr";
import { CATEGORIES } from "@/config/categories";
import { fetcher, REFRESH_NEWS } from "@/lib/fetcher";
import { NewsItem } from "./NewsList";
import type { Article } from "@/lib/types";

type Data = { byCategory: Record<string, Article[]> };

export function HomeNews({ initial }: { initial: Data }) {
  const { data } = useSWR<Data>("/api/news?perCategory=3", fetcher, { refreshInterval: REFRESH_NEWS, fallbackData: initial });
  const by = data?.byCategory ?? initial.byCategory;
  return (
    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {CATEGORIES.map((c) => (
        <section key={c.slug} className="card overflow-hidden" style={{ ["--accent" as string]: c.color }}>
          <Link href={`/categorie/${c.slug}`} className="flex items-center gap-2 border-b border-line px-4 py-2.5 hover:bg-surface2">
            <span className="h-4 w-1 rounded bg-[var(--accent)]" aria-hidden />
            <span aria-hidden>{c.icon}</span>
            <h3 className="text-sm font-semibold">{c.name}</h3>
            <span className="ml-auto text-xs text-brand">Voir →</span>
          </Link>
          <div className="divide-y divide-line px-4">
            {(by[c.slug] ?? []).length ? by[c.slug].map((a) => <NewsItem key={a.id} a={a} compact />) : <p className="py-3 text-sm text-muted">Aucune actualité récente.</p>}
          </div>
        </section>
      ))}
    </div>
  );
}
