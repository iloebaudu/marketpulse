import { NextResponse } from "next/server";
import { getHistory } from "@/lib/market";
import type { Range } from "@/lib/types";

export const dynamic = "force-dynamic";
const RANGES: Range[] = ["1J", "1S", "1M", "1A", "5A"];

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const symbol = sp.get("symbol") ?? "";
  const range = (RANGES.includes(sp.get("range") as Range) ? sp.get("range") : "1M") as Range;
  const data = await getHistory(symbol, range);
  const maxAge = range === "1J" ? 60 : range === "1S" ? 300 : 3600;
  return NextResponse.json(data, { headers: { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=60` } });
}
