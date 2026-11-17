"use client";
import { useEffect, useState } from "react";
import { fmtShortDateTime, fmtTime, timeAgo } from "@/lib/format";

/** Heure de Paris + durée relative (recalculée côté client pour éviter les écarts d'hydratation). */
export function TimeAgo({ ms, withDate = false }: { ms: number; withDate?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const abs = withDate || (now && now - ms > 20 * 3600_000) ? fmtShortDateTime(ms) : fmtTime(ms);
  return (
    <time dateTime={new Date(ms).toISOString()} title={fmtShortDateTime(ms)}>
      <span className="num">{abs}</span>
      {now && <span className="text-muted"> · {timeAgo(ms, now)}</span>}
    </time>
  );
}
