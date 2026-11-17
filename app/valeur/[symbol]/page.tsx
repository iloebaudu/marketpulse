import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getInstrument } from "@/config/instruments";
import { categoriesForSymbol } from "@/config/categories";
import { getQuotes } from "@/lib/market";
import { queryNews } from "@/lib/news/query";
import { getEvents } from "@/lib/events";
import { StockDetail } from "@/components/StockDetail";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ symbol: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const inst = getInstrument(decodeURIComponent((await params).symbol));
  return { title: inst ? `${inst.name} (${inst.symbol})` : "Valeur introuvable" };
}

export default async function ValuePage({ params }: Props) {
  const symbol = decodeURIComponent((await params).symbol);
  const inst = getInstrument(symbol);
  if (!inst) notFound();
  const [q, news, events] = await Promise.all([
    getQuotes([symbol]),
    queryNews({ symbols: [symbol], keywords: [inst.name, ...(inst.aliases ?? [])], limit: 20 }).catch(() => ({ articles: [] })),
    getEvents({ symbols: [symbol], limit: 6 }),
  ]);
  const categories = categoriesForSymbol(symbol).map(({ slug, name, icon, color }) => ({ slug, name, icon, color }));
  return <StockDetail inst={inst} categories={categories} initialQuote={q.quotes[0]} initialNews={news.articles} events={events} errors={q.errors} />;
}
