import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_ASSETS = 24;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

interface ZipAsset { url: string; id?: string; mode?: string; }

function getAllowedOrigin() {
  const raw = process.env.COMFYUI_BASE_URL?.trim();
  if (!raw) return null;
  try { return new URL(raw).origin; } catch { return null; }
}

function getDataUrl(rawUrl: string) {
  if (!rawUrl.startsWith("data:image/")) return null;
  const match = rawUrl.match(/^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) throw new Error("Geçersiz veri görseli.");
  const mime = match[1].toLowerCase();
  const extension = mime === "image/jpeg" || mime === "image/jpg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
  return { data: Uint8Array.from(Buffer.from(match[2], "base64")), extension };
}

function assertProviderAssetUrl(rawUrl: string) {
  const allowedOrigin = getAllowedOrigin();
  if (!allowedOrigin) throw new Error("COMFYUI_BASE_URL yapılandırılmamış.");
  const url = new URL(rawUrl);
  if ((url.protocol !== "http:" && url.protocol !== "https:") || url.origin !== allowedOrigin || url.pathname !== "/view") {
    throw new Error("Yalnızca bağlı ComfyUI çıktıları ZIP'e eklenebilir.");
  }
  return url;
}
function crc32(bytes: Uint8Array) { let crc = 0xffffffff; for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); } return (crc ^ 0xffffffff) >>> 0; }
function writeU16(view: DataView, offset: number, value: number) { view.setUint16(offset, value, true); }
function writeU32(view: DataView, offset: number, value: number) { view.setUint32(offset, value >>> 0, true); }
function makeZip(files: Array<{ name: string; data: Uint8Array }>) {
  const encoder = new TextEncoder(); const chunks: Uint8Array[] = []; const central: Uint8Array[] = []; let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name); const crc = crc32(file.data); const header = new Uint8Array(30 + name.length); const view = new DataView(header.buffer);
    writeU32(view, 0, 0x04034b50); writeU16(view, 4, 20); writeU16(view, 6, 0x0800); writeU16(view, 8, 0); writeU16(view, 10, 0); writeU16(view, 12, 0); writeU32(view, 14, crc); writeU32(view, 18, file.data.byteLength); writeU32(view, 22, file.data.byteLength); writeU16(view, 26, name.length); writeU16(view, 28, 0); header.set(name, 30); chunks.push(header, file.data);
    const record = new Uint8Array(46 + name.length); const rv = new DataView(record.buffer);
    writeU32(rv, 0, 0x02014b50); writeU16(rv, 4, 20); writeU16(rv, 6, 20); writeU16(rv, 8, 0x0800); writeU16(rv, 10, 0); writeU16(rv, 12, 0); writeU16(rv, 14, 0); writeU32(rv, 16, crc); writeU32(rv, 20, file.data.byteLength); writeU32(rv, 24, file.data.byteLength); writeU16(rv, 28, name.length); writeU16(rv, 30, 0); writeU16(rv, 32, 0); writeU16(rv, 34, 0); writeU16(rv, 36, 0); writeU32(rv, 38, 0); writeU32(rv, 42, offset); record.set(name, 46); central.push(record); offset += header.byteLength + file.data.byteLength;
  }
  const centralSize = central.reduce((sum, item) => sum + item.byteLength, 0); const end = new Uint8Array(22); const ev = new DataView(end.buffer);
  writeU32(ev, 0, 0x06054b50); writeU16(ev, 4, 0); writeU16(ev, 6, 0); writeU16(ev, 8, files.length); writeU16(ev, 10, files.length); writeU32(ev, 12, centralSize); writeU32(ev, 16, offset); writeU16(ev, 20, 0);
  const output = new Uint8Array(offset + centralSize + end.byteLength); let cursor = 0; for (const chunk of chunks) { output.set(chunk, cursor); cursor += chunk.byteLength; } for (const record of central) { output.set(record, cursor); cursor += record.byteLength; } output.set(end, cursor); return output;
}
function safeFileName(index: number, asset: ZipAsset, extension: string) { const mode = (asset.mode || "urun").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 32) || "urun"; return `AGT-${String(index + 1).padStart(2, "0")}-${mode}.${extension}`; }

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { assets?: ZipAsset[] }; const assets = Array.isArray(body.assets) ? body.assets.slice(0, MAX_ASSETS) : [];
    if (!assets.length) return NextResponse.json({ error: "ZIP için en az bir görsel gerekli." }, { status: 400 });
    const files: Array<{ name: string; data: Uint8Array }> = []; let totalBytes = 0;
    for (let index = 0; index < assets.length; index += 1) {
      const asset = assets[index]; if (!asset || typeof asset.url !== "string") throw new Error("Geçersiz görsel kaydı.");
      const dataUrl = getDataUrl(asset.url);
      let data: Uint8Array; let extension: string;
      if (dataUrl) { data = dataUrl.data; extension = dataUrl.extension; }
      else { const url = assertProviderAssetUrl(asset.url); const response = await fetch(url, { cache: "no-store" }); if (!response.ok) throw new Error(`ComfyUI çıktısı alınamadı (${response.status}).`); data = new Uint8Array(await response.arrayBuffer()); const sourceName = url.searchParams.get("filename") || ""; const match = sourceName.match(/\.(png|jpe?g|webp)$/i); extension = match ? match[1].toLowerCase().replace("jpeg", "jpg") : "png"; }
      totalBytes += data.byteLength; if (totalBytes > MAX_TOTAL_BYTES) throw new Error("ZIP toplam boyutu 50 MB sınırını aşıyor."); files.push({ name: safeFileName(index, asset, extension), data });
    }
    const zip = makeZip(files); const bodyBuffer = new ArrayBuffer(zip.byteLength); new Uint8Array(bodyBuffer).set(zip);
    return new NextResponse(bodyBuffer, { status: 200, headers: { "Content-Type": "application/zip", "Content-Disposition": 'attachment; filename="AGT-Product-AI-export.zip"', "Cache-Control": "no-store" } });
  } catch (error) { const message = error instanceof Error ? error.message : "ZIP oluşturulamadı."; return NextResponse.json({ error: message }, { status: 500 }); }
}
