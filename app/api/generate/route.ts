import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getImageProvider, configuredImageProviderId } from "@/lib/ai/provider";
import { getPreset } from "@/lib/ai/presets";
import type { GenerationJob, ImageJobMode } from "@/lib/ai/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MODES = new Set<ImageJobMode>(["hero", "white", "studio", "lifestyle", "detail", "social"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const rawMode = String(formData.get("mode") ?? "hero");

    if (!(file instanceof File)) return NextResponse.json({ error: "Ürün görseli gerekli." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Sadece JPG, PNG veya WEBP kabul edilir." }, { status: 415 });
    if (file.size === 0 || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Görsel 12 MB'dan küçük olmalı." }, { status: 413 });
    if (!MODES.has(rawMode as ImageJobMode)) return NextResponse.json({ error: "Geçersiz üretim modu." }, { status: 400 });

    const mode = rawMode as ImageJobMode;
    const preset = getPreset(mode);
    const providerId = configuredImageProviderId();
    const provider = getImageProvider();

    const job: GenerationJob = {
      id: randomUUID(),
      status: provider ? "processing" : "queued",
      mode,
      provider: providerId,
      createdAt: new Date().toISOString(),
      message: provider
        ? `${preset.label} üretimi başlatıldı.`
        : "Görsel doğrulandı. AI provider bağlantısı bekleniyor.",
    };

    if (!provider) {
      return NextResponse.json({ job, input: { fileName: file.name, mimeType: file.type, sizeBytes: file.size, preset } }, { status: 202 });
    }

    const assets = await provider.generate({
      sourceImage: file,
      fileName: file.name,
      mimeType: file.type,
      mode,
      prompt: preset.prompt,
      width: mode === "hero" || mode === "white" ? 1024 : 1024,
      height: mode === "studio" || mode === "lifestyle" || mode === "detail" || mode === "social" ? 1280 : 1024,
    });

    return NextResponse.json({
      job: { ...job, status: "completed", message: `${assets.length} görsel üretildi.` },
      assets,
      input: { fileName: file.name, mimeType: file.type, sizeBytes: file.size, preset },
    }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Üretim sırasında bilinmeyen bir hata oluştu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
