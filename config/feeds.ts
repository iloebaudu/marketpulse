/**
 * Flux RSS interrogés en mode live (toutes les 5 minutes, avec cache).
 * Les URL de flux changent parfois : si une source renvoie une erreur,
 * elle est simplement ignorée et signalée dans l'interface — les autres continuent.
 * Vérifiez/actualisez les URL sur le site de chaque éditeur.
 */
export interface FeedDef {
  name: string;
  url: string;
  lang: "fr" | "en";
}

export const RSS_FEEDS: FeedDef[] = [
  { name: "Les Échos", url: "https://services.lesechos.fr/rss/les-echos-finance-marches.xml", lang: "fr" },
  { name: "Boursorama", url: "https://www.boursorama.com/rss/actualites/economie", lang: "fr" },
  { name: "Zonebourse", url: "https://www.zonebourse.com/rss/", lang: "fr" },
  // Reuters n'a plus de flux RSS public : on passe par une recherche Google News filtrée.
  { name: "Reuters", url: "https://news.google.com/rss/search?q=site:reuters.com+markets&hl=en-US&gl=US&ceid=US:en", lang: "en" },
  { name: "CNBC", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", lang: "en" },
  { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex", lang: "en" },
];

/** Page d'accueil des sources (utilisée par les articles de démonstration) */
export const SOURCE_HOMEPAGES: Record<string, string> = {
  "Les Échos": "https://www.lesechos.fr/finance-marches",
  Boursorama: "https://www.boursorama.com/bourse/actualites/",
  Zonebourse: "https://www.zonebourse.com/actualite-bourse/",
  Reuters: "https://www.reuters.com/markets/",
  CNBC: "https://www.cnbc.com/markets/",
  "Yahoo Finance": "https://finance.yahoo.com/news/",
};
