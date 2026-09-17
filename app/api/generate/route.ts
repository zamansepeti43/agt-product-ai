import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getPreset } from "@/lib/ai/presets";
import type { GenerationJob, ImageJobMode } from "@/lib/ai/types";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MODES = new Set<ImageJobMode>(["hero", "white", "studio", "lifestyle", "detail", "social"]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image");
  const rawMode = String(formData.get("mode") ?? "hero");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ürün görseli gerekli." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Sadece JPG, PNG veya WEBP kabul edilir." }, { status: 415 });
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Görsel 12 MB'dan küçük olmalı." }, { status: 413 });
  }

  if (!MODES.has(rawMode as ImageJobMode)) {
    return NextResponse.json({ error: "Geçersiz üretim modu." }, { status: 400 });
  }

  const mode = rawMode as ImageJobMode;
  const preset = getPreset(mode);
  const provider = process.env.IMAGE_PROVIDER || "not-configured";

  const job: GenerationJob = {
    id: randomUUID(),
    status: provider === "not-configured" ? "queued" : "processing",
    mode,
    provider,
    createdAt: new Date().toISOString(),
    message:
      provider === "not-configured"
        ? "Görsel doğrulandı. AI provider bağlantısı bekleniyor."
        : `${preset.label} üretim kuyruğuna alındı.`,
  };

  return NextResponse.json({
    job,
    input: {
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      preset: {
        id: preset.id,
        aspectRatio: preset.aspectRatio,
        prompt: preset.prompt,
      },
    },
  }, { status: 202 });
}
