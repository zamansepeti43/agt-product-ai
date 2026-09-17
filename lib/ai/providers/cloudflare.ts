import type { GeneratedAsset, ImageProvider, ProductImageInput } from "../types";

const API = "https://api.cloudflare.com/client/v4/accounts";
const DEFAULT_MODEL = "@cf/runwayml/stable-diffusion-v1-5-img2img";
const MAX_OUTPUT_BYTES = 12 * 1024 * 1024;

function responseImage(payload: unknown): string {
  const result = (payload as { result?: unknown })?.result;
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    const image = (result as { image?: unknown }).image;
    if (typeof image === "string") return image;
  }
  return "";
}

export class CloudflareImageProvider implements ImageProvider {
  readonly id = "cloudflare";

  async generate(input: ProductImageInput): Promise<GeneratedAsset[]> {
    const accountId = input.providerConfig?.accountId?.trim() || process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
    const token = input.providerConfig?.apiKey?.trim() || process.env.CLOUDFLARE_API_TOKEN?.trim();
    const model = input.providerConfig?.model?.trim() || process.env.CLOUDFLARE_IMAGE_MODEL?.trim() || DEFAULT_MODEL;
    if (!accountId || !token) throw new Error("Cloudflare Workers AI için Account ID ve API Token gerekli.");

    const width = Math.min(2048, Math.max(256, input.width || 1024));
    const height = Math.min(2048, Math.max(256, input.height || 1024));
    const count = Math.min(4, Math.max(1, input.count || 1));
    const prompt = input.prompt || "Create a professional commercial product image. Preserve the product identity, proportions, branding and important details.";
    const source = Buffer.from(await input.sourceImage.arrayBuffer()).toString("base64");
    const images: GeneratedAsset[] = [];

    for (let i = 0; i < count; i++) {
      const response = await fetch(`${API}/${encodeURIComponent(accountId)}/ai/run/${encodeURIComponent(model)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, width, height, image_b64: source, strength: 0.55, guidance: 7.5, num_steps: 20 }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = payload && typeof payload === "object" && "errors" in payload ? JSON.stringify((payload as { errors?: unknown }).errors) : "";
        throw new Error(`Cloudflare AI ${response.status}: ${error.slice(0, 1000) || response.statusText}`);
      }
      const base64 = responseImage(payload);
      if (!base64) throw new Error("Cloudflare AI görsel döndürmedi.");
      if (base64.length * 0.75 > MAX_OUTPUT_BYTES) throw new Error("Cloudflare AI görsel yanıtı çok büyük.");
      images.push({ id: `cloudflare-${Date.now()}-${i + 1}`, url: `data:image/png;base64,${base64}`, mode: input.mode, width, height });
    }
    return images;
  }
}
