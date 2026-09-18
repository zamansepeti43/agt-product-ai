import type { GeneratedAsset, ImageProvider, ProductImageInput } from "../types";

const BASE_URL = "https://aihorde.net/api/v2/generate";
const ANONYMOUS_KEY = "0000000000";
const DEFAULT_MODEL = "AlbedoBase XL (SDXL)";
const MAX_WAIT_MS = 180_000;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function toBase64(bytes: ArrayBuffer) {
  return Buffer.from(bytes).toString("base64");
}

function toDataUrl(bytes: ArrayBuffer, mimeType: string) {
  return `data:${mimeType || "image/png"};base64,${toBase64(bytes)}`;
}

function errorMessage(data: any, fallback: string) {
  return data?.message || data?.rc || data?.error || fallback;
}

async function normalizeImage(raw: string) {
  if (raw.startsWith("data:image/")) return raw;
  let target: URL;
  try { target = new URL(raw); } catch { throw new Error("AI Horde geçersiz görsel URL'si döndürdü."); }
  if (target.protocol !== "https:") throw new Error("AI Horde görsel bağlantısı güvenli HTTPS olmalı.");
  const response = await fetch(target, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`AI Horde görseli alınamadı (${response.status}).`);
  const contentType = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
  if (!IMAGE_TYPES.has(contentType)) throw new Error("AI Horde geçerli bir görsel döndürmedi.");
  const length = Number(response.headers.get("content-length") || 0);
  if (length > MAX_IMAGE_BYTES) throw new Error("AI Horde görseli 12 MB sınırını aşıyor.");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) throw new Error("AI Horde görseli 12 MB sınırını aşıyor.");
  return toDataUrl(bytes, contentType);
}

export class AIHordeProvider implements ImageProvider {
  readonly id = "aihorde";

  async generate(input: ProductImageInput): Promise<GeneratedAsset[]> {
    const apiKey = input.providerConfig?.apiKey?.trim() || process.env.AIHORDE_API_KEY?.trim() || ANONYMOUS_KEY;
    const model = input.providerConfig?.model?.trim() || process.env.AIHORDE_MODEL?.trim() || DEFAULT_MODEL;
    const width = Math.min(1024, Math.max(512, input.width || 1024));
    const height = Math.min(1024, Math.max(512, input.height || 1024));
    const count = Math.min(4, Math.max(1, input.count || 1));
    // AI Horde expects source_image as raw Base64 image data, not a data: URL.
    // The API documentation specifies a Base64-encoded WebP; raw Base64 is also
    // accepted by the validator for uploaded image payloads.
    const source = toBase64(await input.sourceImage.arrayBuffer());
    const prompt = [
      "Create a commercial product image from the supplied source image.",
      "Preserve the product identity, shape, proportions, branding, colors and important details.",
      input.prompt || "",
    ].filter(Boolean).join(" ");

    const response = await fetch(`${BASE_URL}/async`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: apiKey },
      body: JSON.stringify({
        prompt,
        models: [model],
        source_image: source,
        source_processing: "img2img",
        params: { width, height, steps: 25, n: count, cfg_scale: 6, sampler_name: "k_euler_a" },
        nsfw: false,
        censor_nsfw: true,
        r2: true,
        shared: false,
        replacement_filter: true,
        allow_downgrade: true,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const submitted = await response.json().catch(() => ({}));
    if (!response.ok || !submitted.id) throw new Error(errorMessage(submitted, `AI Horde isteği başarısız (${response.status}).`));

    const started = Date.now();
    while (Date.now() - started < MAX_WAIT_MS) {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      const checkResponse = await fetch(`${BASE_URL}/check/${encodeURIComponent(submitted.id)}`, { headers: { apikey: apiKey }, signal: AbortSignal.timeout(30_000) });
      const check = await checkResponse.json().catch(() => ({}));
      if (!checkResponse.ok) throw new Error(errorMessage(check, `AI Horde durum sorgusu başarısız (${checkResponse.status}).`));
      if (check.faulted) throw new Error(check.message || "AI Horde üretimi başarısız oldu.");
      if (!check.done) continue;

      const statusResponse = await fetch(`${BASE_URL}/status/${encodeURIComponent(submitted.id)}`, { headers: { apikey: apiKey }, signal: AbortSignal.timeout(30_000) });
      const status = await statusResponse.json().catch(() => ({}));
      if (!statusResponse.ok) throw new Error(errorMessage(status, `AI Horde sonuç sorgusu başarısız (${statusResponse.status}).`));

      const generations = Array.isArray(status.generations) ? status.generations : [];
      const assets: GeneratedAsset[] = [];
      for (let index = 0; index < generations.length; index += 1) {
        const raw = String(generations[index]?.img || "");
        if (!raw) continue;
        const url = await normalizeImage(raw);
        assets.push({ id: `aihorde-${submitted.id}-${index + 1}`, url, mode: input.mode, width, height });
      }

      if (!assets.length) throw new Error("AI Horde üretimi tamamlandı fakat görsel döndürmedi.");
      return assets;
    }

    throw new Error("AI Horde kuyruğu zaman aşımına uğradı.");
  }
}
