/**
 * Agrégation des actualités : RSS + Finnhub + NewsAPI (mode live) ou articles fictifs
 * (mode démo), puis classement par catégorie et fusion des doublons.
 * Rafraîchi toutes les 5 minutes (cache serveur).
 */
import "server-only";
import { XMLParser } from "fast-xml-parser";
import { env, getDataMode } from "@/lib/env";
import { cached, fetchJson } from "@/lib/cache";
import { RSS_FEEDS, type FeedDef } from "@/config/feeds";
import { stripHtml, truncate } from "@/lib/text";
import { hashString } from "@/lib/random";
import type { ApiError, Article } from "@/lib/types";
import { classify } from "./classify";
import { dedupeArticles } from "./dedupe";
import { mockArticles } from "./mock";
import { fhMarketNews } from "@/lib/market/finnhub";

export const NEWS_TTL = 5 * 60_000;

export interface NewsResult {
  articles: Article[];
  errors: ApiError[];
  mode: "demo" | "live";
  updatedAt: number;
}

type Raw = Omit<Article, "categories" | "symbols" | "sources"> & { related?: string[] };

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "#text" });

function text(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object" && "#text" in (v as Record<string, unknown>)) return String((v as Record<string, unknown>)["#text"]);
  return "";
}

async function fetchRss(feed: FeedDef): Promise<Raw[]> {
  const res = await fetch(feed.url, { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "MarketPulse/1.0 (+RSS reader)" }, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = parser.parse(await res.text());
  const items: Record<string, unknown>[] = [].concat(xml?.rss?.channel?.item ?? xml?.feed?.entry ?? xml?.["rdf:RDF"]?.item ?? []);
  return items.slice(0, 60).map((it) => {
    const link = typeof it.link === "object" && it.link && "@_href" in (it.link as object) ? String((it.link as Record<string, unknown>)["@_href"]) : text(it.link);
    const title = stripHtml(text(it.title));
    const date = text(it.pubDate) || text(it.updated) || text(it.published) || text(it["dc:date"]);
    const ts = Date.parse(date);
    return {
      id: `rss-${hashString(link || title)}`,
      title,
      summary: truncate(stripHtml(text(it.description) || text(it.summary) || text(it["content:encoded"])), 240),
      url: link,
      source: feed.name,
      publishedAt: Number.isFinite(ts) ? ts : Date.now(),
    };
  }).filter((a) => a.title && a.url);
}

async function fetchFinnhub(): Promise<Raw[]> {
  const lists = await Promise.all((["general", "crypto", "merger"] as const).map((c) => fhMarketNews(c).catch(() => [])));
  return lists.flat().map((n) => ({
    id: `fh-${n.id}`,
    title: n.headline,
    summary: truncate(n.summary ?? "", 240),
    url: n.url,
    source: n.source || "Finnhub",
    publishedAt: n.datetime * 1000,
    related: n.related ? n.related.split(",").map((s) => s.trim()).filter(Boolean) : [],
  }));
}

async function fetchNewsApi(): Promise<Raw[]> {
  const qs = new URLSearchParams({ q: "bourse OR marchés OR actions OR CAC", language: "fr", sortBy: "publishedAt", pageSize: "100", apiKey: env.newsApiKey });
  const r = await fetchJson<{ articles: { title: string; description: string; url: string; source: { name: string }; publishedAt: string }[] }>(`https://newsapi.org/v2/everything?${qs}`);
  return (r.articles ?? []).map((a) => ({
    id: `na-${hashString(a.url)}`,
    title: a.title,
    summary: truncate(a.description ?? "", 240),
    url: a.url,
    source: a.source?.name ?? "NewsAPI",
    publishedAt: Date.parse(a.publishedAt),
  }));
}

function finalize(raw: Raw[]): Article[] {
  const cutoff = Date.now() - 4 * 86400_000;
  const arts: Article[] = raw
    .filter((r) => r.publishedAt > cutoff && r.publishedAt <= Date.now() + 5 * 60_000)
    .map((r) => {
      const { symbols, categories } = classify(r.title, r.summary, r.related);
      const { related: _r, ...rest } = r;
      void _r;
      return { ...rest, sources: [], symbols, categories };
    });
  return dedupeArticles(arts);
}

async function loadLive(): Promise<{ articles: Article[]; errors: ApiError[] }> {
  const errors: ApiError[] = [];
  const jobs: Promise<Raw[]>[] = [];
  const wrap = (name: string, p: Promise<Raw[]>) =>
    p.catch((e: Error) => {
      errors.push({ source: name, message: e.message });
      return [] as Raw[];
    });
  if (env.rssEnabled) RSS_FEEDS.forEach((f) => jobs.push(wrap(f.name, cached(`rss:${f.url}`, NEWS_TTL, () => fetchRss(f)).then((r) => r.value))));
  if (env.finnhubKey) jobs.push(wrap("Finnhub News", cached("fh:news", NEWS_TTL, fetchFinnhub).then((r) => r.value)));
  if (env.newsApiKey) jobs.push(wrap("NewsAPI", cached("newsapi", NEWS_TTL, fetchNewsApi).then((r) => r.value)));
  const raw = (await Promise.all(jobs)).flat();
  return { articles: finalize(raw), errors };
}

export async function getAllNews(): Promise<NewsResult> {
  const mode = getDataMode();
  const bucket = Math.floor(Date.now() / NEWS_TTL);
  if (mode === "demo") {
    const { value } = await cached(`news:demo:${bucket}`, NEWS_TTL, async () => finalize(mockArticles()));
    return { articles: value, errors: [], mode, updatedAt: bucket * NEWS_TTL };
  }
  const { value, stale } = await cached("news:live", NEWS_TTL, loadLive);
  const errors = stale ? [...value.errors, { source: "Actualités", message: "Données en cache (sources momentanément indisponibles)" }] : value.errors;
  return { articles: value.articles, errors, mode, updatedAt: Date.now() };
}
