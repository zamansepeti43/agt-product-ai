import type { GeneratedAsset, ImageProvider } from "../types";

const BASE_URL = "https://gen.pollinations.ai/v1/images/edits";
const DEFAULT_MODEL = "qwen-image-3";

export class PollinationsImageProvider implements ImageProvider {
  readonly id = "pollinations";

  async generate(input: any): Promise<GeneratedAsset[]> {
    const apiKey = input.providerConfig?.apiKey?.trim() || process.env.POLLINATIONS_API_KEY?.trim();
    if (!apiKey) throw new Error("Pollinations API Key gerekli. Hızlı üretim için ücretsiz/kişisel Pollen anahtarını bağla.");

    const model = input.providerConfig?.model?.trim() || process.env.POLLINATIONS_MODEL?.trim() || DEFAULT_MODEL;
    const count = Math.min(4, Math.max(1, input.count || 1));
    const width = Math.min(1024, Math.max(512, input.width || 1024));
    const height = Math.min(1536, Math.max(512, input.height || 1024));

    const prompt = [
      input.prompt || "Create a professional commercial product photograph.",
      "Preserve the exact source product identity, geometry, proportions, materials, colors and visible details.",
      "Do not redesign or replace the product.",
      "Photorealistic premium e-commerce photography.",
      "No people, hands, faces, bodies or human skin.",
      "No invented text, logos, labels or watermarks.",
    ].join(" ");

    const assets: GeneratedAsset[] = [];
    for (let i = 0; i < count; i += 1) {
      const form = new FormData();
      form.append("model", model);
      form.append("prompt", `${prompt} Variation ${i + 1}. Create a clean professional sales scene with the product as the only hero subject.`);
      form.append("size", `${width}x${height}`);
      form.append("n", "1");
      form.append("image", new Blob([await input.sourceImage.arrayBuffer()], { type: input.mimeType || "image/jpeg" }), input.fileName || "product.jpg");

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
        signal: AbortSignal.timeout(120_000),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error?.message || data?.error || `Pollinations isteği başarısız (${response.status}).`);
      }

      const item = data?.data?.[0];
      if (!item?.b64_json && !item?.url) throw new Error("Pollinations görsel döndürmedi.");

      assets.push({
        id: `pollinations-${Date.now()}-${i}`,
        url: item.b64_json ? `data:image/png;base64,${item.b64_json}` : String(item.url),
        mode: input.mode,
        width,
        height,
      });
    }
    return assets;
  }
}
