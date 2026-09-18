import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { GeneratedAsset, ImageProvider, ProductImageInput } from "../types";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const MAX_RESPONSE_BYTES = 25 * 1024 * 1024;
const BLOCKED_HOSTS = new Set(["localhost", "localhost.localdomain", "ip6-localhost", "ip6-loopback"]);

function cleanBaseUrl(value?: string) {
  const raw = (value || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw new Error("AI API Base URL geçerli bir URL olmalı."); }
  if (parsed.protocol !== "https:") throw new Error("AI API Base URL yalnızca HTTPS olmalı.");
  if (parsed.username || parsed.password) throw new Error("AI API Base URL kullanıcı adı/şifre içeremez.");
  return parsed.toString().replace(/\/+$/, "");
}

function isPrivateIpv4(ip: string) {
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 0;
}

function isPrivateIpv6(ip: string) {
  const normalized = ip.toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
}

async function assertSafeRemoteUrl(rawUrl: string, allowedHost?: string) {
  let url: URL;
  try { url = new URL(rawUrl); } catch { throw new Error("AI API URL geçerli değil."); }
  if (url.protocol !== "https:") throw new Error("AI API bağlantısı yalnızca HTTPS destekliyor.");
  if (url.username || url.password) throw new Error("AI API URL kullanıcı adı/şifre içeremez.");
  if (allowedHost && url.hostname.toLowerCase() !== allowedHost.toLowerCase()) throw new Error("AI API görsel URL'si yapılandırılan sunucuyla eşleşmiyor.");
  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(hostname) || hostname.endsWith(".localhost") || hostname.endsWith(".local")) throw new Error("Yerel/private AI API adreslerine izin verilmiyor.");
  if (isIP(hostname)) {
    if (isIP(hostname) === 4 && isPrivateIpv4(hostname)) throw new Error("Private IPv4 adreslerine izin verilmiyor.");
    if (isIP(hostname) === 6 && isPrivateIpv6(hostname)) throw new Error("Private IPv6 adreslerine izin verilmiyor.");
    return url;
  }
  const addresses = await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(({ address, family }) => family === 4 ? isPrivateIpv4(address) : isPrivateIpv6(address))) throw new Error("AI API hostu private bir IP'ye çözülüyor; bağlantı engellendi.");
  return url;
}

function dataUrlFromBase64(value: string, mime = "image/png") {
  return value.startsWith("data:image/") ? value : `data:${mime};base64,${value}`;
}

async function readJson(response: Response) {
  const text = await response.text();
  try { return JSON.parse(text); } catch { return { raw: text.slice(0, 2000) }; }
}

async function fetchRemoteImageAsDataUrl(rawUrl: string, allowedHost: string) {
  const url = await assertSafeRemoteUrl(rawUrl, allowedHost);
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
  if (response.status >= 300 && response.status < 400) throw new Error("AI API görsel URL'si redirect ediyor; güvenlik nedeniyle engellendi.");
  if (!response.ok) throw new Error(`AI API görseli alınamadı (${response.status}).`);
  const contentType = (response.headers.get("content-type") || "").split(";", 1)[0].toLowerCase();
  if (!contentType.startsWith("image/")) throw new Error("AI API görsel URL'si image/* içerik döndürmedi.");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_RESPONSE_BYTES) throw new Error("AI API görsel yanıtı çok büyük.");
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

export class OpenAICompatibleImageProvider implements ImageProvider {
  readonly id = "custom-openai";

  async generate(input: ProductImageInput): Promise<GeneratedAsset[]> {
    const baseUrl = cleanBaseUrl(input.providerConfig?.baseUrl || process.env.CUSTOM_AI_BASE_URL);
    const baseUrlObject = await assertSafeRemoteUrl(baseUrl);
    const apiKey = input.providerConfig?.apiKey?.trim() || "";
    const model = input.providerConfig?.model?.trim() || process.env.CUSTOM_AI_MODEL?.trim();
    if (!model) throw new Error("Özel API için model adı gerekli.");

    const count = Math.min(4, Math.max(1, input.count || 1));
    const prompt = input.prompt || "Create a professional commercial product image from this product photo. Preserve product identity, proportions, branding, colors and important details.";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    const hasSourceImage = Boolean(input.sourceImage && input.mimeType);
    const endpoint = hasSourceImage ? `${baseUrl}/images/edits` : `${baseUrl}/images/generations`;
    let response: Response;

    if (hasSourceImage) {
      const form = new FormData();
      form.append("model", model);
      form.append("prompt", prompt);
      form.append("n", String(count));
      form.append("size", `${input.width || 1024}x${input.height || 1024}`);
      form.append("response_format", "b64_json");
      form.append("image", new File([await input.sourceImage.arrayBuffer()], input.fileName || "product.png", { type: input.mimeType || "image/png" }));
      response = await fetch(endpoint, { method: "POST", headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}, body: form, redirect: "manual", signal: AbortSignal.timeout(120_000) });
    } else {
      response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ model, prompt, n: count, size: `${input.width || 1024}x${input.height || 1024}`, response_format: "b64_json" }), redirect: "manual", signal: AbortSignal.timeout(120_000) });
    }

    if (response.status >= 300 && response.status < 400) throw new Error("AI API redirect ediyor; güvenlik nedeniyle engellendi.");
    if (!response.ok) {
      const error = await readJson(response) as any;
      throw new Error(`Özel AI API ${response.status}: ${error?.error?.message || error?.message || response.statusText}`);
    }

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > MAX_RESPONSE_BYTES) throw new Error("Özel AI API yanıtı çok büyük.");
    const data = await readJson(response) as any;
    const items = Array.isArray(data?.data) ? data.data : [];
    const assets: GeneratedAsset[] = [];
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const raw = typeof item?.b64_json === "string" ? item.b64_json : typeof item?.url === "string" ? item.url : "";
      if (!raw) continue;
      const url = raw.startsWith("data:image/") ? raw : raw.startsWith("http") ? await fetchRemoteImageAsDataUrl(raw, baseUrlObject.hostname) : dataUrlFromBase64(raw, item?.mime_type || "image/png");
      assets.push({ id: `custom-ai-${Date.now()}-${index + 1}`, url, mode: input.mode, width: input.width || 1024, height: input.height || 1024 });
    }

    if (!assets.length) throw new Error("Özel AI API görsel döndürmedi. API'nin /images/generations veya /images/edits OpenAI uyumlu yanıt verdiğini kontrol et.");
    return assets;
  }
}
