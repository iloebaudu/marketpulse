import "server-only";
import { getAllNews } from "./index";
import { customMatcher } from "./classify";
import { searchArticles } from "@/lib/search";
import { CATEGORIES } from "@/config/categories";
import type { Article } from "@/lib/types";

export interface NewsQuery {
  category?: string;
  symbols?: string[];
  keywords?: string[];
  q?: string;
  limit?: number;
  perCategory?: number;
}

export async function queryNews(p: NewsQuery) {
  const res = await getAllNews();
  let list: Article[] = res.articles;
  if (p.perCategory) {
    const byCat: Record<string, Article[]> = {};
    for (const c of CATEGORIES) byCat[c.slug] = list.filter((a) => a.categories.includes(c.slug)).slice(0, p.perCategory);
    return { ...res, articles: [], byCategory: byCat };
  }
  if (p.category) list = list.filter((a) => a.categories.includes(p.category!));
  if (p.symbols?.length || p.keywords?.length) {
    const m = customMatcher(p.symbols ?? [], p.keywords ?? []);
    list = list.filter(m);
  }
  if (p.q) list = searchArticles(list, p.q, 200);
  return { ...res, articles: list.slice(0, p.limit ?? 40) };
}
