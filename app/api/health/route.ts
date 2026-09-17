import { NextResponse } from "next/server";
import { availableImageProviders, configuredImageProviderId, getImageProvider } from "@/lib/ai/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const providerId = configuredImageProviderId();
  const provider = getImageProvider();
  const workflowConfigured = Boolean(process.env.COMFYUI_WORKFLOW_JSON);
  const baseUrlConfigured = Boolean(process.env.COMFYUI_BASE_URL);
  const imageReady = Boolean(provider && (provider.id !== "comfyui" || workflowConfigured));
  return NextResponse.json({
    ok: true,
    service: "agt-product-ai",
    version: "0.5.1",
    modules: { imageGeneration: imageReady, batch: true, catalogSeo: true, zipExport: true, windows: "available", video: "planned" },
    providers: { image: provider ? provider.id : providerId, available: availableImageProviders(), imageReady, background: process.env.BACKGROUND_PROVIDER || "not-configured" },
    config: { comfyui: { baseUrlConfigured, workflowConfigured } },
  }, { headers: { "Cache-Control": "no-store" } });
}
