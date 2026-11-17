import { NextResponse } from "next/server";
import { searchCategories, searchInstruments } from "@/lib/search";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return NextResponse.json({
    instruments: searchInstruments(q, 8).map((i) => ({ symbol: i.symbol, name: i.name, exchange: i.exchange, class: i.class })),
    categories: searchCategories(q).map((c) => ({ slug: c.slug, name: c.name, icon: c.icon, color: c.color })),
  });
}
