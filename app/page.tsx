"use client";

import { useEffect, useMemo, useState } from "react";
import { GENERATION_PRESETS } from "@/lib/ai/presets";
import type { GeneratedAsset, GenerationJob, ImageJobMode } from "@/lib/ai/types";

const MAX_FILE_SIZE = 12 * 1024 * 1024;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [mode, setMode] = useState<ImageJobMode>("hero");
  const [count, setCount] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(
    () => GENERATION_PRESETS.find((preset) => preset.id === mode) ?? GENERATION_PRESETS[0],
    [mode],
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function selectFile(next: File | undefined) {
    setError("");
    setJob(null);
    setAssets([]);
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setError("Lütfen bir görsel dosyası seç.");
      return;
    }
    if (next.size > MAX_FILE_SIZE) {
      setError("Görsel 12 MB'dan küçük olmalı.");
      return;
    }
    setFile(next);
  }

  async function startGeneration() {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setAssets([]);
    try {
      const body = new FormData();
      body.append("image", file);
      body.append("mode", mode);
      body.append("count", String(count));
      body.append("prompt", prompt);
      const response = await fetch("/api/generate", { method: "POST", body });
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

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">AGT</span><span>Product AI</span></div>
        <span className="status">v0.3 • generation controls</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">AGT STUDIO</p>
          <h1>Ürün fotoğrafını<br /><span>satış içeriğine</span> dönüştür.</h1>
          <p className="lead">Tek fotoğraf yükle. Ürünü koruyarak e-ticaret, stüdyo, lifestyle, detay ve sosyal medya içerikleri üret.</p>
          <div className="trust-row"><span>✓ JPG / PNG / WEBP</span><span>✓ 12 MB</span><span>✓ Telefon kamerası</span></div>
        </div>

        <label className={`dropzone ${preview ? "has-preview" : ""}`}>
          <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(e) => selectFile(e.target.files?.[0])} />
          {preview ? <img src={preview} alt="Ürün önizleme" /> : <div className="upload-icon">＋</div>}
          <strong>{file?.name || "Ürün fotoğrafını yükle"}</strong>
          <small>{preview ? `${Math.round((file?.size ?? 0) / 1024)} KB • hazır` : "Telefonda kameradan çekebilir veya galeriden seçebilirsin"}</small>
          {preview && <span className="change-file">Başka fotoğraf seç</span>}
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
          <label><span>Görsel sayısı</span><select value={count} onChange={(e) => setCount(Number(e.target.value))}>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value} görsel</option>)}</select></label>
          <label className="prompt-field"><span>Ek talimat <small>isteğe bağlı</small></span><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={1200} placeholder="Örn. ürünü değiştirme, premium doğal ışık, sade arka plan…" rows={3} /></label>
        </div>

        {error && <div className="notice error">{error}</div>}
        {job && <div className="notice success"><strong>✓ {job.message}</strong><small>Job: {job.id}</small></div>}

        {assets.length > 0 && (
          <div className="results">
            <div className="results-head"><div><span className="eyebrow">SONUÇ</span><h2>{assets.length} görsel hazır</h2></div><span className="device-note">Sağ tık / basılı tut → kaydet</span></div>
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
          <div><strong>{file ? "Fotoğraf hazır" : "Önce ürün fotoğrafını seç"}</strong><span className="muted"> • {selected.label} • {count} çıktı</span></div>
          <button className="generate" disabled={!file || busy} onClick={startGeneration}>{busy ? "Üretim çalışıyor…" : "Üretmeye Başla →"}</button>
        </div>
      </section>

      <section className="pipeline">
        <div><span>01</span><strong>Fotoğraf</strong><small>Yükle / çek</small></div>
        <i>→</i><div><span>02</span><strong>Hazırla</strong><small>Ürün + preset</small></div>
        <i>→</i><div><span>03</span><strong>AI İşleme</strong><small>Provider pipeline</small></div>
        <i>→</i><div><span>04</span><strong>QA / İndir</strong><small>PNG / JPG / ZIP</small></div>
      </section>
    </main>
  );
}
