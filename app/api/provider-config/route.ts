import { NextResponse } from "next/server";
import { clearProviderCookie, getProviderConfig, setProviderCookie } from "@/lib/ai/provider-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["gemini","openai","custom-openai","cloudflare","aihorde"]);

export async function GET(request: Request) {
  const provider = new URL(request.url).searchParams.get("provider")?.trim().toLowerCase() || "";
  if (!ALLOWED.has(provider)) return NextResponse.json({ error: "Desteklenmeyen AI provider." }, { status: 400 });
  const config = await getProviderConfig(provider);
  return NextResponse.json({ connected: Boolean(config.apiKey), accountId: config.accountId || undefined }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const provider = typeof body.provider === "string" ? body.provider.trim().toLowerCase() : "";
    const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
    const accountId = typeof body.accountId === "string" ? body.accountId.trim() : "";
    if (!ALLOWED.has(provider)) return NextResponse.json({ error: "Desteklenmeyen AI provider." }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "API anahtarı gerekli." }, { status: 400 });
    if (apiKey.length > 1000) return NextResponse.json({ error: "API anahtarı çok uzun." }, { status: 400 });
    if (provider === "cloudflare" && !accountId) return NextResponse.json({ error: "Cloudflare Account ID gerekli." }, { status: 400 });
    const response = NextResponse.json({ connected: true });
    setProviderCookie(response, provider, { apiKey, accountId });
    return response;
  } catch {
    return NextResponse.json({ error: "AI provider bağlantısı kaydedilemedi." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const provider = new URL(request.url).searchParams.get("provider")?.trim().toLowerCase() || "";
  if (!ALLOWED.has(provider)) return NextResponse.json({ error: "Desteklenmeyen AI provider." }, { status: 400 });
  const response = NextResponse.json({ connected: false });
  clearProviderCookie(response, provider);
  return response;
}
