"use client";

import { useEffect, useMemo, useState } from "react";
import { GENERATION_PRESETS } from "@/lib/ai/presets";
import type { GeneratedAsset, GenerationJob, ImageJobMode, ProviderConfig } from "@/lib/ai/types";
import type { ProductCatalogOutput } from "@/lib/catalog/types";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_FILES = 6;
type ProviderId = "auto-free" | "gemini" | "comfyui" | "aihorde" | "custom-openai";

function assetPreviewUrl(url: string) { return url.startsWith("data:image/") ? url : `/api/asset?url=${encodeURIComponent(url)}`; }

export default function Home() {
  const [files, setFiles] = useState<File[]>([]), [preview, setPreview] = useState("");
  const [mode, setMode] = useState<ImageJobMode>("hero"), [count, setCount] = useState(1), [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<ProviderId>("auto-free");
  const [apiKey, setApiKey] = useState(""), [model, setModel] = useState("gemini-3.1-flash-image"), [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");
  const [job, setJob] = useState<GenerationJob | null>(null), [assets, setAssets] = useState<GeneratedAsset[]>([]), [error, setError] = useState("");
  const [catalog, setCatalog] = useState<ProductCatalogOutput | null>(null), [catalogName, setCatalogName] = useState(""), [catalogCategory, setCatalogCategory] = useState(""), [catalogBrand, setCatalogBrand] = useState(""), [catalogKeywords, setCatalogKeywords] = useState("");
  const [catalogMarketplace, setCatalogMarketplace] = useState<"generic" | "etsy" | "hepsiburada" | "trendyol" | "amazon">("etsy"), [catalogLanguage, setCatalogLanguage] = useState<"tr" | "en">("tr");
  const [catalogBusy, setCatalogBusy] = useState(false), [busy, setBusy] = useState(false), [exporting, setExporting] = useState(false), [copied, setCopied] = useState("");
  const selected = useMemo(() => GENERATION_PRESETS.find((p) => p.id === mode) ?? GENERATION_PRESETS[0], [mode]);

  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined); }, []);
  useEffect(() => { if (!files.length) { setPreview(""); return; } const url = URL.createObjectURL(files[0]); setPreview(url); return () => URL.revokeObjectURL(url); }, [files]);
  useEffect(() => { const saved = window.localStorage.getItem("agt-ai-provider"); if (["auto-free","gemini","comfyui","aihorde","custom-openai"].includes(saved || "")) setProvider(saved as ProviderId); }, []);
  function selectProvider(next: ProviderId) { setProvider(next); window.localStorage.setItem("agt-ai-provider", next); setError(""); }
  function selectFiles(next: File[]) { setError(""); setJob(null); setAssets([]); setCatalog(null); if (!next.length) return; if (next.length > MAX_FILES) return setError(`En fazla ${MAX_FILES} ürün görseli seçebilirsin.`); if (next.some(f => !["image/jpeg","image/png","image/webp"].includes(f.type))) return setError("Sadece JPG, PNG veya WEBP kabul edilir."); if (next.some(f => f.size === 0 || f.size > MAX_FILE_SIZE)) return setError("Her görsel 12 MB'dan küçük olmalı."); if (next.reduce((s,f)=>s+f.size,0)>48*1024*1024) return setError("Toplam yükleme boyutu 48 MB sınırını aşıyor."); setFiles(next); }
  function resetProject() { setFiles([]); setJob(null); setAssets([]); setCatalog(null); setPrompt(""); setError(""); }

  async function startGeneration() {
    if (!files.length || busy || exporting) return;
    if (provider === "gemini" && !apiKey.trim()) return setError("Gemini API anahtarını bağlaman gerekiyor.");
    if (provider === "aihorde" && !apiKey.trim()) return setError("AI Horde API anahtarını bağlaman gerekiyor.");
    if (provider === "custom-openai" && (!baseUrl.trim() || !model.trim())) return setError("Özel AI için Base URL ve model gerekli.");
    setBusy(true); setError(""); setAssets([]); setJob(null);
    try {
      const body = new FormData();
      if (files.length === 1) body.append("image", files[0]); else files.forEach(f => body.append("images", f));
      body.append("mode", mode); body.append("count", String(count)); body.append("prompt", prompt); body.append("provider", provider);
      if (apiKey.trim()) body.append("providerApiKey", apiKey.trim()); if (model.trim()) body.append("providerModel", model.trim()); if (baseUrl.trim()) body.append("providerBaseUrl", baseUrl.trim());
      const configs: Record<string, ProviderConfig> = {};
      if (provider === "auto-free" && apiKey.trim()) configs.aihorde = { apiKey: apiKey.trim() };
      if (provider === "custom-openai") configs["custom-openai"] = { apiKey: apiKey.trim(), model: model.trim(), baseUrl: baseUrl.trim() };
      if (Object.keys(configs).length) body.append("providerConfigs", JSON.stringify(configs));
      const response = await fetch(files.length === 1 ? "/api/generate" : "/api/batch", { method: "POST", body });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Üretim başlatılamadı."); setJob(data.job); setAssets(data.assets || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Beklenmeyen bir hata oluştu."); } finally { setBusy(false); }
  }
  async function generateCatalog() {
    if (catalogBusy) return; if (!catalogName.trim() || !catalogCategory.trim()) return setError("Katalog için ürün adı ve kategori gerekli."); setCatalogBusy(true); setError("");
    try { const r = await fetch("/api/catalog", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name:catalogName,category:catalogCategory,brand:catalogBrand,keywords:catalogKeywords.split(",").map(x=>x.trim()).filter(Boolean),marketplace:catalogMarketplace,language:catalogLanguage}) }); const d=await r.json(); if(!r.ok) throw new Error(d.error); setCatalog(d.catalog); } catch(e){setError(e instanceof Error?e.message:"Katalog oluşturulamadı.");} finally{setCatalogBusy(false);}
  }
  async function copyText(key:string,text:string){try{await navigator.clipboard.writeText(text);setCopied(key);setTimeout(()=>setCopied(""),1800);}catch{setError("Panoya kopyalama başarısız oldu.");}}
  async function exportZip(){if(!assets.length||exporting)return;setExporting(true);try{const r=await fetch("/api/export/zip",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assets})});if(!r.ok)throw new Error((await r.json()).error);const b=await r.blob(),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="AGT-Product-AI-export.zip";a.click();URL.revokeObjectURL(u);}catch(e){setError(e instanceof Error?e.message:"ZIP oluşturulamadı.");}finally{setExporting(false);}}

  const providerLabel = {"auto-free":"Ücretsiz otomatik",gemini:"Gemini",comfyui:"ComfyUI / Qwen",aihorde:"AI Horde","custom-openai":"Özel OpenAI uyumlu API"}[provider];
  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">AGT</span><span>Product AI</span></div><div className="top-actions"><span className="status">v0.5 • product studio</span>{files.length>0&&<button className="new-project" onClick={resetProject}>＋ Yeni proje</button>}</div></header>
    <section className="hero"><div><p className="eyebrow">AGT STUDIO</p><h1>Ürün fotoğrafını<br/><span>satış içeriğine</span> dönüştür.</h1><p className="lead">Tek fotoğraf veya ürün kataloğunu yükle. Ürünü koruyarak e-ticaret, stüdyo, lifestyle, detay ve sosyal medya içerikleri üret.</p><div className="trust-row"><span>✓ JPG / PNG / WEBP</span><span>✓ 12 MB / görsel</span><span>✓ 6 ürün / batch</span><span>✓ Telefon kamerası</span></div></div>
      <label className={`dropzone ${preview?"has-preview":""}`}><input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple onChange={e=>selectFiles(Array.from(e.target.files||[]))}/>{preview?<img src={preview} alt="Ürün önizleme"/>:<div className="upload-icon">＋</div>}<strong>{files.length?`${files.length} ürün seçildi`:"Ürün fotoğraflarını yükle"}</strong><small>{files.length?`${files[0].name}${files.length>1?` + ${files.length-1} ürün`:""}`:"Tek ürün veya aynı anda 6 ürüne kadar katalog seçebilirsin"}</small></label></section>
    <section className="workspace"><div className="section-head"><div><p className="eyebrow">ÜRETİM</p><h2>İçerik türünü seç</h2></div><span className="device-note">📱 PWA • 💻 Windows</span></div>
      <div className="modes">{GENERATION_PRESETS.map(p=><button type="button" key={p.id} className={`mode ${mode===p.id?"selected":""}`} onClick={()=>setMode(p.id)}><span className="mode-icon">{p.id==="hero"?"🏪":p.id==="white"?"⚪":p.id==="studio"?"✨":p.id==="lifestyle"?"🏠":p.id==="detail"?"🔍":"📱"}</span><span><strong>{p.label}</strong><small>{p.description}</small></span></button>)}</div>
      <div className="settings-card"><div><span className="eyebrow">SEÇİLİ PRESET</span><strong>{selected.label}</strong><small>{selected.aspectRatio} • Ürün kimliği korunur</small></div><div className="provider-pill">AI • {providerLabel}</div></div>
      <div className="provider-panel"><div><span className="eyebrow">AI MOTORU</span><strong>İstediğin yapay zekâyı bağla</strong><small>Hazır motorları kullan veya OpenAI uyumlu herhangi bir görüntü API'sini kendi anahtarınla bağla.</small></div>
        <div className="provider-grid"><button type="button" className={provider==="auto-free"?"selected":""} onClick={()=>selectProvider("auto-free")}>🆓 Ücretsiz otomatik<br/><small>Yerel + AI Horde fallback</small></button><button type="button" className={provider==="gemini"?"selected":""} onClick={()=>selectProvider("gemini")}>🍌 Gemini<br/><small>Google görüntü modelleri</small></button><button type="button" className={provider==="comfyui"?"selected":""} onClick={()=>selectProvider("comfyui")}>🧩 ComfyUI<br/><small>Yerel / Qwen workflow</small></button><button type="button" className={provider==="aihorde"?"selected":""} onClick={()=>selectProvider("aihorde")}>🌐 AI Horde<br/><small>Topluluk GPU ağı</small></button><button type="button" className={provider==="custom-openai"?"selected":""} onClick={()=>selectProvider("custom-openai")}>🔌 Kendi API'n<br/><small>OpenAI uyumlu endpoint</small></button></div>
        {provider==="gemini"&&<div className="provider-fields"><input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Gemini API Key" autoComplete="off"/><select value={model} onChange={e=>setModel(e.target.value)}><option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image</option><option value="gemini-3.1-flash-lite-image">Gemini 3.1 Flash Lite Image</option><option value="gemini-3-pro-image">Gemini 3 Pro Image</option></select></div>}
        {provider==="aihorde"&&<div className="provider-fields"><input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="AI Horde API Key" autoComplete="off"/><input value={model} onChange={e=>setModel(e.target.value)} placeholder="Model (örn. AlbedoBase XL (SDXL))"/></div>}
        {provider==="custom-openai"&&<div className="provider-fields"><input value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder="API Base URL • örn. https://.../v1"/><input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="API Key (opsiyonel)" autoComplete="off"/><input value={model} onChange={e=>setModel(e.target.value)} placeholder="Model adı • örn. gpt-image-1 / flux"/></div>}
        {provider==="auto-free"&&<small className="card-help">Otomatik modda önce yapılandırılmış ComfyUI, ardından bağlı AI Horde denenir. Bir motor kota, rate-limit, timeout veya bağlantı hatası verirse sonraki motora geçilir. Gemini görüntü API'si otomatik ücretsiz havuza dahil değildir.</small>}
        {provider==="custom-openai"&&<small className="card-help">OpenAI uyumlu sağlayıcılarda /v1/images/generations ve ürün düzenleme için /v1/images/edits beklenir. API anahtarı tarayıcıda saklanmaz; istek sırasında sunucuya iletilir.</small>}
      </div>
      <div className="generation-controls"><label><span>Ürün başına görsel</span><select value={count} onChange={e=>setCount(Number(e.target.value))}>{[1,2,3,4].map(v=><option key={v}>{v}</option>)}</select></label><label className="prompt-field"><span>Ek talimat <small>isteğe bağlı</small></span><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} maxLength={1200} placeholder="Örn. ürünü değiştirme, premium doğal ışık, sade arka plan…" rows={3}/><small className="char-count">{prompt.length}/1200</small></label></div>
      {error&&<div className="notice error" role="alert">{error}</div>}{job&&<div className="notice success"><strong>✓ {job.message}</strong></div>}
      {assets.length>0&&<div className="results"><div className="results-head"><div><span className="eyebrow">SONUÇ</span><h2>{assets.length} görsel hazır</h2></div><button className="export-button" onClick={exportZip} disabled={exporting}>{exporting?"ZIP hazırlanıyor…":"⬇ Tümünü ZIP indir"}</button></div><div className="asset-grid">{assets.map(a=>{const u=assetPreviewUrl(a.url);return <a className="asset-card" key={a.id} href={u} target="_blank" rel="noreferrer"><img src={u} alt="Üretilen ürün görseli" loading="lazy"/><span>{a.mode} • {a.width}×{a.height}</span></a>})}</div></div>}
      <div className="catalog-card"><div className="results-head"><div><span className="eyebrow">KATALOG / SEO</span><h2>Satış metnini hazırla</h2><p className="card-help">Ürün bilgilerini gir; başlık, açıklama, etiket ve SEO anahtar kelimelerini tek seferde çıkar.</p></div></div><div className="catalog-grid"><input value={catalogName} onChange={e=>setCatalogName(e.target.value)} placeholder="Ürün adı *"/><input value={catalogCategory} onChange={e=>setCatalogCategory(e.target.value)} placeholder="Kategori *"/><input value={catalogBrand} onChange={e=>setCatalogBrand(e.target.value)} placeholder="Marka (opsiyonel)"/><input value={catalogKeywords} onChange={e=>setCatalogKeywords(e.target.value)} placeholder="Anahtar kelimeler, virgülle ayır"/><select value={catalogMarketplace} onChange={e=>setCatalogMarketplace(e.target.value as any)}><option value="etsy">Etsy</option><option value="trendyol">Trendyol</option><option value="hepsiburada">Hepsiburada</option><option value="amazon">Amazon</option><option value="generic">Genel mağaza</option></select><select value={catalogLanguage} onChange={e=>setCatalogLanguage(e.target.value as any)}><option value="tr">Türkçe</option><option value="en">English</option></select></div><button className="export-button catalog-action" onClick={generateCatalog} disabled={catalogBusy}>{catalogBusy?"Hazırlanıyor…":"Katalog metnini oluştur →"}</button>{catalog&&<div className="catalog-result"><div className="copy-row"><strong>{catalog.title}</strong><button onClick={()=>copyText("title",catalog.title)}>{copied==="title"?"✓ Kopyalandı":"Kopyala"}</button></div><p>{catalog.shortDescription}</p><div className="copy-row"><b>Açıklama</b><button onClick={()=>copyText("description",catalog.description)}>{copied==="description"?"✓ Kopyalandı":"Kopyala"}</button></div><p>{catalog.description}</p><div className="catalog-line"><b>Etiketler:</b> {catalog.tags.join(" • ")}</div><div className="catalog-line"><b>SEO:</b> {catalog.seoKeywords.join(", ")}</div><button className="copy-all" onClick={()=>copyText("all",`Başlık: ${catalog.title}\n\nKısa açıklama: ${catalog.shortDescription}\n\nAçıklama: ${catalog.description}\n\nEtiketler: ${catalog.tags.join(", ")}\n\nSEO: ${catalog.seoKeywords.join(", ")}`)}>{copied==="all"?"✓ Kopyalandı":"Katalog paketini kopyala"}</button></div>}</div>
      <div className="action-row"><div><strong>{files.length?`${files.length} fotoğraf hazır`:"Önce ürün fotoğrafını seç"}</strong><span className="muted"> • {selected.label} • ürün başına {count} çıktı</span></div><button className="generate" disabled={!files.length||busy||exporting} onClick={startGeneration}>{busy?"AI işliyor…":files.length>1?"Toplu Üretimi Başlat →":"Üretmeye Başla →"}</button></div>
    </section>
    <section className="pipeline"><div><span>01</span><strong>Fotoğraf</strong><small>Tekli / katalog</small></div><i>→</i><div><span>02</span><strong>Hazırla</strong><small>Ürün + preset</small></div><i>→</i><div><span>03</span><strong>AI İşleme</strong><small>Auto / API / Qwen</small></div><i>→</i><div><span>04</span><strong>Satış paketi</strong><small>Katalog / SEO / ZIP</small></div></section>
  </main>;
}
