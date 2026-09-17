import type { GeneratedAsset, ImageProvider, ProductImageInput } from "../types";

const API = "https://api.cloudflare.com/client/v4/accounts";
const DEFAULT_MODEL = "@cf/black-forest-labs/flux-1-schnell";

export class CloudflareImageProvider implements ImageProvider {
  readonly id = "cloudflare";

  async generate(input: ProductImageInput): Promise<GeneratedAsset[]> {
    const accountId = input.providerConfig?.accountId?.trim() || process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
    const token = input.providerConfig?.apiKey?.trim() || process.env.CLOUDFLARE_API_TOKEN?.trim();
    const model = input.providerConfig?.model?.trim() || process.env.CLOUDFLARE_IMAGE_MODEL?.trim() || DEFAULT_MODEL;
    if (!accountId || !token) throw new Error("Cloudflare Workers AI için Account ID ve API Token gerekli.");

    const width = input.width || 1024;
    const height = input.height || 1024;
    const count = Math.min(4, Math.max(1, input.count || 1));
    const prompt = input.prompt || "Create a professional commercial product image. Preserve the product identity, proportions, branding and important details.";
    const images: GeneratedAsset[] = [];

    for (let i = 0; i < count; i++) {
      const response = await fetch(`${API}/${encodeURIComponent(accountId)}/ai/run/${model}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, width, height }),
      });
      if (!response.ok) {
        const error = await response.text().catch(() => "");
        throw new Error(`Cloudflare AI ${response.status}: ${error.slice(0, 1000) || response.statusText}`);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length) throw new Error("Cloudflare AI boş görsel döndürdü.");
      images.push({ id: `cloudflare-${Date.now()}-${i + 1}`, url: `data:image/png;base64,${bytes.toString("base64")}`, mode: input.mode, width, height });
    }
    return images;
  }
}
