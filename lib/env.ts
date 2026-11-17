import "server-only";

export type DataMode = "demo" | "live";

export const env = {
  finnhubKey: process.env.FINNHUB_API_KEY || "",
  twelveKey: process.env.TWELVEDATA_API_KEY || "",
  newsApiKey: process.env.NEWSAPI_KEY || "",
  rssEnabled: (process.env.NEWS_RSS_ENABLED ?? "true") !== "false",
};

/** Mode démo si aucune clé de marché n'est fournie (ou DATA_MODE=demo). */
export function getDataMode(): DataMode {
  const forced = process.env.DATA_MODE;
  if (forced === "demo" || forced === "live") return forced;
  return env.finnhubKey || env.twelveKey ? "live" : "demo";
}
