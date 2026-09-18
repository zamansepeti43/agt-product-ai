import type { GeneratedAsset, ProductImageInput } from "../types";

const DEFAULT_MODEL = "gemini-3.1-flash-image";
const API_URL = "https://generativelanguage.googleapis.com/v1/models";

function imageSizeFor(input: ProductImageInput) {
  return input.width && input.width >= 2048 ? "2K" : "1K";
}

function aspectRatioFor(input: ProductImageInput) {
  if (input.mode === "social") return "9:16";
  if (input.mode === "studio" || input.mode === "lifestyle") return "4:5";
  if (input.mode === "detail") return "4:3";
  return "1:1";
}

function extractImages(payload: unknown) {
  const images: Array<{ data: string; mimeType: string }> = [];
  const candidates = (payload as { candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }> }).candidates ?? [];
  for (const candidate of candidates) {
    for (const part of candidate.content?.parts ?? []) {
      const data = part.inlineData?.data;
      if (data) images.push({ data, mimeType: part.inlineData?.mimeType || "image/png" });
    }
  }
  return images;
}

export class GeminiProvider {
  readonly id = "gemini";

  async generate(input: ProductImageInput): Promise<GeneratedAsset[]> {
    const apiKey = input.providerConfig?.apiKey?.trim();
    if (!apiKey) throw new Error("Gemini API anahtarı gerekli. AI Motorları bölümünden anahtarını bağla.");

    const model = input.providerConfig?.model || process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const sourceData = Buffer.from(await input.sourceImage.arrayBuffer()).toString("base64");
    const mimeType = input.mimeType || "image/png";
    const results: GeneratedAsset[] = [];

    for (let index = 0; index < (input.count || 1); index += 1) {
      const response = await fetch(`${API_URL}/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { inlineData: { mimeType, data: sourceData } },
              { text: `${input.prompt}\n\nPreserve the exact product identity, geometry, proportions, materials, colors, logos and important details from the reference image. Do not invent or remove product features. Create a commercial e-commerce image suitable for a professional product listing.` },
            ],
          }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            responseFormat: {
              image: {
                aspectRatio: aspectRatioFor(input),
                imageSize: imageSizeFor(input),
              },
            },
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof payload?.error?.message === "string" ? payload.error.message : `Gemini API hatası (${response.status}).`;
        throw new Error(message);
      }

      const image = extractImages(payload)[0];
      if (!image) throw new Error("Gemini yanıtında oluşturulan görsel bulunamadı.");
      results.push({
        id: `gemini-${Date.now()}-${index}`,
        url: `data:${image.mimeType};base64,${image.data}`,
        mode: input.mode,
        width: input.width || 1024,
        height: input.height || 1024,
      });
    }

    return results;
  }
}
