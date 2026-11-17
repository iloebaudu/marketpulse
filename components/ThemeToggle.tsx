"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("mp:theme", next ? "dark" : "light"); } catch { /* ignore */ }
    setDark(next);
  };
  return (
    <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-base hover:bg-surface2" aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"} title={dark ? "Mode clair" : "Mode sombre"}>
      {dark === null ? "◐" : dark ? "☀️" : "🌙"}
    </button>
  );
}

/** Script injecté avant le rendu pour éviter le flash de thème */
export const themeScript = `(function(){try{var t=localStorage.getItem('mp:theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;
