"use client";

import { useState } from "react";
import type { ProductCatalogOutput } from "@/lib/catalog/types";

export default function CatalogStudio({ onError }: { onError: (message: string) => void }) {
  const [name,setName]=useState("");
  const [category,setCategory]=useState("");
  const [brand,setBrand]=useState("");
  const [keywords,setKeywords]=useState("");
  const [marketplace,setMarketplace]=useState<"etsy"|"trendyol"|"hepsiburada"|"amazon"|"generic">("etsy");
  const [language,setLanguage]=useState<"tr"|"en">("tr");
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<ProductCatalogOutput|null>(null);
  const [copied,setCopied]=useState("");

  async function generate() {
    if (busy) return;
    if (!name.trim() || !category.trim()) return onError("Katalog için ürün adı ve kategori gerekli.");
    setBusy(true); onError(""); setCopied("");
    try {
      const response=await fetch("/api/catalog",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        name:name.trim(),category:category.trim(),brand:brand.trim(),
        keywords:keywords.split(",").map(x=>x.trim()).filter(Boolean),marketplace,language
      })});
      const data=await response.json();
      if (!response.ok) throw new Error(data.error||"Katalog içeriği oluşturulamadı.");
      setResult(data.catalog as ProductCatalogOutput);
    } catch(e) { onError(e instanceof Error?e.message:"Katalog oluşturulamadı."); }
    finally { setBusy(false); }
  }

  async function copy(key:string,text:string) {
    try { await navigator.clipboard.writeText(text); setCopied(key); window.setTimeout(()=>setCopied(v=>v===key?"":v),1800); }
    catch { onError("Panoya kopyalama başarısız oldu."); }
  }

  return <section className="studio-section catalog-section">
    <div className="section-title-row"><div><p className="studio-kicker">4 · KATALOG & SEO</p><h2>Satış metnini hazırla</h2><p>Başlık, açıklama, etiket ve SEO anahtar kelimelerini tek seferde üret.</p></div><span className="optional-pill">OPSİYONEL</span></div>
    <details className="catalog-details"><summary>Ürün bilgilerini gir <span>⌄</span></summary>
      <div className="catalog-grid">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ürün adı *" />
        <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Kategori *" />
        <input value={brand} onChange={e=>setBrand(e.target.value)} placeholder="Marka · opsiyonel" />
        <input value={keywords} onChange={e=>setKeywords(e.target.value)} placeholder="Anahtar kelimeler · virgülle ayır" />
        <select value={marketplace} onChange={e=>setMarketplace(e.target.value as typeof marketplace)}><option value="etsy">Etsy</option><option value="trendyol">Trendyol</option><option value="hepsiburada">Hepsiburada</option><option value="amazon">Amazon</option><option value="generic">Genel mağaza</option></select>
        <select value={language} onChange={e=>setLanguage(e.target.value as typeof language)}><option value="tr">Türkçe</option><option value="en">English</option></select>
      </div>
      <button className="catalog-button" onClick={generate} disabled={busy}>{busy?"⏳ Hazırlanıyor…":"📝 Katalog metnini oluştur"}</button>
    </details>
    {result && <div className="catalog-result">
      <div className="copy-row"><b>{result.title}</b><button onClick={()=>copy("title",result.title)}>{copied==="title"?"✓ Kopyalandı":"Kopyala"}</button></div>
      <p>{result.shortDescription}</p><div className="copy-row"><b>Açıklama</b><button onClick={()=>copy("description",result.description)}>{copied==="description"?"✓ Kopyalandı":"Kopyala"}</button></div><p>{result.description}</p>
      <p><b>Etiketler:</b> {result.tags.join(" • ")}</p><p><b>SEO:</b> {result.seoKeywords.join(", ")}</p>
      <button className="copy-all" onClick={()=>copy("all",`Başlık: ${result.title}\n\nKısa açıklama: ${result.shortDescription}\n\nAçıklama: ${result.description}\n\nEtiketler: ${result.tags.join(", ")}\n\nSEO: ${result.seoKeywords.join(", ")}`)}>{copied==="all"?"✓ Tüm paket kopyalandı":"Tüm kataloğu kopyala"}</button>
    </div>}
  </section>;
}
