"use client";
import { usePinned } from "@/lib/store";

export function PinButton({ slug }: { slug: string }) {
  const { isPinned, toggle } = usePinned();
  const on = isPinned(slug);
  return (
    <button onClick={() => toggle(slug)} aria-pressed={on} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition ${on ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "border-line bg-surface text-muted hover:text-fg"}`}>
      <span aria-hidden>📌</span>
      {on ? "Épinglé" : "Épingler"}
    </button>
  );
}
