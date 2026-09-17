import type { GeneratedAsset, ImageProvider, ProductImageInput } from "../types";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const MAX_RESPONSE_BYTES = 25 * 1024 * 1024;

function cleanBaseUrl(value?: string) {
  return (value || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
}

function dataUrlFromBase64(value: string, mime = "image/png") {
  return value.startsWith("data:image/") ? value : `data:${mime};base64,${value}`;
}

async function readJson(response: Response) {
  const text = await response.text();
  try { return JSON.parse(text); } catch { return { raw: text.slice(0, 2000) }; }
}

export class OpenAICompatibleImageProvider implements ImageProvider {
  readonly id = "custom-openai";

  async generate(input: ProductImageInput): Promise<GeneratedAsset[]> {
    const baseUrl = cleanBaseUrl(input.providerConfig?.baseUrl || process.env.CUSTOM_AI_BASE_URL);
    const apiKey = input.providerConfig?.apiKey?.trim() || process.env.CUSTOM_AI_API_KEY?.trim() || "";
    const model = input.providerConfig?.model?.trim() || process.env.CUSTOM_AI_MODEL?.trim();
    if (!model) throw new Error("Özel API için model adı gerekli.");

    const count = Math.min(4, Math.max(1, input.count || 1));
    const prompt = input.prompt || "Create a professional commercial product image from this product photo. Preserve product identity, proportions, branding, colors and important details.";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    const hasSourceImage = Boolean(input.sourceImage && input.mimeType);
    const endpoint = hasSourceImage ? `${baseUrl}/images/edits` : `${baseUrl}/images/generations`;
    let response: Response;

    if (hasSourceImage) {
      const form = new FormData();
      form.append("model", model);
      form.append("prompt", prompt);
      form.append("n", String(count));
      form.append("size", `${input.width || 1024}x${input.height || 1024}`);
      form.append("response_format", "b64_json");
      form.append("image", new File([await input.sourceImage.arrayBuffer()], input.fileName || "product.png", { type: input.mimeType || "image/png" }));
      response = await fetch(endpoint, { method: "POST", headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}, body: form });
    } else {
      response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ model, prompt, n: count, size: `${input.width || 1024}x${input.height || 1024}`, response_format: "b64_json" }) });
    }

    if (!response.ok) {
      const error = await readJson(response) as any;
      throw new Error(`Özel AI API ${response.status}: ${error?.error?.message || error?.message || response.statusText}`);
    }

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > MAX_RESPONSE_BYTES) throw new Error("Özel AI API yanıtı çok büyük.");
    const data = await readJson(response) as any;
    const items = Array.isArray(data?.data) ? data.data : [];
    const assets = items.map((item: any, index: number) => {
      const raw = typeof item?.b64_json === "string" ? item.b64_json : typeof item?.url === "string" ? item.url : "";
      const url = raw.startsWith("http") ? raw : dataUrlFromBase64(raw, item?.mime_type || "image/png");
      return { id: `custom-ai-${Date.now()}-${index + 1}`, url, mode: input.mode, width: input.width || 1024, height: input.height || 1024 } satisfies GeneratedAsset;
    }).filter((asset: GeneratedAsset) => Boolean(asset.url));

    if (!assets.length) throw new Error("Özel AI API görsel döndürmedi. API'nin /images/generations veya /images/edits OpenAI uyumlu yanıt verdiğini kontrol et.");
    return assets;
  }
}
