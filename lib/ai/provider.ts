import { ComfyUIProvider } from "./providers/comfyui";
import { GeminiProvider } from "./providers/gemini";
import type { ImageProvider } from "./types";

const providers: Record<string, ImageProvider> = {
  comfyui: new ComfyUIProvider(),
  gemini: new GeminiProvider(),
};

export function getImageProvider(id?: string): ImageProvider | null {
  const providerId = (id || process.env.IMAGE_PROVIDER || "").trim().toLowerCase();
  return providerId ? providers[providerId] ?? null : null;
}

export function configuredImageProviderId() {
  return (process.env.IMAGE_PROVIDER || "not-configured").trim().toLowerCase();
}

export function availableImageProviders() {
  return Object.keys(providers);
}
