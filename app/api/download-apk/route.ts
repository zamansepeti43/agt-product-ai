import { NextResponse } from "next/server";

const APK_URL =
  "https://github.com/zamansepeti43/agt-product-ai/releases/download/apk-test-35/app-debug.apk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const upstream = await fetch(APK_URL, {
    cache: "no-store",
    redirect: "follow",
    headers: {
      "User-Agent": "AGT-Product-AI-APK-Downloader",
      "Accept": "application/vnd.android.package-archive,application/octet-stream,*/*",
    },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "APK indirilemedi", status: upstream.status },
      { status: 502 }
    );
  }

  const bytes = await upstream.arrayBuffer();

  const headers = new Headers();
  headers.set("Content-Type", "application/vnd.android.package-archive");
  headers.set("Content-Length", String(bytes.byteLength));
  headers.set("Content-Disposition", 'attachment; filename="AGT-Product-AI.apk"');
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Accept-Ranges", "bytes");

  return new Response(bytes, { status: 200, headers });
}
