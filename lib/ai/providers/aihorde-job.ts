import sharp from "sharp";
import type { ImageJobMode, ProviderConfig } from "../types";
import { getPreset } from "../presets";

const BASE_URL = "https://aihorde.net/api/v2/generate";
const ANONYMOUS_KEY = "0000000000";
const DEFAULT_MODEL = "AlbedoBase XL (SDXL)";
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const VARIANTS: Record<string, string[]> = {
  hero: [
    "clean hero composition, eye-level premium commercial lighting",
    "three-quarter camera angle with a different camera height and depth of field",
    "authentic environment where the product naturally belongs",
    "editorial close-up emphasizing a real visible feature",
    "wider environmental composition showing realistic scale",
    "natural use moment when genuinely appropriate to the product",
    "different time-of-day treatment suited to the product",
    "asymmetric advertising composition with useful negative space",
    "premium catalog/editorial lens perspective",
    "strong natural high-conversion selling scenario different from the others",
  ],
  white: [
    "straight-on centered marketplace composition on pure white",
    "three-quarter product angle on pure white",
    "slightly elevated product angle on pure white",
    "close product crop with clean white negative space",
    "low camera angle with soft contact shadow",
    "high camera angle with generous clean space",
    "subtle diagonal composition while keeping the full product visible",
    "premium catalog angle with controlled studio light",
    "macro-inspired crop showing a real product detail",
    "final clean marketplace hero composition unlike the others",
  ],
  studio: [
    "soft gray studio sweep with controlled softbox lighting",
    "warm neutral studio sweep with a different camera angle",
    "cool neutral studio sweep with deeper realistic shadows",
    "premium tabletop studio composition",
    "dramatic but realistic side lighting",
    "high-key editorial studio setup",
    "low-key premium studio setup with controlled highlights",
    "asymmetric studio composition with negative space",
    "close editorial studio crop emphasizing material",
    "distinct luxury commercial studio composition",
  ],
  lifestyle: [
    "bright real-world environment naturally associated with the product",
    "modern home or workplace context appropriate to the product",
    "authentic outdoor or public context if the product belongs there",
    "close lifestyle scene showing a real use detail",
    "wider environment showing believable scale",
    "natural human interaction only when genuinely appropriate for the product",
    "different time-of-day atmosphere that fits the product",
    "editorial lifestyle composition with useful negative space",
    "premium candid-style commercial composition",
    "strongest natural product-use scenario, clearly different from the others",
  ],
  detail: [
    "close-up of a real construction detail",
    "close-up emphasizing material texture and finish",
    "close-up emphasizing a real handle, compartment, control or functional part",
    "close-up emphasizing stitching, edges or craftsmanship when visible",
    "macro-style crop of a real surface detail",
    "three-quarter detail showing how parts connect",
    "controlled side-lighting to reveal real texture",
    "top-down detail composition",
    "editorial detail crop with shallow depth of field",
    "most useful feature-focused detail image visible in the reference",
  ],
  social: [
    "clean editorial composition with generous negative space",
    "premium minimal gradient background",
    "bright lifestyle-inspired context appropriate to the product",
    "bold but tasteful studio composition with the product dominant",
    "asymmetric advertising layout with a different camera angle",
    "natural real-world use context when appropriate",
    "close social-ad crop emphasizing the product",
    "wide social composition with intentional negative space",
    "premium fashion/editorial treatment when suitable to the category",
    "strongest believable social advertising scenario for the product",
  ],
};

const NEGATIVE_PROMPT =
  "duplicate product, extra product, deformed product, melted product, altered geometry, wrong colors, text, captions, watermark, invented logo, invented label, blurry, low quality";

export async function buildHordeSubmission(args: {
  sourceImage: File;
  mode: ImageJobMode;
  prompt: string;
  count: number;
  providerConfig?: ProviderConfig;
}) {
  const apiKey = args.providerConfig?.apiKey?.trim() || ANONYMOUS_KEY;
  const model = args.providerConfig?.model?.trim() || DEFAULT_MODEL;
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
    "The source contains a physical product. Preserve the exact source product as the single hero subject.",
    "Photorealistic, clean, realistic materials, accurate colors, accurate proportions, premium e-commerce photography.",
    "Do not invent product features, labels, logos, text or people.",
  ].join(" ");

  const variants = Array.from({ length: args.count }, (_, i) =>
    `${positive} Variation ${i + 1}: ${VARIANTS[args.mode]?.[i % (VARIANTS[args.mode]?.length || 1)] || VARIANTS.hero[i % VARIANTS.hero.length]}. ### ${NEGATIVE_PROMPT}`
  );

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
  const apiKey = apiKeyInput?.trim() || ANONYMOUS_KEY;
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
