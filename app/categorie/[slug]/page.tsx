import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory } from "@/config/categories";
import { getQuotes } from "@/lib/market";
import { queryNews } from "@/lib/news/query";
import { getEvents } from "@/lib/events";
import { CategoryView } from "@/components/CategoryView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const def = getCategory((await params).slug);
  return { title: def ? `${def.icon} ${def.name}` : "Secteur introuvable", description: def?.description };
}

export default async function CategoryPage({ params }: Props) {
  const def = getCategory((await params).slug);
  if (!def) notFound();
  const [q, news, events] = await Promise.all([
    getQuotes(def.symbols),
    queryNews({ category: def.slug, limit: 40 }).catch(() => ({ articles: [], errors: [{ source: "Actualités", message: "indisponible" }] })),
    getEvents({ category: def.slug, limit: 12 }),
  ]);
  return (
    <CategoryView
      def={def}
      initial={{ quotes: q.quotes, articles: news.articles, events, errors: [...q.errors, ...news.errors], updatedAt: q.updatedAt }}
    />
  );
}
