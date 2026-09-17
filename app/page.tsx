"use client";

import { useEffect, useMemo, useState } from "react";
import { GENERATION_PRESETS } from "@/lib/ai/presets";
import type { GeneratedAsset, GenerationJob, ImageJobMode } from "@/lib/ai/types";
import type { ProductCatalogOutput } from "@/lib/catalog/types";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_FILES = 6;

function assetPreviewUrl(url: string) { return `/api/asset?url=${encodeURIComponent(url)}`; }

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState("");
  const [mode, setMode] = useState<ImageJobMode>("hero");
  const [count, setCount] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [catalog, setCatalog] = useState<ProductCatalogOutput | null>(null);
  const [catalogName, setCatalogName] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("");
  const [catalogBrand, setCatalogBrand] = useState("");
  const [catalogKeywords, setCatalogKeywords] = useState("");
  const [catalogMarketplace, setCatalogMarketplace] = useState<"generic" | "etsy" | "hepsiburada" | "trendyol" | "amazon">("etsy");
  const [catalogLanguage, setCatalogLanguage] = useState<"tr" | "en">("tr");
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const selected = useMemo(() => GENERATION_PRESETS.find((p) => p.id === mode) ?? GENERATION_PRESETS[0], [mode]);

  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined); }, []);
  useEffect(() => { if (!files.length) { setPreview(""); return; } const url = URL.createObjectURL(files[0]); setPreview(url); return () => URL.revokeObjectURL(url); }, [files]);

  function selectFiles(nextFiles: File[]) {
    setError(""); setJob(null); setAssets([]); setCatalog(null); setCopied("");
    if (!nextFiles.length) return;
    if (nextFiles.length > MAX_FILES) return setError(`En fazla ${MAX_FILES} ürün görseli seçebilirsin.`);
    if (nextFiles.some((f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type))) return setError("Sadece JPG, PNG veya WEBP kabul edilir.");
    if (nextFiles.some((f) => f.size === 0 || f.size > MAX_FILE_SIZE)) return setError("Her görsel 12 MB'dan küçük olmalı.");
    if (nextFiles.reduce((sum, f) => sum + f.size, 0) > 48 * 1024 * 1024) return setError("Toplam yükleme boyutu 48 MB sınırını aşıyor.");
    setFiles(nextFiles);
  }

  function resetProject() {
    setFiles([]); setPreview(""); setJob(null); setAssets([]); setCatalog(null); setPrompt(""); setCopied(""); setError("");
  }

  async function startGeneration() {
    if (!files.length || busy || exporting) return;
    setBusy(true); setError(""); setAssets([]); setJob(null); setCopied("");
    try {
      const body = new FormData();
      if (files.length === 1) body.append("image", files[0]); else files.forEach((f) => body.append("images", f));
      body.append("mode", mode); body.append("count", String(count)); body.append("prompt", prompt);
      const response = await fetch(files.length === 1 ? "/api/generate" : "/api/batch", { method: "POST", body });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Üretim başlatılamadı.");
      setJob(data.job as GenerationJob); setAssets((data.assets as GeneratedAsset[] | undefined) ?? []);
    } catch (err) { setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu."); } finally { setBusy(false); }
  }

  async function generateCatalog() {
    if (catalogBusy) return;
    if (!catalogName.trim() || !catalogCategory.trim()) return setError("Katalog için ürün adı ve kategori gerekli.");
    setCatalogBusy(true); setError(""); setCopied("");
    try {
      const response = await fetch("/api/catalog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: catalogName, category: catalogCategory, brand: catalogBrand, keywords: catalogKeywords.split(",").map((x) => x.trim()).filter(Boolean), marketplace: catalogMarketplace, language: catalogLanguage }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Katalog içeriği oluşturulamadı.");
      setCatalog(data.catalog as ProductCatalogOutput);
    } catch (err) { setError(err instanceof Error ? err.message : "Katalog oluşturulamadı."); } finally { setCatalogBusy(false); }
  }

  async function copyText(key: string, text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(key); window.setTimeout(() => setCopied((current) => current === key ? "" : current), 1800); }
    catch { setError("Panoya kopyalama başarısız oldu."); }
  }

  async function exportZip() {
    if (!assets.length || exporting || busy) return;
    setExporting(true); setError("");
    try {
      const response = await fetch("/api/export/zip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assets }) });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || "ZIP oluşturulamadı."); }
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = "AGT-Product-AI-export.zip"; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { setError(err instanceof Error ? err.message : "ZIP indirilemedi."); } finally { setExporting(false); }
  }

  return (
    <main className="shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">AGT</span><span>Product AI</span></div><div className="top-actions"><span className="status">v0.5 • product studio</span>{files.length > 0 && <button className="new-project" onClick={resetProject}>＋ Yeni proje</button>}</div></header>
      <section className="hero"><div><p className="eyebrow">AGT STUDIO</p><h1>Ürün fotoğrafını<br /><span>satış içeriğine</span> dönüştür.</h1><p className="lead">Tek fotoğraf veya ürün kataloğunu yükle. Ürünü koruyarak e-ticaret, stüdyo, lifestyle, detay ve sosyal medya içerikleri üret.</p><div className="trust-row"><span>✓ JPG / PNG / WEBP</span><span>✓ 12 MB / görsel</span><span>✓ 6 ürün / batch</span><span>✓ Telefon kamerası</span></div></div>
        <label className={`dropzone ${preview ? "has-preview" : ""}`}><input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple onChange={(e) => selectFiles(Array.from(e.target.files ?? []))} />{preview ? <img src={preview} alt="Ürün önizleme" /> : <div className="upload-icon">＋</div>}<strong>{files.length ? `${files.length} ürün seçildi` : "Ürün fotoğraflarını yükle"}</strong><small>{files.length ? `${files[0].name}${files.length > 1 ? ` + ${files.length - 1} ürün` : ""}` : "Tek ürün veya aynı anda 6 ürüne kadar katalog seçebilirsin"}</small>{files.length > 0 && <span className="change-file">Fotoğrafları değiştir</span>}</label></section>
      <section className="workspace"><div className="section-head"><div><p className="eyebrow">ÜRETİM</p><h2>İçerik türünü seç</h2></div><span className="device-note">📱 PWA • 💻 Windows</span></div>
        <div className="modes">{GENERATION_PRESETS.map((preset) => <button type="button" key={preset.id} className={`mode ${mode === preset.id ? "selected" : ""}`} onClick={() => setMode(preset.id)}><span className="mode-icon">{preset.id === "hero" ? "🏪" : preset.id === "white" ? "⚪" : preset.id === "studio" ? "✨" : preset.id === "lifestyle" ? "🏠" : preset.id === "detail" ? "🔍" : "📱"}</span><span><strong>{preset.label}</strong><small>{preset.description}</small></span></button>)}</div>
        <div className="settings-card"><div><span className="eyebrow">SEÇİLİ PRESET</span><strong>{selected.label}</strong><small>{selected.aspectRatio} • Ürün kimliği korunur</small></div><div className="provider-pill">AI PROVIDER • {process.env.NEXT_PUBLIC_IMAGE_PROVIDER || "AUTO"}</div></div>
        <div className="generation-controls"><label><span>Ürün başına görsel</span><select value={count} onChange={(e) => setCount(Number(e.target.value))}>{[1,2,3,4].map((v) => <option key={v} value={v}>{v} görsel</option>)}</select></label><label className="prompt-field"><span>Ek talimat <small>isteğe bağlı</small></span><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={1200} placeholder="Örn. ürünü değiştirme, premium doğal ışık, sade arka plan…" rows={3} /><small className="char-count">{prompt.length}/1200</small></label></div>
        {error && <div className="notice error" role="alert">{error}</div>}{job && <div className="notice success"><strong>✓ {job.message}</strong><small>Job: {job.id}</small></div>}
        {assets.length > 0 && <div className="results"><div className="results-head"><div><span className="eyebrow">SONUÇ</span><h2>{assets.length} görsel hazır</h2></div><button type="button" className="export-button" onClick={exportZip} disabled={exporting || busy}>{exporting ? "ZIP hazırlanıyor…" : "⬇ Tümünü ZIP indir"}</button></div><div className="asset-grid">{assets.map((asset) => { const previewUrl = assetPreviewUrl(asset.url); return <a className="asset-card" key={asset.id} href={previewUrl} target="_blank" rel="noreferrer"><img src={previewUrl} alt="Üretilen ürün görseli" loading="lazy" /><span>{asset.mode} • {asset.width}×{asset.height}</span></a>; })}</div></div>}
        <div className="catalog-card"><div className="results-head"><div><span className="eyebrow">KATALOG / SEO</span><h2>Satış metnini hazırla</h2><p className="card-help">Ürün bilgilerini gir; başlık, açıklama, etiket ve SEO anahtar kelimelerini tek seferde çıkar.</p></div></div><div className="catalog-grid"><input value={catalogName} onChange={(e) => setCatalogName(e.target.value)} placeholder="Ürün adı *" /><input value={catalogCategory} onChange={(e) => setCatalogCategory(e.target.value)} placeholder="Kategori *" /><input value={catalogBrand} onChange={(e) => setCatalogBrand(e.target.value)} placeholder="Marka (opsiyonel)" /><input value={catalogKeywords} onChange={(e) => setCatalogKeywords(e.target.value)} placeholder="Anahtar kelimeler, virgülle ayır" /><select value={catalogMarketplace} onChange={(e) => setCatalogMarketplace(e.target.value as typeof catalogMarketplace)}><option value="etsy">Etsy</option><option value="trendyol">Trendyol</option><option value="hepsiburada">Hepsiburada</option><option value="amazon">Amazon</option><option value="generic">Genel mağaza</option></select><select value={catalogLanguage} onChange={(e) => setCatalogLanguage(e.target.value as typeof catalogLanguage)}><option value="tr">Türkçe</option><option value="en">English</option></select></div><button type="button" className="export-button catalog-action" onClick={generateCatalog} disabled={catalogBusy}>{catalogBusy ? "Hazırlanıyor…" : "Katalog metnini oluştur →"}</button>{catalog && <div className="catalog-result"><div className="copy-row"><strong>{catalog.title}</strong><button type="button" onClick={() => copyText("title", catalog.title)}>{copied === "title" ? "✓ Kopyalandı" : "Kopyala"}</button></div><p>{catalog.shortDescription}</p><div className="copy-row"><b>Açıklama</b><button type="button" onClick={() => copyText("description", catalog.description)}>{copied === "description" ? "✓ Kopyalandı" : "Kopyala"}</button></div><p>{catalog.description}</p><div className="catalog-line"><b>Etiketler:</b> {catalog.tags.join(" • ")}</div><div className="catalog-line"><b>SEO:</b> {catalog.seoKeywords.join(", ")}</div><button type="button" className="copy-all" onClick={() => copyText("all", `Başlık: ${catalog.title}\n\nKısa açıklama: ${catalog.shortDescription}\n\nAçıklama: ${catalog.description}\n\nEtiketler: ${catalog.tags.join(", ")}\n\nSEO: ${catalog.seoKeywords.join(", ")}`)}>{copied === "all" ? "✓ Tüm katalog metni kopyalandı" : "Katalog paketini kopyala"}</button></div>}</div>
        <div className="action-row"><div><strong>{files.length ? `${files.length} fotoğraf hazır` : "Önce ürün fotoğrafını seç"}</strong><span className="muted"> • {selected.label} • ürün başına {count} çıktı</span></div><button type="button" className="generate" disabled={!files.length || busy || exporting} onClick={startGeneration}>{busy ? "AI işliyor…" : files.length > 1 ? "Toplu Üretimi Başlat →" : "Üretmeye Başla →"}</button></div>
      </section>
      <section className="pipeline"><div><span>01</span><strong>Fotoğraf</strong><small>Tekli / katalog</small></div><i>→</i><div><span>02</span><strong>Hazırla</strong><small>Ürün + preset</small></div><i>→</i><div><span>03</span><strong>AI İşleme</strong><small>Qwen / ComfyUI</small></div><i>→</i><div><span>04</span><strong>Satış paketi</strong><small>Katalog / SEO / ZIP</small></div></section>
    </main>
  );
}
