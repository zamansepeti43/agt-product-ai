import sharp from "sharp";
import type { GeneratedAsset, ImageProvider, ProductImageInput } from "../types";

const BASE_URL = "https://aihorde.net/api/v2/generate";
const ANONYMOUS_KEY = "0000000000";
const DEFAULT_MODEL = "AlbedoBase XL (SDXL)";
const MAX_WAIT_MS = 180_000;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_ATTEMPTS_PER_IMAGE = 3;
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

function variantInstruction(mode: ProductImageInput["mode"], index: number) {
  const variants: Record<string, string[]> = {
    hero: [
      "Variation: pure white marketplace background, soft contact shadow.",
      "Variation: premium neutral studio gradient, subtle floor reflection.",
      "Variation: clean bright modern-home tabletop with tasteful blurred decor and no people.",
      "Variation: editorial product close-up with a soft neutral background and strong product focus.",
    ],
    white: [
      "Variation: straight-on centered marketplace composition.",
      "Variation: three-quarter product angle on pure white.",
      "Variation: slightly elevated product angle on pure white.",
      "Variation: close product crop with clean white negative space.",
    ],
    studio: [
      "Variation: soft gray studio sweep.",
      "Variation: warm neutral studio sweep.",
      "Variation: cool neutral studio sweep.",
      "Variation: premium tabletop studio composition.",
    ],
    lifestyle: [
      "Variation: bright clean kitchen tabletop, no people.",
      "Variation: minimal modern home shelf, no people.",
      "Variation: warm neutral tabletop, no people.",
      "Variation: airy modern interior tabletop, no people.",
    ],
    detail: [
      "Variation: close-up of the upper product construction.",
      "Variation: close-up emphasizing material texture and finish.",
      "Variation: close-up emphasizing handles and body geometry.",
      "Variation: close-up emphasizing the lid and transparent component.",
    ],
    social: [
      "Variation: clean editorial composition with generous negative space.",
      "Variation: premium minimal gradient background.",
      "Variation: bright lifestyle-inspired background with no people.",
      "Variation: bold but tasteful studio composition with the product dominant.",
    ],
  };
  return variants[mode]?.[index % 4] || variants.hero[index % 4];
}

// AI Horde accepts the classic Stable Diffusion prompt separator: positive ### negative.
const NEGATIVE_PROMPT =
  "people, humans, hands, fingers, faces, arms, legs, body parts, skin, human figure, duplicate product, extra product, deformed product, melted product, altered geometry, wrong colors, text, captions, watermark, invented logo, invented label, blurry, low quality";

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
    const height = Math.min(1280, Math.max(512, input.height || 1024));
    const count = Math.min(4, Math.max(1, input.count || 1));

    // AI Horde requires source_image to be raw Base64-encoded WebP.
    // Normalize the uploaded product photo so JPEG/PNG/WEBP all use the same
    // valid img2img payload and EXIF rotation is respected.
    const webp = await sharp(Buffer.from(await input.sourceImage.arrayBuffer()))
      .rotate()
      .webp({ quality: 92 })
      .toBuffer();
    const source = webp.toString("base64");

    const basePrompt = [
      input.prompt || "Create a professional commercial product image.",
      "This is a normal SFW commercial product-photography task.",
      "The source contains a physical product; do not depict human use.",
      "Keep the exact source product as the single hero subject.",
      "Photorealistic, clean, realistic materials, accurate colors, accurate proportions, premium e-commerce photography.",
      "No people or body parts in the scene.",
    ].join(" ");

    const assets: GeneratedAsset[] = [];
    let attempts = 0;

    // Request one image at a time so the app can discard AI Horde safety-censored
    // generations and replace them with another clean variation.
    while (assets.length < count && attempts < count * MAX_ATTEMPTS_PER_IMAGE) {
      const imageIndex = assets.length;
      attempts += 1;
      const prompt = `${basePrompt} ${variantInstruction(input.mode, imageIndex)} ### ${NEGATIVE_PROMPT}`;

      const response = await fetch(`${BASE_URL}/async`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: apiKey },
        body: JSON.stringify({
          prompt,
          models: [model],
          source_image: source,
          source_processing: "img2img",
          params: {
            width,
            height,
            steps: 30,
            n: 1,
            cfg_scale: 7.5,
            denoising_strength: 0.65,
            sampler_name: "k_euler_a",
          },
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
      if (!response.ok || !submitted.id) {
        throw new Error(errorMessage(submitted, `AI Horde isteği başarısız (${response.status}).`));
      }

      const started = Date.now();
      let finishedStatus: any = null;
      while (Date.now() - started < MAX_WAIT_MS) {
        await new Promise((resolve) => setTimeout(resolve, 1800));
        const checkResponse = await fetch(`${BASE_URL}/check/${encodeURIComponent(submitted.id)}`, {
          headers: { apikey: apiKey },
          signal: AbortSignal.timeout(30_000),
        });
        const check = await checkResponse.json().catch(() => ({}));
        if (!checkResponse.ok) throw new Error(errorMessage(check, `AI Horde durum sorgusu başarısız (${checkResponse.status}).`));
        if (check.faulted) throw new Error(check.message || "AI Horde üretimi başarısız oldu.");
        if (!check.done) continue;

        const statusResponse = await fetch(`${BASE_URL}/status/${encodeURIComponent(submitted.id)}`, {
          headers: { apikey: apiKey },
          signal: AbortSignal.timeout(30_000),
        });
        finishedStatus = await statusResponse.json().catch(() => ({}));
        if (!statusResponse.ok) throw new Error(errorMessage(finishedStatus, `AI Horde sonuç sorgusu başarısız (${statusResponse.status}).`));
        break;
      }

      if (!finishedStatus) throw new Error("AI Horde kuyruğu zaman aşımına uğradı.");

      const generations = Array.isArray(finishedStatus.generations) ? finishedStatus.generations : [];
      const generation = generations[0];
      if (!generation?.img) continue;

      if (generation.censored === true || generation.state === "censored") continue;

      const metadata = Array.isArray(generation.gen_metadata) ? generation.gen_metadata : [];
      if (metadata.some((item: any) => item?.type === "censorship")) continue;

      const url = await normalizeImage(String(generation.img));
      assets.push({
        id: `aihorde-${submitted.id}-${assets.length + 1}`,
        url,
        mode: input.mode,
        width,
        height,
      });
    }

    if (!assets.length) {
      throw new Error("AI Horde güvenli bir ürün görseli üretemedi. Farklı bir üretim denemesi yap.");
    }
    if (assets.length < count) {
      throw new Error(`AI Horde ${assets.length}/${count} temiz ürün görseli üretebildi. Tekrar deneyebilirsin.`);
    }
    return assets;
  }
}
