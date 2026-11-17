import Link from "next/link";
import { getCategory } from "@/config/categories";
import { TimeAgo } from "./TimeAgo";
import type { Article } from "@/lib/types";

export function NewsItem({ a, hideCategory, compact = false }: { a: Article; hideCategory?: string; compact?: boolean }) {
  const cats = a.categories.filter((c) => c !== hideCategory).map((c) => getCategory(c)).filter(Boolean);
  return (
    <article className={`group ${compact ? "py-2" : "py-3"}`}>
      <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
        <span className="font-semibold text-fg/80">{a.source}</span>
        {a.sources.length > 0 && (
          <span className="chip" title={`Également publié par : ${a.sources.map((s) => s.name).join(", ")}`}>
            +{a.sources.length} source{a.sources.length > 1 ? "s" : ""}
          </span>
        )}
        <TimeAgo ms={a.publishedAt} />
        {a.demo && <span className="text-amber-600 dark:text-amber-400">· article fictif</span>}
      </div>
      <h3 className={`${compact ? "text-sm" : "text-[15px]"} font-semibold leading-snug`}>
        <a href={a.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
          {a.title}
          <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
        </a>
      </h3>
      {!compact && a.summary && <p className="mt-1 line-clamp-2 text-sm text-muted">{a.summary}</p>}
      {!compact && (a.symbols.length > 0 || cats.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {a.symbols.slice(0, 5).map((s) => (
            <Link key={s} href={`/valeur/${encodeURIComponent(s)}`} className="chip num">{s}</Link>
          ))}
          {cats.slice(0, 4).map((c) => (
            <Link key={c!.slug} href={`/categorie/${c!.slug}`} className="chip" style={{ borderColor: `${c!.color}66` }}>
              {c!.icon} {c!.shortName}
            </Link>
          ))}
        </div>
      )}
      {!compact && a.sources.length > 0 && (
        <p className="mt-1 text-[11px] text-muted">
          Autres sources :{" "}
          {a.sources.map((s, i) => (
            <span key={s.url + i}>{i > 0 && ", "}<a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand">{s.name}</a></span>
          ))}
        </p>
      )}
    </article>
  );
}

export function NewsList({ articles, hideCategory, emptyText = "Aucune actualité récente pour ce secteur." }: { articles: Article[]; hideCategory?: string; emptyText?: string }) {
  if (!articles.length) return <p className="py-6 text-center text-sm text-muted">{emptyText}</p>;
  return <div className="divide-y divide-line">{articles.map((a) => <NewsItem key={a.id} a={a} hideCategory={hideCategory} />)}</div>;
}
