import type { GeneratedAsset, ImageProvider } from "../types";

const BASE_URL = "https://gen.pollinations.ai/v1/images/edits";
const DEFAULT_MODEL = "qwen-image-3";

export class PollinationsImageProvider implements ImageProvider {
  readonly id = "pollinations";

  async generate(input: any): Promise<GeneratedAsset[]> {
    const apiKey = input.providerConfig?.apiKey?.trim() || "";
    if (!apiKey) throw new Error("Pollinations API Key gerekli. Hızlı üretim için API anahtarını bağla.");

    const model = input.providerConfig?.model?.trim() || process.env.POLLINATIONS_MODEL?.trim() || DEFAULT_MODEL;
    const count = Math.min(4, Math.max(1, input.count || 1));
    const width = Math.min(1024, Math.max(512, input.width || 1024));
    const height = Math.min(1536, Math.max(512, input.height || 1024));

    const prompt = [
      input.prompt || "Create a professional commercial product photograph.",
      "Preserve the exact source product identity, geometry, proportions, materials, colors and visible details.",
      "Do not redesign or replace the product.",
      "Photorealistic premium e-commerce photography.",
      "Do not add people unless the product category naturally calls for a user context; when people are appropriate, keep them realistic and secondary to the product.",
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

      let imageUrl = "";
      if (item.b64_json) {
        imageUrl = `data:image/png;base64,${item.b64_json}`;
      } else {
        const rawUrl = String(item.url || "");
        let parsed: URL;
        try { parsed = new URL(rawUrl); } catch { throw new Error("Pollinations geçerli bir görsel URL'si döndürmedi."); }
        if (parsed.protocol !== "https:" || !(parsed.hostname === "pollinations.ai" || parsed.hostname.endsWith(".pollinations.ai"))) {
          throw new Error("Pollinations görsel bağlantısı güvenli bir Pollinations adresi olmalı.");
        }
        const imageResponse = await fetch(parsed, { redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(30_000) });
        if (imageResponse.status >= 300 && imageResponse.status < 400) throw new Error("Pollinations görsel bağlantısı redirect ediyor.");
        if (!imageResponse.ok) throw new Error(`Pollinations görseli alınamadı (${imageResponse.status}).`);
        const contentType = (imageResponse.headers.get("content-type") || "").split(";")[0].toLowerCase();
        if (!["image/png","image/jpeg","image/webp"].includes(contentType)) throw new Error("Pollinations geçerli bir görsel döndürmedi.");
        const bytes = await imageResponse.arrayBuffer();
        if (!bytes.byteLength || bytes.byteLength > 12 * 1024 * 1024) throw new Error("Pollinations görseli 12 MB sınırını aşıyor.");
        imageUrl = `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;
      }
      assets.push({
        id: `pollinations-${Date.now()}-${i}`,
        url: imageUrl,
        mode: input.mode,
        width,
        height,
      });
    }
    return assets;
  }
}
