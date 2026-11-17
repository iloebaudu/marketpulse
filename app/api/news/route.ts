import { NextResponse } from "next/server";
import { queryNews } from "@/lib/news/query";

export const dynamic = "force-dynamic";

const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : undefined);

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  try {
    const data = await queryNews({
      category: sp.get("category") ?? undefined,
      symbols: list(sp.get("symbols")),
      keywords: list(sp.get("keywords")),
      q: sp.get("q") ?? undefined,
      limit: Number(sp.get("limit")) || undefined,
      perCategory: Number(sp.get("perCategory")) || undefined,
    });
    return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } });
  } catch (e) {
    return NextResponse.json({ articles: [], errors: [{ source: "Actualités", message: (e as Error).message }] }, { status: 502 });
  }
}
