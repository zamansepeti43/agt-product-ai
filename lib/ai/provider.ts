import { AIHordeProvider } from "./providers/aihorde";
import { CloudflareImageProvider } from "./providers/cloudflare";
import { ComfyUIProvider } from "./providers/comfyui";
import { GeminiProvider } from "./providers/gemini";
import { OpenAICompatibleImageProvider } from "./providers/openai-compatible";
import { buildAutoFreeCandidates, generateWithFallback, type ProviderConfigMap } from "./router";
import type { ImageProvider, ProductImageInput } from "./types";

const providers: Record<string, ImageProvider> = {
  comfyui: new ComfyUIProvider(),
  aihorde: new AIHordeProvider(),
  cloudflare: new CloudflareImageProvider(),
  gemini: new GeminiProvider(),
  openai: new OpenAICompatibleImageProvider(),
  "custom-openai": new OpenAICompatibleImageProvider(),
};
export function getImageProvider(id?: string): ImageProvider | null { const providerId = (id || process.env.IMAGE_PROVIDER || "").trim().toLowerCase(); return providerId ? providers[providerId] ?? null : null; }
export function configuredImageProviderId() { return (process.env.IMAGE_PROVIDER || "not-configured").trim().toLowerCase(); }
export function availableImageProviders() { return Object.keys(providers); }
export function isAutoFreeProvider(id?: string) { return (id || process.env.IMAGE_PROVIDER || "").trim().toLowerCase() === "auto-free"; }
export async function generateWithConfiguredStrategy(providerId: string, input: ProductImageInput, configs: ProviderConfigMap = {}) {
  if (providerId === "auto-free") return generateWithFallback(buildAutoFreeCandidates(providers, configs), input);
  const provider = getImageProvider(providerId); if (!provider) throw new Error("Desteklenen bir AI provider seçilmedi.");
  return { assets: await provider.generate({ ...input, providerConfig: configs[providerId] || input.providerConfig }), providerId, skipped: [] };
}
