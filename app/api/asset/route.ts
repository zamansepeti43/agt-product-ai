import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function allowedOrigin() {
  const raw = process.env.COMFYUI_BASE_URL?.trim();
  if (!raw) return null;
  try { return new URL(raw).origin; } catch { return null; }
}

export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get("url");
    const origin = allowedOrigin();
    if (!raw || !origin) return NextResponse.json({ error: "ComfyUI bağlantısı yapılandırılmamış." }, { status: 400 });

    const target = new URL(raw);
    if ((target.protocol !== "http:" && target.protocol !== "https:") || target.origin !== origin || target.pathname !== "/view") {
      return NextResponse.json({ error: "Yalnızca bağlı ComfyUI çıktıları gösterilebilir." }, { status: 403 });
    }

    const response = await fetch(target, { cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: `Görsel alınamadı (${response.status}).` }, { status: response.status });

    const contentType = response.headers.get("content-type")?.split(";")[0].toLowerCase() || "";
    if (!IMAGE_TYPES.has(contentType)) return NextResponse.json({ error: "Provider geçerli bir görsel döndürmedi." }, { status: 415 });

    const length = Number(response.headers.get("content-length") || 0);
    if (length > MAX_BYTES) return NextResponse.json({ error: "Görsel 12 MB sınırını aşıyor." }, { status: 413 });
    const data = await response.arrayBuffer();
    if (data.byteLength > MAX_BYTES) return NextResponse.json({ error: "Görsel 12 MB sınırını aşıyor." }, { status: 413 });

    return new NextResponse(data, { status: 200, headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Görsel alınamadı." }, { status: 500 });
  }
}
