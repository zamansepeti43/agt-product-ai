"use client";

import { useEffect, useMemo, useState } from "react";
import { GENERATION_PRESETS } from "@/lib/ai/presets";
import CatalogStudio from "./CatalogStudio";
import type { GeneratedAsset, GenerationJob, ImageJobMode, ProviderConfig } from "@/lib/ai/types";

type ProviderId = "auto-free" | "gemini" | "comfyui" | "aihorde" | "cloudflare" | "openai" | "custom-openai";
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_FILES = 6;
const providers: { id: ProviderId; label: string; note: string; icon: string }[] = [
  { id: "auto-free", label: "Ücretsiz otomatik", note: "ComfyUI + AI Horde fallback", icon: "🆓" },
  { id: "comfyui", label: "ComfyUI / Qwen", note: "Yerel veya kendi sunucun", icon: "🧩" },
  { id: "aihorde", label: "AI Horde", note: "Topluluk GPU ağı", icon: "🌐" },
  { id: "gemini", label: "Google Gemini", note: "Kendi Gemini API anahtarın", icon: "✨" },
  { id: "openai", label: "OpenAI", note: "OpenAI Image API", icon: "◉" },
  { id: "cloudflare", label: "Cloudflare Workers AI", note: "Account ID + API Token", icon: "☁️" },
  { id: "custom-openai", label: "Özel OpenAI uyumlu", note: "Her uyumlu görüntü API'si", icon: "🔌" },
];

function previewUrl(url: string) { return url.startsWith("data:image/") ? url : `/api/asset?url=${encodeURIComponent(url)}`; }

export default function ProductStudio() {
  const [files, setFiles] = useState<File[]>([]);
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
    if (["gemini", "aihorde", "openai", "custom-openai"].includes(provider) && !apiKey.trim()) return setError("Bu provider için API anahtarı gerekli.");
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
      if (provider === "auto-free" && apiKey.trim()) config.aihorde = { apiKey: apiKey.trim() };
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

  return <main style={styles.page}>
    <header style={styles.header}><div style={styles.brand}><b>AGT</b> Product AI</div><span style={styles.badge}>PRODUCT STUDIO</span></header>
    <section style={styles.hero}><div><p style={styles.kicker}>AGT STUDIO</p><h1 style={styles.h1}>Ürün fotoğrafını<br /><em>satış içeriğine</em> dönüştür.</h1><p style={styles.lead}>Tek fotoğraf veya 6 ürüne kadar katalog yükle. Ürün kimliğini koruyarak e-ticaret, stüdyo, lifestyle, detay ve sosyal medya görselleri üret.</p></div><label style={styles.drop}><input hidden type="file" accept="image/jpeg,image/png,image/webp" multiple capture="environment" onChange={(e) => selectFiles(Array.from(e.target.files || []))} />{files.length ? <><strong>✓ {files.length} ürün seçildi</strong><small>{files[0].name}{files.length > 1 ? ` + ${files.length - 1} ürün` : ""}</small></> : <><b style={{ fontSize: 42 }}>＋</b><strong>Ürün fotoğraflarını yükle</strong><small>JPG, PNG veya WEBP • 12 MB / görsel</small></>}</label></section>

    <section style={styles.card}><div style={styles.cardHead}><div><p style={styles.kicker}>1 • İÇERİK</p><h2 style={styles.h2}>İçerik türünü seç</h2></div><span style={styles.muted}>{selected.aspectRatio} • {selected.label}</span></div><div style={styles.grid}>{GENERATION_PRESETS.map((p) => <button key={p.id} onClick={() => setMode(p.id)} style={{ ...styles.mode, ...(mode === p.id ? styles.active : {}) }}><span>{p.id === "hero" ? "🏪" : p.id === "white" ? "⚪" : p.id === "studio" ? "✨" : p.id === "lifestyle" ? "🏠" : p.id === "detail" ? "🔍" : "📱"}</span><b>{p.label}</b><small>{p.description}</small></button>)}</div></section>

    <section style={styles.card}><div style={styles.cardHead}><div><p style={styles.kicker}>2 • AI MOTORU</p><h2 style={styles.h2}>İstediğin yapay zekâyı bağla</h2><p style={styles.muted}>Anahtarlar tarayıcıda saklanmaz; istek sırasında sunucuya iletilir.</p></div><button style={styles.secondary} onClick={openFinder}>🔎 API Finder</button></div><div style={styles.providerGrid}>{providers.map((p) => <button key={p.id} onClick={() => selectProvider(p.id)} style={{ ...styles.provider, ...(provider === p.id ? styles.active : {}) }}><strong>{p.icon} {p.label}</strong><small>{p.note}</small></button>)}</div>
      {provider !== "comfyui" && <div style={styles.fields}>
        {provider === "cloudflare" && <input value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="Cloudflare Account ID" />}
        {provider === "auto-free" && <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AI Horde API Key (opsiyonel)" autoComplete="off" />}
        {provider !== "auto-free" && provider !== "cloudflare" && <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={`${selectedProvider.label} API Key`} autoComplete="off" />}
        {provider === "cloudflare" && <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Cloudflare API Token" autoComplete="off" />}
        {["openai", "custom-openai", "cloudflare", "aihorde", "gemini"].includes(provider) && <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model adı" />}
        {(provider === "openai" || provider === "custom-openai") && <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="API Base URL" />}
      </div>}
      {provider === "auto-free" && <p style={styles.help}>🆓 Önce yapılandırılmış ComfyUI, sonra bağlı AI Horde denenir. Gemini/OpenAI/Cloudflare otomatik ücretsiz havuza dahil değildir. AI Horde anahtarı istersen buraya eklenebilir; anahtar ücretsiz erişim garantisi anlamına gelmez.</p>}
      {provider === "cloudflare" && <p style={styles.help}>Cloudflare img2img için Account ID + API Token gerekir. Model alanı varsayılan olarak desteklenen img2img modeline ayarlanır.</p>}
    </section>

    <section style={styles.card}><div style={styles.cardHead}><div><p style={styles.kicker}>3 • ÜRET</p><h2 style={styles.h2}>Son ayarlar</h2></div></div><div style={styles.controls}><label>Görsel sayısı<select value={count} onChange={(e) => setCount(Number(e.target.value))}>{[1,2,3,4].map((n) => <option key={n}>{n}</option>)}</select></label><label style={{ flex: 1 }}>Ek talimat<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={1200} rows={3} placeholder="Örn. ürünü değiştirme, premium doğal ışık, sade arka plan…" /></label></div><button onClick={generate} disabled={!files.length || busy} style={styles.generate}>{busy ? "⏳ Üretiliyor…" : `✨ ${selectedProvider.label} ile görsel üret`}</button>{error && <div style={styles.error}>{error}</div>}{job && <div style={styles.success}>✓ {job.message}</div>}</section>

    <CatalogStudio onError={setError} />

    {assets.length > 0 && <section style={styles.card}><div style={styles.cardHead}><div><p style={styles.kicker}>SONUÇ</p><h2 style={styles.h2}>{assets.length} görsel hazır</h2></div><button style={styles.secondary} onClick={exportZip}>⬇ Tümünü ZIP</button></div><div style={styles.results}>{assets.map((asset, index) => <div key={asset.id} style={styles.resultWrap}><img src={previewUrl(asset.url)} alt="Üretilen ürün görseli" style={styles.result} /><button style={styles.download} onClick={() => downloadAsset(asset, index)}>⬇ İndir</button></div>)}</div></section>}

    {finderOpen && <div style={styles.overlay}><div style={styles.modal}><div style={styles.cardHead}><div><p style={styles.kicker}>API FINDER</p><h2 style={styles.h2}>Bağlanabilir sağlayıcılar</h2></div><button style={styles.secondary} onClick={() => setFinderOpen(false)}>Kapat</button></div><div style={styles.providerGrid}>{finder.map((p) => <button key={p.id} style={styles.provider} onClick={() => { if (providers.some((x) => x.id === p.id)) selectProvider(p.id as ProviderId); setFinderOpen(false); }}><strong>{p.name}</strong><small>{p.note}</small></button>)}</div></div></div>}

    <style jsx>{`input,select,textarea{box-sizing:border-box;width:100%;border:1px solid #d9dce5;border-radius:12px;padding:12px 14px;background:#fff;font:inherit}button{font:inherit;cursor:pointer}button:disabled{opacity:.55;cursor:not-allowed}`}</style>
  </main>;
}

const styles: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#f7f7fa",color:"#171923",fontFamily:"Inter,ui-sans-serif,system-ui,sans-serif",padding:"clamp(14px,3vw,24px)",maxWidth:1200,margin:"0 auto"},
  header:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0 28px",gap:12},
  brand:{fontSize:22,fontWeight:800,letterSpacing:-.5}, badge:{fontSize:11,fontWeight:800,letterSpacing:1.2,padding:"8px 12px",borderRadius:99,background:"#ececf3",color:"#55596b"},
  hero:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,360px),1fr))",gap:24,alignItems:"stretch",marginBottom:24}, kicker:{fontSize:11,fontWeight:800,letterSpacing:1.4,color:"#777b8d",margin:"0 0 8px"},h1:{fontSize:"clamp(38px,6vw,68px)",lineHeight:.98,letterSpacing:-3,margin:"0 0 20px"},h2:{fontSize:24,margin:"0 0 5px",letterSpacing:-.7},lead:{fontSize:18,lineHeight:1.6,maxWidth:700,color:"#616575"},drop:{border:"2px dashed #c8cad5",borderRadius:24,background:"#fff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:280,padding:24,textAlign:"center",gap:10},card:{background:"#fff",border:"1px solid #e4e5eb",borderRadius:22,padding:"clamp(16px,3vw,24px)",marginBottom:18,boxShadow:"0 8px 30px rgba(20,20,40,.04)"},cardHead:{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",marginBottom:18},muted:{color:"#747889",fontSize:13},grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,190px),1fr))",gap:10},mode:{border:"1px solid #e2e3ea",background:"#fafafd",borderRadius:15,padding:16,textAlign:"left",display:"flex",flexDirection:"column",gap:7},active:{border:"2px solid #171923",background:"#f1f1f6"},providerGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,210px),1fr))",gap:10},provider:{border:"1px solid #e2e3ea",background:"#fafafd",borderRadius:14,padding:14,textAlign:"left",display:"flex",flexDirection:"column",gap:5},fields:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))",gap:10,marginTop:14},controls:{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"},generate:{width:"100%",border:0,borderRadius:14,padding:"16px 20px",background:"#171923",color:"#fff",fontWeight:800,fontSize:16,marginTop:16},secondary:{border:"1px solid #dfe0e8",background:"#fff",borderRadius:12,padding:"10px 14px",fontWeight:700},help:{fontSize:13,color:"#696d7d",background:"#f5f5f8",padding:12,borderRadius:12},error:{marginTop:14,padding:12,borderRadius:12,background:"#fff0f0",color:"#a32727"},success:{marginTop:14,padding:12,borderRadius:12,background:"#effaf1",color:"#247332"},results:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:12},resultWrap:{display:"flex",flexDirection:"column",gap:8},result:{width:"100%",aspectRatio:"1/1",objectFit:"cover",borderRadius:14,background:"#f0f0f3"},download:{border:"1px solid #dfe0e8",background:"#fff",borderRadius:10,padding:"9px 12px",fontWeight:700},overlay:{position:"fixed",inset:0,background:"rgba(10,10,20,.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:20},modal:{width:"min(900px,100%)",maxHeight:"90vh",overflow:"auto",background:"#fff",borderRadius:22,padding:24}
};
