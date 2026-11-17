"use client";
/**
 * Préférences utilisateur sauvegardées localement (localStorage) :
 * catégories épinglées, watchlist, catégories personnalisées.
 */
import { useCallback, useSyncExternalStore } from "react";
import type { CategoryDef } from "@/lib/types";

const KEYS = { pinned: "mp:pinned", watchlist: "mp:watchlist", custom: "mp:custom" } as const;
type Key = keyof typeof KEYS;

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: Key, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(KEYS[key]); } catch { /* stockage indisponible */ }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  try { if (raw) value = JSON.parse(raw) as T; } catch { /* JSON invalide */ }
  cache.set(key, { raw, value });
  return value;
}

function write<T>(key: Key, value: T) {
  try { window.localStorage.setItem(KEYS[key], JSON.stringify(value)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key?.startsWith("mp:")) l(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}

const EMPTY: never[] = [];

function useStored<T>(key: Key): [T[], (v: T[]) => void] {
  const value = useSyncExternalStore(subscribe, () => read<T[]>(key, EMPTY), () => EMPTY);
  const set = useCallback((v: T[]) => write(key, v), [key]);
  return [value, set];
}

export function usePinned() {
  const [pinned, set] = useStored<string>("pinned");
  const toggle = useCallback((slug: string) => set(pinned.includes(slug) ? pinned.filter((s) => s !== slug) : [...pinned, slug]), [pinned, set]);
  return { pinned, toggle, isPinned: (slug: string) => pinned.includes(slug) };
}

export function useWatchlist() {
  const [list, set] = useStored<string>("watchlist");
  const toggle = useCallback((sym: string) => set(list.includes(sym) ? list.filter((s) => s !== sym) : [...list, sym]), [list, set]);
  return { watchlist: list, toggle, has: (sym: string) => list.includes(sym) };
}

export function useCustomCategories() {
  const [list, set] = useStored<CategoryDef>("custom");
  const save = useCallback((c: CategoryDef) => set(list.some((x) => x.slug === c.slug) ? list.map((x) => (x.slug === c.slug ? c : x)) : [...list, c]), [list, set]);
  const remove = useCallback((slug: string) => set(list.filter((x) => x.slug !== slug)), [list, set]);
  return { custom: list, save, remove };
}
