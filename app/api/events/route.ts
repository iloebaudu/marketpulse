import { NextResponse } from "next/server";
import { getEvents } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const symbols = sp.get("symbols")?.split(",").filter(Boolean);
  const events = await getEvents({
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    category: sp.get("category") ?? undefined,
    symbols,
    limit: Number(sp.get("limit")) || undefined,
  });
  return NextResponse.json({ events }, { headers: { "Cache-Control": "public, s-maxage=900" } });
}
