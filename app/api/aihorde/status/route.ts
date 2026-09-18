import { NextResponse } from "next/server";
import { readHordeSubmission } from "@/lib/ai/providers/aihorde-job";
import { getProviderConfig } from "@/lib/ai/provider-session";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const apiKey = (await getProviderConfig("aihorde")).apiKey || "";
    if (!id) return NextResponse.json({ error: "AI Horde job ID gerekli." }, { status: 400 });
    return NextResponse.json(await readHordeSubmission(id, apiKey));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI Horde durumu alınamadı." }, { status: 500 });
  }
}
