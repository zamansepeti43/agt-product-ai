import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { configuredImageProviderId, generateWithConfiguredStrategy } from "@/lib/ai/provider";
import { getPreset } from "@/lib/ai/presets";
import type { GeneratedAsset, GenerationJob, ImageJobMode, ProviderConfig } from "@/lib/ai/types";
import type { ProviderConfigMap } from "@/lib/ai/router";

export const runtime = "nodejs";
export const maxDuration = 300;
const MAX_FILES = 6;
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_TOTAL_SIZE = 48 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MODES = new Set<ImageJobMode>(["hero", "white", "studio", "lifestyle", "detail", "social"]);
const PROVIDERS = new Set(["gemini", "comfyui", "aihorde", "custom-openai", "auto-free"]);

function readProviderConfig(formData: FormData) {
  const provider = String(formData.get("provider") || process.env.IMAGE_PROVIDER || "").trim().toLowerCase();
  const fallback: ProviderConfig = { apiKey: String(formData.get("providerApiKey") || "").trim().slice(0, 500), model: String(formData.get("providerModel") || "").trim().slice(0, 160), baseUrl: String(formData.get("providerBaseUrl") || "").trim().slice(0, 500) };
  let configs: ProviderConfigMap = provider && provider !== "auto-free" ? { [provider]: fallback } : {};
  const rawConfigs = String(formData.get("providerConfigs") || "").trim();
  if (rawConfigs) {
    try {
      const parsed = JSON.parse(rawConfigs) as Record<string, unknown>;
      configs = Object.fromEntries(Object.entries(parsed).map(([id, value]) => {
        const config = value && typeof value === "object" ? value as Record<string, unknown> : {};
        return [id, { apiKey: typeof config.apiKey === "string" ? config.apiKey.slice(0, 500) : undefined, model: typeof config.model === "string" ? config.model.slice(0, 160) : undefined, baseUrl: typeof config.baseUrl === "string" ? config.baseUrl.slice(0, 500) : undefined } satisfies ProviderConfig];
      }));
    } catch { throw new Error("AI provider ayarları geçerli JSON değil."); }
  }
  return { provider, configs };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images").filter((value): value is File => value instanceof File);
    const rawMode = String(formData.get("mode") ?? "hero");
    const rawCount = Number(formData.get("count") ?? 1);
    const customPrompt = String(formData.get("prompt") ?? "").trim().slice(0, 1200);
    const { provider: providerId, configs } = readProviderConfig(formData);
    if (!files.length) return NextResponse.json({ error: "En az bir ürün görseli gerekli." }, { status: 400 });
    if (files.length > MAX_FILES) return NextResponse.json({ error: `En fazla ${MAX_FILES} görsel aynı anda işlenebilir.` }, { status: 413 });
    if (!MODES.has(rawMode as ImageJobMode)) return NextResponse.json({ error: "Geçersiz üretim modu." }, { status: 400 });
    if (!Number.isInteger(rawCount) || rawCount < 1 || rawCount > 4) return NextResponse.json({ error: "Görsel sayısı 1 ile 4 arasında olmalı." }, { status: 400 });
    if (providerId && !PROVIDERS.has(providerId)) return NextResponse.json({ error: "Desteklenmeyen AI provider." }, { status: 400 });
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) return NextResponse.json({ error: "Toplam yükleme boyutu 48 MB sınırını aşıyor." }, { status: 413 });
    for (const file of files) { if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Sadece JPG, PNG veya WEBP kabul edilir." }, { status: 415 }); if (file.size === 0 || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Her görsel 12 MB'dan küçük olmalı." }, { status: 413 }); }
    const mode = rawMode as ImageJobMode;
    const preset = getPreset(mode);
    const effectiveProviderId = providerId || configuredImageProviderId();
    const hasStrategy = effectiveProviderId === "auto-free" || Boolean(effectiveProviderId);
    const prompt = customPrompt ? `${preset.prompt}\n\nEk kullanıcı talimatı: ${customPrompt}` : preset.prompt;
    const job: GenerationJob = { id: randomUUID(), status: hasStrategy ? "processing" : "queued", mode, provider: effectiveProviderId || "not-configured", createdAt: new Date().toISOString(), message: hasStrategy ? `${files.length} ürün için toplu üretim başlatıldı.` : "Görseller doğrulandı. AI provider bağlantısı bekleniyor." };
    if (!hasStrategy) return NextResponse.json({ job, input: { fileCount: files.length, count: rawCount, preset } }, { status: 202 });
    const assets: GeneratedAsset[] = [];
    let usedProvider = effectiveProviderId;
    const skipped = new Set<string>();
    for (const file of files) {
      const result = await generateWithConfiguredStrategy(effectiveProviderId, { sourceImage: file, fileName: file.name, mimeType: file.type, mode, prompt, count: rawCount, width: 1024, height: ["studio", "lifestyle", "detail", "social"].includes(mode) ? 1280 : 1024 }, configs);
      assets.push(...result.assets); usedProvider = result.providerId; result.skipped.forEach((id) => skipped.add(id));
    }
    const message = effectiveProviderId === "auto-free" ? `${assets.length} görsel üretildi (${files.length} ürün). Kullanılan motor: ${usedProvider}${skipped.size ? ` • Atlanan: ${Array.from(skipped).join(", ")}` : ""}.` : `${assets.length} görsel üretildi (${files.length} ürün).`;
    return NextResponse.json({ job: { ...job, provider: usedProvider, status: "completed", message }, assets, input: { fileCount: files.length, count: rawCount, preset } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Toplu üretim sırasında bilinmeyen bir hata oluştu." }, { status: 500 }); }
}
