import { NextResponse } from "next/server";
import { configuredImageProviderId, getImageProvider } from "@/lib/ai/provider";

export const runtime = "nodejs";

export async function GET() {
  const providerId = configuredImageProviderId();
  const provider = getImageProvider();
  const workflowConfigured = Boolean(process.env.COMFYUI_WORKFLOW_JSON);

  return NextResponse.json({
    ok: true,
    service: "agt-product-ai",
    version: "0.3.0",
    providers: {
      image: provider ? provider.id : providerId,
      imageReady: Boolean(provider && (provider.id !== "comfyui" || workflowConfigured)),
      background: process.env.BACKGROUND_PROVIDER || "not-configured",
      video: "planned",
    },
    config: {
      comfyui: providerId === "comfyui" ? {
        baseUrlConfigured: Boolean(process.env.COMFYUI_BASE_URL),
        workflowConfigured,
      } : null,
    },
  });
}
