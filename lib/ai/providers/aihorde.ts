import type { GeneratedAsset, ImageProvider, ProductImageInput } from "../types";

const BASE_URL = "https://aihorde.net/api/v2/generate";
const ANONYMOUS_KEY = "0000000000";
const DEFAULT_MODEL = "AlbedoBase XL (SDXL)";
const MAX_WAIT_MS = 180_000;

function toDataUrl(bytes: ArrayBuffer, mimeType: string) {
  return `data:${mimeType || "image/png"};base64,${Buffer.from(bytes).toString("base64")}`;
}

function errorMessage(data: any, fallback: string) {
  return data?.message || data?.rc || data?.error || fallback;
}

export class AIHordeProvider implements ImageProvider {
  readonly id = "aihorde";

  async generate(input: ProductImageInput): Promise<GeneratedAsset[]> {
    const apiKey = input.providerConfig?.apiKey?.trim() || process.env.AIHORDE_API_KEY?.trim();
    if (!apiKey) throw new Error("AI Horde için ücretsiz API anahtarını bağlaman gerekiyor.");

    const model = input.providerConfig?.model?.trim() || process.env.AIHORDE_MODEL?.trim() || DEFAULT_MODEL;
    const width = Math.min(1024, Math.max(512, input.width || 1024));
    const height = Math.min(1024, Math.max(512, input.height || 1024));
    const count = Math.min(4, Math.max(1, input.count || 1));
    const source = toDataUrl(await input.sourceImage.arrayBuffer(), input.mimeType || "image/png");
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
        params: {
          width,
          height,
          steps: 25,
          n: count,
          cfg_scale: 6,
          sampler_name: "k_euler_a",
        },
        nsfw: false,
        censor_nsfw: true,
        r2: true,
        shared: false,
        replacement_filter: true,
        allow_downgrade: true,
      }),
    });
    const submitted = await response.json().catch(() => ({}));
    if (!response.ok || !submitted.id) throw new Error(errorMessage(submitted, `AI Horde isteği başarısız (${response.status}).`));

    const started = Date.now();
    while (Date.now() - started < MAX_WAIT_MS) {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      const checkResponse = await fetch(`${BASE_URL}/check/${encodeURIComponent(submitted.id)}`, { headers: { apikey: apiKey } });
      const check = await checkResponse.json().catch(() => ({}));
      if (!checkResponse.ok) throw new Error(errorMessage(check, `AI Horde durum sorgusu başarısız (${checkResponse.status}).`));
      if (check.faulted) throw new Error(check.message || "AI Horde üretimi başarısız oldu.");
      if (!check.done) continue;

      const statusResponse = await fetch(`${BASE_URL}/status/${encodeURIComponent(submitted.id)}`, { headers: { apikey: apiKey } });
      const status = await statusResponse.json().catch(() => ({}));
      if (!statusResponse.ok) throw new Error(errorMessage(status, `AI Horde sonuç sorgusu başarısız (${statusResponse.status}).`));

      const generations = Array.isArray(status.generations) ? status.generations : [];
      const assets = generations.map((generation: any, index: number) => {
        const raw = String(generation?.img || "");
        const url = raw.startsWith("data:image/") ? raw : raw;
        return {
          id: `aihorde-${submitted.id}-${index + 1}`,
          url,
          mode: input.mode,
          width,
          height,
        } satisfies GeneratedAsset;
      }).filter((asset: GeneratedAsset) => Boolean(asset.url));

      if (!assets.length) throw new Error("AI Horde üretimi tamamlandı fakat görsel döndürmedi.");
      return assets;
    }

    throw new Error("AI Horde kuyruğu zaman aşımına uğradı.");
  }
}
