import { NextResponse } from "next/server";
import { getQuotes } from "@/lib/market";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const symbols = (new URL(req.url).searchParams.get("symbols") ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 150);
  try {
    const data = await getQuotes(symbols);
    return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } });
  } catch (e) {
    return NextResponse.json({ quotes: [], errors: [{ source: "Cotations", message: (e as Error).message }] }, { status: 502 });
  }
}
