import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const providers = [
  { id: "auto-free", name: "Ücretsiz otomatik", kind: "router", free: true, imageEdit: true, auth: "provider-config", note: "ComfyUI → AI Horde fallback" },
  { id: "comfyui", name: "ComfyUI / Qwen", kind: "local", free: true, imageEdit: true, auth: "local", note: "Kendi bilgisayarında veya sunucunda" },
  { id: "aihorde", name: "AI Horde", kind: "community", free: true, imageEdit: true, auth: "free-key", note: "Topluluk GPU ağı; kuyruk süresi değişebilir" },
  { id: "cloudflare", name: "Cloudflare Workers AI", kind: "cloud", free: false, imageEdit: false, auth: "account-token", note: "Hesap ve token gerekir; kullanım koşullarını kontrol et" },
  { id: "gemini", name: "Google Gemini", kind: "cloud", free: false, imageEdit: true, auth: "api-key", note: "Görüntü üretim/düzenleme" },
  { id: "custom-openai", name: "Özel OpenAI uyumlu API", kind: "custom", free: false, imageEdit: true, auth: "custom", note: "Base URL + model + API key ile bağlanır" },
];

export async function GET() {
  return NextResponse.json({
    providers,
    customApi: {
      protocol: "OpenAI-compatible",
      generationPath: "/images/generations",
      editPath: "/images/edits",
      response: "data[].b64_json veya data[].url",
      fields: ["baseUrl", "apiKey", "model"],
    },
    apiFinder: {
      enabled: true,
      source: "GitHub provider research + curated adapters",
      message: "Kullanıcı kendi API'sini bağlayabilir; yeni sağlayıcılar adapter ile eklenebilir.",
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
