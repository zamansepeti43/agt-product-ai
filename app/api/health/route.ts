import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "agt-product-ai",
    version: "0.1.0",
    providers: {
      image: "not-configured",
      background: "not-configured",
      video: "planned",
    },
  });
}
