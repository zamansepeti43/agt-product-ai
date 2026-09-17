"use client";

import { useEffect, useMemo, useState } from "react";
import { GENERATION_PRESETS } from "@/lib/ai/presets";
import type { GeneratedAsset, GenerationJob, ImageJobMode } from "@/lib/ai/types";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_FILES = 6;

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState("");
  const [mode, setMode] = useState<ImageJobMode>("hero");
  const [count, setCount] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(
    () => GENERATION_PRESETS.find((preset) => preset.id === mode) ?? GENERATION_PRESETS[0],
    [mode],
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!files.length) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(files[0]);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [files]);

  function selectFiles(nextFiles: File[]) {
    setError("");
    setJob(null);
    setAssets([]);
    if (!nextFiles.length) return;
    if (nextFiles.length > MAX_FILES) {
      setError(`En fazla ${MAX_FILES} ürün görseli seçebilirsin.`);
      return;
    }
    if (nextFiles.some((item) => !item.type.startsWith("image/"))) {
      setError("Lütfen yalnızca görsel dosyaları seç.");
      return;
    }
    if (nextFiles.some((item) => item.size > MAX_FILE_SIZE)) {
      setError("Her görsel 12 MB'dan küçük olmalı.");
      return;
    }
    const total = nextFiles.reduce((sum, item) => sum + item.size, 0);
    if (total > 48 * 1024 * 1024) {
      setError("Toplam yükleme boyutu 48 MB sınırını aşıyor.");
      return;
    }
    setFiles(nextFiles);
  }

  async function startGeneration() {
    if (!files.length || busy || exporting) return;
    setBusy(true);
    setError("");
    setAssets([]);
    try {
      const body = new FormData();
      if (files.length === 1) {
        body.append("image", files[0]);
      } else {
        files.forEach((file) => body.append("images", file));
      }
      body.append("mode", mode);
      body.append("count", String(count));
      body.append("prompt", prompt);
      const response = await fetch(files.length === 1 ? "/api/generate" : "/api/batch", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Üretim başlatılamadı.");
      setJob(data.job as GenerationJob);
      setAssets((data.assets as GeneratedAsset[] | undefined) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setBusy(false);
    }
  }

  async function exportZip() {
    if (!assets.length || exporting || busy) return;
    setExporting(true);
    setError("");
    try {
      const response = await fetch("/api/export/zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "ZIP oluşturulamadı.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "AGT-Product-AI-export.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ZIP indirilemedi.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">AGT</span><span>Product AI</span></div>
        <span className="status">v0.4 • batch studio</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">AGT STUDIO</p>
          <h1>Ürün fotoğrafını<br /><span>satış içeriğine</span> dönüştür.</h1>
          <p className="lead">Tek fotoğraf veya ürün kataloğunu yükle. Ürünü koruyarak e-ticaret, stüdyo, lifestyle, detay ve sosyal medya içerikleri üret.</p>
          <div className="trust-row"><span>✓ JPG / PNG / WEBP</span><span>✓ 12 MB / görsel</span><span>✓ 6 ürün / batch</span><span>✓ Telefon kamerası</span></div>
        </div>

        <label className={`dropzone ${preview ? "has-preview" : ""}`}>
          <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple onChange={(e) => selectFiles(Array.from(e.target.files ?? []))} />
          {preview ? <img src={preview} alt="Ürün önizleme" /> : <div className="upload-icon">＋</div>}
          <strong>{files.length ? `${files.length} ürün seçildi` : "Ürün fotoğraflarını yükle"}</strong>
          <small>{files.length ? `${files[0].name}${files.length > 1 ? ` + ${files.length - 1} ürün` : ""}` : "Tek ürün veya aynı anda 6 ürüne kadar katalog seçebilirsin"}</small>
          {files.length > 0 && <span className="change-file">Fotoğrafları değiştir</span>}
        </label>
      </section>

      <section className="workspace">
        <div className="section-head">
          <div><p className="eyebrow">ÜRETİM</p><h2>İçerik türünü seç</h2></div>
          <span className="device-note">📱 PWA • 💻 Windows</span>
        </div>

        <div className="modes">
          {GENERATION_PRESETS.map((preset) => (
            <button key={preset.id} className={`mode ${mode === preset.id ? "selected" : ""}`} onClick={() => setMode(preset.id)}>
              <span className="mode-icon">{preset.id === "hero" ? "🏪" : preset.id === "white" ? "⚪" : preset.id === "studio" ? "✨" : preset.id === "lifestyle" ? "🏠" : preset.id === "detail" ? "🔍" : "📱"}</span>
              <span><strong>{preset.label}</strong><small>{preset.description}</small></span>
            </button>
          ))}
        </div>

        <div className="settings-card">
          <div><span className="eyebrow">SEÇİLİ PRESET</span><strong>{selected.label}</strong><small>{selected.aspectRatio} • Ürün kimliği korunur</small></div>
          <div className="provider-pill">AI PROVIDER • {process.env.NEXT_PUBLIC_IMAGE_PROVIDER || "AUTO"}</div>
        </div>

        <div className="generation-controls">
          <label><span>Ürün başına görsel</span><select value={count} onChange={(e) => setCount(Number(e.target.value))}>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value} görsel</option>)}</select></label>
          <label className="prompt-field"><span>Ek talimat <small>isteğe bağlı</small></span><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={1200} placeholder="Örn. ürünü değiştirme, premium doğal ışık, sade arka plan…" rows={3} /></label>
        </div>

        {error && <div className="notice error">{error}</div>}
        {job && <div className="notice success"><strong>✓ {job.message}</strong><small>Job: {job.id}</small></div>}

        {assets.length > 0 && (
          <div className="results">
            <div className="results-head">
              <div><span className="eyebrow">SONUÇ</span><h2>{assets.length} görsel hazır</h2></div>
              <button className="export-button" onClick={exportZip} disabled={exporting || busy}>{exporting ? "ZIP hazırlanıyor…" : "⬇ Tümünü ZIP indir"}</button>
            </div>
            <div className="asset-grid">
              {assets.map((asset) => (
                <a className="asset-card" key={asset.id} href={asset.url} target="_blank" rel="noreferrer">
                  <img src={asset.url} alt="Üretilen ürün görseli" loading="lazy" />
                  <span>{asset.mode} • {asset.width}×{asset.height}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="action-row">
          <div><strong>{files.length ? `${files.length} fotoğraf hazır` : "Önce ürün fotoğrafını seç"}</strong><span className="muted"> • {selected.label} • ürün başına {count} çıktı</span></div>
          <button className="generate" disabled={!files.length || busy || exporting} onClick={startGeneration}>{busy ? "İşlem çalışıyor…" : files.length > 1 ? "Toplu Üretimi Başlat →" : "Üretmeye Başla →"}</button>
        </div>
      </section>

      <section className="pipeline">
        <div><span>01</span><strong>Fotoğraf</strong><small>Tekli / katalog</small></div>
        <i>→</i><div><span>02</span><strong>Hazırla</strong><small>Ürün + preset</small></div>
        <i>→</i><div><span>03</span><strong>AI İşleme</strong><small>Qwen / ComfyUI</small></div>
        <i>→</i><div><span>04</span><strong>QA / ZIP</strong><small>İndir / paketle</small></div>
      </section>
    </main>
  );
}
