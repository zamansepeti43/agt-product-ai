import sharp from "sharp";
import type { ImageJobMode, ProviderConfig } from "./types";
import { getPreset } from "./presets";

const BASE_URL = "https://aihorde.net/api/v2/generate";
const ANONYMOUS_KEY = "0000000000";
const DEFAULT_MODEL = "AlbedoBase XL (SDXL)";
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const VARIANTS: Record<string, string[]> = {
  hero: [
    "pure white marketplace background, soft contact shadow",
    "premium neutral studio gradient, subtle floor reflection",
    "clean modern-home tabletop with tasteful blurred decor and no people",
    "editorial product close-up with a soft neutral background",
  ],
  white: [
    "straight-on centered marketplace composition on pure white",
    "three-quarter product angle on pure white",
    "slightly elevated product angle on pure white",
    "close product crop with clean white negative space",
  ],
  studio: [
    "soft gray studio sweep",
    "warm neutral studio sweep",
    "cool neutral studio sweep",
    "premium tabletop studio composition",
  ],
  lifestyle: [
    "bright clean kitchen tabletop, no people",
    "minimal modern home shelf, no people",
    "warm neutral tabletop, no people",
    "airy modern interior tabletop, no people",
  ],
  detail: [
    "close-up of the upper product construction",
    "close-up emphasizing material texture and finish",
    "close-up emphasizing handles and body geometry",
    "close-up emphasizing the lid and transparent component",
  ],
  social: [
    "clean editorial composition with generous negative space",
    "premium minimal gradient background",
    "bright lifestyle-inspired background with no people",
    "bold but tasteful studio composition with the product dominant",
  ],
};

const NEGATIVE_PROMPT =
  "people, humans, hands, fingers, faces, arms, legs, body parts, skin, human figure, duplicate product, extra product, deformed product, melted product, altered geometry, wrong colors, text, captions, watermark, invented logo, invented label, blurry, low quality";

export async function buildHordeSubmission(args: {
  sourceImage: File;
  mode: ImageJobMode;
  prompt: string;
  count: number;
  providerConfig?: ProviderConfig;
}) {
  const apiKey = args.providerConfig?.apiKey?.trim() || process.env.AIHORDE_API_KEY?.trim() || ANONYMOUS_KEY;
  const model = args.providerConfig?.model?.trim() || process.env.AIHORDE_MODEL?.trim() || DEFAULT_MODEL;
  const width = 1024;
  const height = ["studio", "lifestyle", "detail", "social"].includes(args.mode) ? 1280 : 1024;

  const webp = await sharp(Buffer.from(await args.sourceImage.arrayBuffer()))
    .rotate()
    .webp({ quality: 92 })
    .toBuffer();
  if (webp.byteLength > MAX_IMAGE_BYTES) throw new Error("Hazırlanan görsel 12 MB sınırını aşıyor.");

  const preset = getPreset(args.mode);
  const positive = [
    args.prompt || preset.prompt,
    "This is a normal SFW commercial product-photography task.",
    "The source contains a physical product; do not depict human use.",
    "Keep the exact source product as the single hero subject.",
    "Photorealistic, clean, realistic materials, accurate colors, accurate proportions, premium e-commerce photography.",
    "No people or body parts in the scene.",
  ].join(" ");

  const variants = Array.from({ length: args.count }, (_, i) =>
    `${positive} Variation ${i + 1}: ${VARIANTS[args.mode]?.[i % 4] || VARIANTS.hero[i % 4]}. ### ${NEGATIVE_PROMPT}`
  );

  // AI Horde supports n in one generation request. We submit one request for
  // the whole set so the browser can poll a single job instead of keeping a
  // Vercel function open for minutes.
  const response = await fetch(`${BASE_URL}/async`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: apiKey },
    body: JSON.stringify({
      prompt: variants.join(" "),
      models: [model],
      source_image: webp.toString("base64"),
      source_processing: "img2img",
      params: {
        width,
        height,
        steps: 30,
        n: args.count,
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

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) {
    throw new Error(data?.message || data?.rc || data?.error || `AI Horde isteği başarısız (${response.status}).`);
  }

  return {
    id: String(data.id),
    provider: "aihorde",
    count: args.count,
    width,
    height,
    createdAt: new Date().toISOString(),
  };
}

export async function readHordeSubmission(id: string, apiKeyInput?: string) {
  const apiKey = apiKeyInput?.trim() || process.env.AIHORDE_API_KEY?.trim() || ANONYMOUS_KEY;
  const checkResponse = await fetch(`${BASE_URL}/check/${encodeURIComponent(id)}`, {
    headers: { apikey: apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const check = await checkResponse.json().catch(() => ({}));
  if (!checkResponse.ok) throw new Error(check?.message || `AI Horde durum sorgusu başarısız (${checkResponse.status}).`);
  if (check.faulted) throw new Error(check.message || "AI Horde üretimi başarısız oldu.");
  if (!check.done) return { status: "processing" as const, id, queuePosition: check.queue_position ?? null };

  const statusResponse = await fetch(`${BASE_URL}/status/${encodeURIComponent(id)}`, {
    headers: { apikey: apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const finished = await statusResponse.json().catch(() => ({}));
  if (!statusResponse.ok) throw new Error(finished?.message || `AI Horde sonuç sorgusu başarısız (${statusResponse.status}).`);

  const generations = Array.isArray(finished.generations) ? finished.generations : [];
  const assets = generations
    .filter((g: any) => g?.img && g?.censored !== true && g?.state !== "censored")
    .filter((g: any) => !Array.isArray(g?.gen_metadata) || !g.gen_metadata.some((m: any) => m?.type === "censorship"))
    .map((g: any, index: number) => ({
      id: `aihorde-${id}-${index + 1}`,
      url: String(g.img),
      index,
    }));

  if (!assets.length) return { status: "failed" as const, id, error: "AI Horde güvenli bir ürün görseli üretemedi." };
  return { status: "completed" as const, id, assets };
}
