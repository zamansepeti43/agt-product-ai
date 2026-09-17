import { NextResponse } from "next/server";
import { generateCatalogCopy } from "@/lib/catalog/generator";
import type { ProductCatalogInput } from "@/lib/catalog/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 160;
const MAX_KEYWORDS = 20;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductCatalogInput;
    const input: ProductCatalogInput = {
      name: String(body.name ?? "").slice(0, MAX_TEXT),
      category: String(body.category ?? "").slice(0, MAX_TEXT),
      brand: String(body.brand ?? "").slice(0, MAX_TEXT),
      keywords: Array.isArray(body.keywords) ? body.keywords.map(String).slice(0, MAX_KEYWORDS) : [],
      marketplace: ["etsy", "hepsiburada", "trendyol", "amazon", "generic"].includes(String(body.marketplace)) ? body.marketplace : "generic",
      language: body.language === "en" ? "en" : "tr",
    };

    return NextResponse.json({ catalog: generateCatalogCopy(input) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Katalog içeriği oluşturulamadı." }, { status: 400 });
  }
}
