export const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Erreur ${r.status}`);
  return r.json();
};

export const REFRESH_QUOTES = 60_000;
export const REFRESH_NEWS = 5 * 60_000;
