import { NextResponse } from "next/server";
import { getPreset } from "@/lib/ai/presets";
import type { ImageJobMode, ProviderConfig } from "@/lib/ai/types";
import { getProviderConfig } from "@/lib/ai/provider-session";
import { buildHordeSubmission } from "@/lib/ai/providers/aihorde-job";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MODES = new Set<ImageJobMode>(["hero", "white", "studio", "lifestyle", "detail", "social"]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File)) return NextResponse.json({ error: "Ürün görseli gerekli." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Sadece JPG, PNG veya WEBP kabul edilir." }, { status: 415 });
    if (file.size === 0 || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Görsel 12 MB'dan küçük olmalı." }, { status: 413 });

    const mode = String(form.get("mode") || "hero") as ImageJobMode;
    const count = Math.min(10, Math.max(1, Number(form.get("count") || 1)));
    if (!MODES.has(mode) || !Number.isInteger(count)) return NextResponse.json({ error: "Geçersiz üretim ayarı." }, { status: 400 });

    const prompt = String(form.get("prompt") || "").trim().slice(0, 1200);
    const providerApiKey = (await getProviderConfig("aihorde")).apiKey || "";
    const providerModel = String(form.get("providerModel") || "").trim().slice(0, 160);
    const job = await buildHordeSubmission({
      sourceImage: file,
      mode,
      prompt: prompt ? `${getPreset(mode).prompt}\n\nEk kullanıcı talimatı: ${prompt}` : getPreset(mode).prompt,
      count,
      providerConfig: { apiKey: providerApiKey || undefined, model: providerModel || undefined } satisfies ProviderConfig,
    });

    return NextResponse.json({
      job: {
        id: job.id,
        status: "processing",
        mode,
        provider: "aihorde",
        createdAt: job.createdAt,
        message: "AI Horde kuyruğuna alındı. Program sonucu arka planda kontrol ediyor.",
        requestedCount: count,
      },
    }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI Horde isteği oluşturulamadı." }, { status: 500 });
  }
}
