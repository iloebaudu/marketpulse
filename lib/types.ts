export type AssetClass = "stock" | "index" | "fx" | "commodity" | "crypto" | "rate";

export interface Instrument {
  /** Identifiant interne, utilisé dans les URL (/valeur/AAPL) */
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  class: AssetClass;
  /** Prix de référence utilisé par le mode démo */
  price: number;
  /** Capitalisation en milliards (dans capCurrency, sinon currency) */
  cap?: number;
  capCurrency?: string;
  pe?: number | null;
  /** Rendement du dividende en % */
  div?: number;
  /** Volatilité annuelle (mode démo) */
  vol: number;
  /** Facteur de corrélation sectorielle (mode démo) */
  group: string;
  /** Noms/marques permettant de rattacher un article à cette valeur */
  aliases?: string[];
  /** Unité affichée (ex. « $/once ») */
  unit?: string;
  /** Correspondance de symbole chez les fournisseurs de données */
  providers?: { finnhub?: string; twelvedata?: string };
  description?: string;
}

export interface CategoryDef {
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  /** Couleur d'accent (hex) */
  color: string;
  description: string;
  /** Valeurs suivies (symboles de config/instruments.ts) */
  symbols: string[];
  /** Mots-clés de classement des actualités (insensibles à la casse et aux accents) */
  keywords: string[];
  custom?: boolean;
}

export interface Perf {
  d: number | null;
  w: number | null;
  m: number | null;
  y: number | null;
}

export interface Quote {
  symbol: string;
  name: string;
  currency: string;
  class: AssetClass;
  price: number | null;
  change: number | null;
  changePct: number | null;
  prevClose: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  /** milliards, en capCurrency */
  marketCap: number | null;
  capCurrency: string;
  pe: number | null;
  dividendYield: number | null;
  perf: Perf;
  /** ~1 mois de clôtures pour la sparkline */
  spark: number[];
  updatedAt: number;
  source: "demo" | "finnhub" | "twelvedata" | "unavailable";
  stale?: boolean;
}

export interface SectorSummary {
  slug: string;
  perf: Perf;
  count: number;
}

export type Range = "1J" | "1S" | "1M" | "1A" | "5A";

export interface PricePoint {
  t: number; // timestamp en secondes (UTC)
  v: number;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  /** Autres sources ayant publié la même information (fusion des doublons) */
  sources: { name: string; url: string }[];
  publishedAt: number; // ms
  categories: string[];
  symbols: string[];
  demo?: boolean;
}

export type EventType = "earnings" | "salon" | "regulation" | "macro" | "dividend";

export interface MarketEvent {
  id: string;
  date: string; // YYYY-MM-DD (heure de Paris)
  time?: string; // HH:mm ou « Avant ouverture »
  type: EventType;
  title: string;
  symbol?: string;
  categories: string[];
  importance: 1 | 2 | 3;
  country?: string;
  demo?: boolean;
}

export interface ApiError {
  source: string;
  message: string;
}
