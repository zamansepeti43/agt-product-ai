"use client";

import { useState } from "react";

const modes = [
  ["hero", "🏪", "E-ticaret Seti", "Ana görsel + destek görselleri"],
  ["white", "⚪", "Beyaz Arka Plan", "Temiz marketplace görseli"],
  ["studio", "✨", "Stüdyo", "Premium ürün çekimi"],
  ["lifestyle", "🏠", "Lifestyle", "Gerçek kullanım sahnesi"],
  ["detail", "🔍", "Detay", "Yakın plan ve detay görselleri"],
  ["social", "📱", "Sosyal Medya", "Instagram ve reklam formatları"],
];

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState("hero");

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">AGT</span><span>Product AI</span></div>
        <span className="status">MVP • AI provider-ready</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">AGT STUDIO</p>
          <h1>Ürün fotoğrafını<br /><span>satış içeriğine</span> dönüştür.</h1>
          <p className="lead">Tek fotoğraf yükle. E-ticaret, stüdyo, lifestyle ve sosyal medya görsellerini tek yerden üret.</p>
        </div>

        <label className="dropzone">
          <input type="file" accept="image/*" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
          <div className="upload-icon">＋</div>
          <strong>{fileName || "Ürün fotoğrafını yükle"}</strong>
          <small>{fileName ? "Fotoğraf seçildi" : "PNG, JPG veya WEBP • Telefonda kameradan da seçilebilir"}</small>
        </label>
      </section>

      <section className="workspace">
        <div className="section-head">
          <div><p className="eyebrow">ÜRETİM</p><h2>Ne oluşturmak istiyorsun?</h2></div>
          <span className="device-note">📱 Telefon • 💻 PC</span>
        </div>

        <div className="modes">
          {modes.map(([id, icon, title, desc]) => (
            <button key={id} className={`mode ${mode === id ? "selected" : ""}`} onClick={() => setMode(id)}>
              <span className="mode-icon">{icon}</span>
              <span><strong>{title}</strong><small>{desc}</small></span>
            </button>
          ))}
        </div>

        <div className="action-row">
          <div><strong>Seçili: </strong>{modes.find(([id]) => id === mode)?.[2]}<span className="muted"> • AI motoru bağlanmaya hazır</span></div>
          <button className="generate" disabled={!fileName}>Üretmeye Başla →</button>
        </div>
      </section>

      <section className="pipeline">
        <div><span>01</span><strong>Fotoğraf</strong><small>Ürünü yükle</small></div>
        <i>→</i><div><span>02</span><strong>AI İşleme</strong><small>Provider pipeline</small></div>
        <i>→</i><div><span>03</span><strong>QA</strong><small>Kalite kontrol</small></div>
        <i>→</i><div><span>04</span><strong>İndir</strong><small>PNG / JPG / ZIP</small></div>
      </section>
    </main>
  );
}
