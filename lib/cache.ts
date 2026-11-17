/**
 * Cache mémoire simple (par instance serveur) avec :
 *  - TTL de fraîcheur,
 *  - déduplication des requêtes concurrentes,
 *  - repli sur la dernière valeur connue si la source échoue (stale-if-error).
 * En production multi-instances, remplacez par Redis/Upstash avec la même interface.
 */
type Entry = { value: unknown; freshUntil: number; keepUntil: number };

const g = globalThis as unknown as { __mpCache?: Map<string, Entry>; __mpInflight?: Map<string, Promise<unknown>> };
const store = (g.__mpCache ??= new Map());
const inflight = (g.__mpInflight ??= new Map());

export interface CachedResult<T> {
  value: T;
  stale: boolean;
}

export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
  keepMs = 24 * 3600_000,
): Promise<CachedResult<T>> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.freshUntil > now) return { value: hit.value as T, stale: false };

  let p = inflight.get(key) as Promise<T> | undefined;
  if (!p) {
    p = fn().finally(() => inflight.delete(key));
    inflight.set(key, p);
  }
  try {
    const value = await p;
    store.set(key, { value, freshUntil: Date.now() + ttlMs, keepUntil: Date.now() + keepMs });
    return { value, stale: false };
  } catch (err) {
    if (hit && hit.keepUntil > now) return { value: hit.value as T, stale: true };
    throw err;
  }
}

export async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}
