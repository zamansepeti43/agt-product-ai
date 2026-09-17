import { ComfyUIProvider } from "./providers/comfyui";
import type { ImageProvider } from "./types";

const providers: Record<string, ImageProvider> = {
  comfyui: new ComfyUIProvider(),
};

export function getImageProvider(): ImageProvider | null {
  const id = (process.env.IMAGE_PROVIDER || "").trim().toLowerCase();
  return id ? providers[id] ?? null : null;
}

export function configuredImageProviderId() {
  return (process.env.IMAGE_PROVIDER || "not-configured").trim().toLowerCase();
}
