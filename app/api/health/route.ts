import { NextResponse } from "next/server";
import { configuredImageProviderId } from "@/lib/ai/provider";

export async function GET() {
  const imageProvider = configuredImageProviderId();
  return NextResponse.json({
    ok: true,
    service: "agt-product-ai",
    version: "0.2.0",
    providers: {
      image: imageProvider,
      background: process.env.BACKGROUND_PROVIDER || "not-configured",
      video: process.env.VIDEO_PROVIDER || "planned",
    },
  });
}
