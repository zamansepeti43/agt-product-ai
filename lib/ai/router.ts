import type { GeneratedAsset, ImageProvider, ProductImageInput, ProviderConfig } from "./types";

export type ProviderConfigMap = Record<string, ProviderConfig>;

export interface ProviderCandidate {
  id: string;
  provider: ImageProvider;
  config?: ProviderConfig;
}

export function looksLikeQuotaOrRateLimitError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return /429|resource_exhausted|quota|rate limit|rate_limit|too many requests|limit:\s*0|insufficient|yapılandırılmamış|not configured|not-configured|fetch failed|econnrefused|timed? ?out|timeout|kuyruk|yüksek yük|restricted/i.test(message);
}

export async function generateWithFallback(candidates: ProviderCandidate[], input: ProductImageInput): Promise<{ assets: GeneratedAsset[]; providerId: string; skipped: string[] }> {
  const skipped: string[] = [];
  let lastError: unknown = null;
  for (const candidate of candidates) {
    try {
      const assets = await candidate.provider.generate({ ...input, providerConfig: candidate.config });
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

export function buildAutoFreeCandidates(providers: Record<string, ImageProvider>, configs: ProviderConfigMap) {
  // Only genuinely free/self-hosted providers belong in this pool.
  // Gemini image models are intentionally excluded because their current API image tier is paid-only.
  // AI Horde is included only when a registered key is configured; anonymous image-to-image requests can be shared by the service.
  const preferredOrder = ["comfyui", "aihorde"];
  return preferredOrder
    .filter((id) => {
      if (!providers[id]) return false;
      if (id === "aihorde") return Boolean(configs[id]?.apiKey?.trim() || process.env.AIHORDE_API_KEY?.trim());
      return true;
    })
    .map((id) => ({ id, provider: providers[id], config: configs[id] }));
}
