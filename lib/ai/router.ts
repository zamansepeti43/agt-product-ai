import type { GeneratedAsset, ImageProvider, ProductImageInput, ProviderConfig } from "./types";

export type ProviderConfigMap = Record<string, ProviderConfig>;

export interface ProviderCandidate {
  id: string;
  provider: ImageProvider;
  config?: ProviderConfig;
}

export function looksLikeQuotaOrRateLimitError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return /429|resource_exhausted|quota|rate limit|rate_limit|too many requests|limit:\s*0|insufficient/i.test(message);
}

export async function generateWithFallback(
  candidates: ProviderCandidate[],
  input: ProductImageInput,
): Promise<{ assets: GeneratedAsset[]; providerId: string; skipped: string[] }> {
  const skipped: string[] = [];
  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const assets = await candidate.provider.generate({
        ...input,
        providerConfig: candidate.config,
      });
      return { assets, providerId: candidate.id, skipped };
    } catch (error) {
      lastError = error;
      if (!looksLikeQuotaOrRateLimitError(error)) throw error;
      skipped.push(candidate.id);
    }
  }

  throw lastError instanceof Error
    ? new Error(`Ücretsiz/otomatik AI motorlarının tamamı kullanılamıyor. Son hata: ${lastError.message}`)
    : new Error("Kullanılabilir AI motoru kalmadı.");
}

export function buildAutoFreeCandidates(
  providers: Record<string, ImageProvider>,
  configs: ProviderConfigMap,
) {
  const preferredOrder = ["comfyui", "pollinations", "gemini", "openai"];
  return preferredOrder
    .filter((id) => providers[id])
    .map((id) => ({ id, provider: providers[id], config: configs[id] }));
}
