import Link from "next/link";
import type { Metadata } from "next";
import { searchCategories, searchInstruments } from "@/lib/search";
import { getQuotes } from "@/lib/market";
import { queryNews } from "@/lib/news/query";
import { QuotesTable } from "@/components/QuotesTable";
import { NewsList } from "@/components/NewsList";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recherche" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const insts = q ? searchInstruments(q, 20) : [];
  const cats = q ? searchCategories(q) : [];
  const [quotes, news] = await Promise.all([
    insts.length ? getQuotes(insts.map((i) => i.symbol)) : Promise.resolve({ quotes: [] }),
    q ? queryNews({ q, limit: 30 }).catch(() => ({ articles: [] })) : Promise.resolve({ articles: [] }),
  ]);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{q ? <>Résultats pour « {q} »</> : "Recherche"}</h1>
      {!q && <p className="text-muted">Saisissez un nom d&apos;entreprise, un ticker (ex. NVDA, MC.PA) ou un mot-clé (ex. qubit, inflation).</p>}
      {cats.length > 0 && (
        <section className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <Link key={c.slug} href={`/categorie/${c.slug}`} className="card flex items-center gap-2 px-3 py-2 text-sm font-semibold hover:bg-surface2" style={{ borderColor: c.color }}>
              {c.icon} {c.name}
            </Link>
          ))}
        </section>
      )}
      {q && (
        <section className="card">
          <h2 className="card-title border-b border-line px-4 py-3">Valeurs ({insts.length})</h2>
          <QuotesTable quotes={quotes.quotes} emptyText="Aucune valeur ne correspond." />
        </section>
      )}
      {q && (
        <section className="card px-4">
          <h2 className="card-title border-b border-line py-3">Actualités ({news.articles.length})</h2>
          <NewsList articles={news.articles} emptyText="Aucune actualité récente ne correspond." />
        </section>
      )}
    </div>
  );
}
