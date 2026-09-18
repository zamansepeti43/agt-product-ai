"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GENERATION_PRESETS } from "@/lib/ai/presets";
import CatalogStudio from "./CatalogStudio";
import type { GeneratedAsset, GenerationJob, ImageJobMode, ProviderConfig } from "@/lib/ai/types";

type ProviderId = "auto-free" | "gemini" | "comfyui" | "aihorde" | "cloudflare" | "openai" | "custom-openai";
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_FILES = 6;
const providers: { id: ProviderId; label: string; note: string; icon: string }[] = [
  { id: "auto-free", label: "Ücretsiz otomatik", note: "ComfyUI + AI Horde fallback", icon: "🆓" },
  { id: "comfyui", label: "ComfyUI / Qwen", note: "Yerel veya kendi sunucun", icon: "🧩" },
  { id: "aihorde", label: "AI Horde", note: "Topluluk GPU ağı • anahtarsız da denenebilir", icon: "🌐" },
  { id: "gemini", label: "Google Gemini", note: "Kendi Gemini API anahtarın", icon: "✨" },
  { id: "openai", label: "OpenAI", note: "OpenAI Image API", icon: "◉" },
  { id: "cloudflare", label: "Cloudflare Workers AI", note: "Account ID + API Token", icon: "☁️" },
  { id: "custom-openai", label: "Özel OpenAI uyumlu", note: "Her uyumlu görüntü API'si", icon: "🔌" },
];

function previewUrl(url: string) { return url.startsWith("data:image/") ? url : `/api/asset?url=${encodeURIComponent(url)}`; }

export default function ProductStudio() {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<ImageJobMode>("hero");
  const [count, setCount] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<ProviderId>("auto-free");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-image-1");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");
  const [accountId, setAccountId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [finder, setFinder] = useState<any[]>([]);
  const [finderOpen, setFinderOpen] = useState(false);

  const selected = useMemo(() => GENERATION_PRESETS.find((p) => p.id === mode) || GENERATION_PRESETS[0], [mode]);
  const selectedProvider = providers.find((p) => p.id === provider) || providers[0];

  useEffect(() => {
    const saved = localStorage.getItem("agt-ai-provider");
    if (providers.some((p) => p.id === saved)) setProvider(saved as ProviderId);
  }, []);

  function selectProvider(id: ProviderId) {
    setProvider(id);
    localStorage.setItem("agt-ai-provider", id);
    setError("");
    if (id === "openai") { setBaseUrl("https://api.openai.com/v1"); setModel("gpt-image-1"); }
    if (id === "gemini") setModel("gemini-3.1-flash-image");
    if (id === "aihorde") setModel("AlbedoBase XL (SDXL)");
    if (id === "cloudflare") setModel("@cf/runwayml/stable-diffusion-v1-5-img2img");
    if (id === "custom-openai") { setBaseUrl(""); setModel(""); }
  }

  function selectFiles(next: File[]) {
    setError(""); setJob(null); setAssets([]);
    if (!next.length) { setFiles([]); return; }
    if (next.length > MAX_FILES) return setError(`En fazla ${MAX_FILES} ürün görseli seçebilirsin.`);
    if (next.some((f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type))) return setError("Sadece JPG, PNG veya WEBP kabul edilir.");
    if (next.some((f) => f.size === 0 || f.size > MAX_FILE_SIZE)) return setError("Her görsel 12 MB'dan küçük olmalı.");
    if (next.reduce((sum, f) => sum + f.size, 0) > 48 * 1024 * 1024) return setError("Toplam yükleme boyutu 48 MB sınırını aşıyor.");
    setFiles(next);
  }

  async function openFinder() {
    setFinderOpen(true);
    if (finder.length) return;
    try { const r = await fetch("/api/providers"); const d = await r.json(); setFinder(d.providers || []); }
    catch { setError("AI API Finder açılamadı."); }
  }

  async function generate() {
    if (!files.length || busy) return;
    if (["gemini", "openai", "custom-openai"].includes(provider) && !apiKey.trim()) return setError("Bu provider için API anahtarı gerekli.");
    if (provider === "cloudflare" && (!apiKey.trim() || !accountId.trim())) return setError("Cloudflare için Account ID ve API Token gerekli.");
    if (["openai", "custom-openai"].includes(provider) && !model.trim()) return setError("Model adı gerekli.");
    if (provider === "custom-openai" && !baseUrl.trim()) return setError("Özel API Base URL gerekli.");
    setBusy(true); setError(""); setAssets([]); setJob(null);
    try {
      const body = new FormData();
      files.forEach((file) => body.append(files.length === 1 ? "image" : "images", file));
      body.append("mode", mode); body.append("count", String(count)); body.append("prompt", prompt); body.append("provider", provider);
      if (apiKey.trim()) body.append("providerApiKey", apiKey.trim());
      if (model.trim()) body.append("providerModel", model.trim());
      if (baseUrl.trim()) body.append("providerBaseUrl", baseUrl.trim());
      if (accountId.trim()) body.append("providerAccountId", accountId.trim());
      const config: Record<string, ProviderConfig> = {};
      if ((provider === "auto-free" || provider === "aihorde") && apiKey.trim()) config.aihorde = { apiKey: apiKey.trim() };
      if (provider === "openai") config.openai = { apiKey: apiKey.trim(), model: model.trim(), baseUrl: baseUrl.trim() };
      if (provider === "cloudflare") config.cloudflare = { apiKey: apiKey.trim(), model: model.trim(), accountId: accountId.trim() };
      if (provider === "custom-openai") config["custom-openai"] = { apiKey: apiKey.trim(), model: model.trim(), baseUrl: baseUrl.trim() };
      if (Object.keys(config).length) body.append("providerConfigs", JSON.stringify(config));
      const endpoint = files.length === 1 ? "/api/generate" : "/api/batch";
      const response = await fetch(endpoint, { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Üretim başarısız.");
      setJob(data.job); setAssets(data.assets || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Beklenmeyen bir hata oluştu."); }
    finally { setBusy(false); }
  }

  async function exportZip() {
    if (!assets.length) return;
    try {
      const r = await fetch("/api/export/zip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assets }) });
      if (!r.ok) throw new Error((await r.json()).error || "ZIP oluşturulamadı.");
      const blob = await r.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "AGT-Product-AI-export.zip"; document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setError(e instanceof Error ? e.message : "ZIP oluşturulamadı."); }
  }

  function downloadAsset(asset: GeneratedAsset, index: number) {
    const url = previewUrl(asset.url);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AGT-${String(index + 1).padStart(2, "0")}-${asset.mode}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    if (url.startsWith("data:")) return;
  }

  return <main className="studio-page">
    <header className="studio-topbar">
      <div className="studio-brand"><span>AGT</span> <b>Studio</b><small>Product AI</small></div>
      <div className="studio-top-actions"><span className="studio-badge">✨ Daha iyi ürün<br/>daha fazla satış</span><button className="icon-button" aria-label="Bildirimler">♧</button><button className="avatar-button">A</button></div>
    </header>

    <section className="studio-hero">
      <div className="hero-copy">
        <p className="studio-kicker">AGT STUDIO</p>
        <h1>Ürün fotoğraflarını<br/><span>satış içeriğine dönüştür.</span></h1>
        <p>Tek fotoğraf veya 6 ürüne kadar yükle. Ürün kimliğini koruyarak e-ticaret, stüdyo, lifestyle, detay ve sosyal medya görselleri üret.</p>
      </div>
      <div className="studio-upload" role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}>
        <input ref={fileInputRef} className="upload-input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple onClick={(e) => { e.currentTarget.value = ""; }} onChange={(e) => selectFiles(Array.from(e.target.files || []))} aria-label="Ürün fotoğrafı seç" />
        {files.length ? <div className="upload-selected"><div className="upload-check">✓</div><strong>{files.length} ürün görseli seçildi</strong><small>{files[0].name}{files.length > 1 ? ` + ${files.length - 1} ürün` : ""}</small><span>Değiştirmek için dokun</span></div> : <><div className="upload-icon">＋</div><strong>Ürün fotoğrafını yükle</strong><small>JPG, PNG veya WEBP · Maks. 12 MB / görsel</small><span className="upload-cta">Dosya seç</span></>}
      </div>
    </section>

    <section className="studio-section">
      <div className="section-title-row"><div><p className="studio-kicker">1 · İÇERİK</p><h2>İçerik türünü seç</h2></div><span className="section-meta">{selected.aspectRatio} · {selected.label}</span></div>
      <div className="content-modes">{GENERATION_PRESETS.map((p) => <button key={p.id} onClick={() => setMode(p.id)} className={`content-mode ${mode === p.id ? "is-selected" : ""}`}><span className="mode-emoji">{p.id === "hero" ? "🛒" : p.id === "white" ? "⚪" : p.id === "studio" ? "✨" : p.id === "lifestyle" ? "🏠" : p.id === "detail" ? "🔍" : "📱"}</span><b>{p.label}</b><small>{p.description}</small></button>)}</div>
    </section>

    <section className="studio-section ai-section">
      <div className="section-title-row ai-title"><div><p className="studio-kicker">2 · AI MOTORU</p><h2>İstediğin yapay zekâyı bağla <button className="mini-help" aria-label="Bilgi">?</button></h2><p>Anahtarlar tarayıcıda saklanmaz; istek sırasında sunucuya iletilir.</p></div><button className="outline-button" onClick={openFinder}>🔎 API Finder <span>→</span></button></div>
      <select className="provider-mobile-select" value={provider} onChange={(e) => selectProvider(e.target.value as ProviderId)} aria-label="AI motoru seç">{providers.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.label} — {p.note}</option>)}</select>
      <div id="provider-options" className="provider-options">{providers.map((p) => <button key={p.id} onClick={() => selectProvider(p.id)} className={`provider-option ${provider === p.id ? "is-selected" : ""}`}><strong>{p.icon} {p.label}</strong><small>{p.note}</small></button>)}</div>
      {provider !== "comfyui" && <div className="provider-fields">
        {provider === "cloudflare" && <input value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="Cloudflare Account ID" />}
        {provider === "auto-free" && <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AI Horde API Key · opsiyonel" autoComplete="off" />}
        {provider !== "auto-free" && provider !== "cloudflare" && <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={`${selectedProvider.label} API Key · opsiyonel`} autoComplete="off" />}
        {provider === "cloudflare" && <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Cloudflare API Token" autoComplete="off" />}
        {["openai", "custom-openai", "cloudflare", "aihorde", "gemini"].includes(provider) && <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model adı" />}
        {(provider === "openai" || provider === "custom-openai") && <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="API Base URL" />}
      </div>}
      {provider === "auto-free" && <p className="provider-help">🆓 Önce yapılandırılmış ComfyUI, sonra AI Horde denenir. AI Horde anahtarı opsiyoneldir.</p>}
      {provider === "aihorde" && <p className="provider-help">🌐 API anahtarı opsiyoneldir. Anahtarsız kullanım topluluk kuyruğuna bağlı olabilir.</p>}
      {provider === "cloudflare" && <p className="provider-help">Cloudflare img2img için Account ID + API Token gerekir.</p>}
    </section>

    <section className="studio-section production-section">
      <div className="section-title-row"><div><p className="studio-kicker">3 · ÜRETİM AYARLARI</p><h2>Son ayarlar</h2></div></div>
      <div className="production-grid">
        <label><span>Görsel sayısı</span><select value={count} onChange={(e) => setCount(Number(e.target.value))}>{[1,2,3,4].map((n) => <option key={n}>{n}</option>)}</select></label>
        <label><span>Görsel oranı</span><select defaultValue="1:1"><option>1:1</option><option>4:5</option><option>16:9</option><option>9:16</option></select></label>
      </div>
      <label className="prompt-box"><span>✎</span><div><b>Ek talimat <small>(opsiyonel)</small></b><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={1200} rows={2} placeholder="Örn. beyaz arka plan, doğal ışık, minimal tarz…" /></div></label>
      <button onClick={generate} disabled={!files.length || busy} className="generate-button">{busy ? "⏳ Üretiliyor…" : <>✨ <b>Görselleri Üret</b> <span>→</span></>}</button>
      {error && <div className="studio-notice error">{error}</div>}{job && <div className="studio-notice success">✓ {job.message}</div>}
    </section>

    <CatalogStudio onError={setError} />

    {assets.length > 0 && <section className="studio-section results-section"><div className="section-title-row"><div><p className="studio-kicker">SONUÇLAR</p><h2>{assets.length} görsel hazır</h2></div><button className="outline-button" onClick={exportZip}>⬇ Tümünü ZIP</button></div><div className="asset-grid">{assets.map((asset, index) => <div key={asset.id} className="asset-item"><img src={previewUrl(asset.url)} alt="Üretilen ürün görseli"/><button onClick={() => downloadAsset(asset, index)}>⬇ İndir</button></div>)}</div></section>}

    {finderOpen && <div className="finder-overlay"><div className="finder-modal"><div className="section-title-row"><div><p className="studio-kicker">API FINDER</p><h2>Bağlanabilir sağlayıcılar</h2></div><button className="outline-button" onClick={() => setFinderOpen(false)}>Kapat</button></div><div className="provider-options">{finder.map((p) => <button key={p.id} className="provider-option" onClick={() => { if (providers.some((x) => x.id === p.id)) selectProvider(p.id as ProviderId); setFinderOpen(false); }}><strong>{p.name}</strong><small>{p.note}</small></button>)}</div></div></div>}
  </main>;
}
