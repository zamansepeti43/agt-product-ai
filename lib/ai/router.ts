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
  // ComfyUI is used first when configured. AI Horde is always available as the
  // no-key community fallback; a registered key can still be supplied for better
  // queue priority/rate limits according to AI Horde service policy.
  const preferredOrder = ["comfyui", "aihorde"];
  return preferredOrder
    .filter((id) => {
      if (!providers[id]) return false;
      if (id === "comfyui") {
        return Boolean(
          configs[id]?.baseUrl?.trim() ||
          configs[id]?.model?.trim() ||
          process.env.COMFYUI_BASE_URL?.trim() ||
          process.env.COMFYUI_WORKFLOW_JSON?.trim(),
        );
      }
      if (id === "aihorde") return true;
      return true;
    })
    .map((id) => ({ id, provider: providers[id], config: configs[id] }));
}
