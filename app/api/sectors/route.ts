import { NextResponse } from "next/server";
import { getSectorSummaries } from "@/lib/market";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSectorSummaries();
    return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } });
  } catch (e) {
    return NextResponse.json({ sectors: [], errors: [{ source: "Secteurs", message: (e as Error).message }] }, { status: 502 });
  }
}
