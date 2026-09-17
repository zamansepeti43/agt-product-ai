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

  return <section style={styles.card}>
    <div style={styles.head}><div><p style={styles.kicker}>4 • KATALOG / SEO</p><h2 style={styles.h2}>Satış metnini hazırla</h2><p style={styles.muted}>Başlık, açıklama, etiket ve SEO anahtar kelimelerini tek seferde üret.</p></div></div>
    <div style={styles.grid}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ürün adı *" />
      <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Kategori *" />
      <input value={brand} onChange={e=>setBrand(e.target.value)} placeholder="Marka (opsiyonel)" />
      <input value={keywords} onChange={e=>setKeywords(e.target.value)} placeholder="Anahtar kelimeler, virgülle ayır" />
      <select value={marketplace} onChange={e=>setMarketplace(e.target.value as typeof marketplace)}><option value="etsy">Etsy</option><option value="trendyol">Trendyol</option><option value="hepsiburada">Hepsiburada</option><option value="amazon">Amazon</option><option value="generic">Genel mağaza</option></select>
      <select value={language} onChange={e=>setLanguage(e.target.value as typeof language)}><option value="tr">Türkçe</option><option value="en">English</option></select>
    </div>
    <button style={styles.button} onClick={generate} disabled={busy}>{busy?"⏳ Hazırlanıyor…":"📝 Katalog metnini oluştur"}</button>
    {result && <div style={styles.result}>
      <div style={styles.row}><b>{result.title}</b><button style={styles.small} onClick={()=>copy("title",result.title)}>{copied==="title"?"✓ Kopyalandı":"Kopyala"}</button></div>
      <p>{result.shortDescription}</p>
      <div style={styles.row}><b>Açıklama</b><button style={styles.small} onClick={()=>copy("description",result.description)}>{copied==="description"?"✓ Kopyalandı":"Kopyala"}</button></div>
      <p>{result.description}</p>
      <p><b>Etiketler:</b> {result.tags.join(" • ")}</p>
      <p><b>SEO:</b> {result.seoKeywords.join(", ")}</p>
      <button style={styles.small} onClick={()=>copy("all",`Başlık: ${result.title}\n\nKısa açıklama: ${result.shortDescription}\n\nAçıklama: ${result.description}\n\nEtiketler: ${result.tags.join(", ")}\n\nSEO: ${result.seoKeywords.join(", ")}`)}>{copied==="all"?"✓ Tüm paket kopyalandı":"Tüm kataloğu kopyala"}</button>
    </div>}
  </section>;
}

const styles:Record<string,React.CSSProperties>={
  card:{background:"#fff",border:"1px solid #e4e5eb",borderRadius:22,padding:24,marginBottom:18,boxShadow:"0 8px 30px rgba(20,20,40,.04)"},
  head:{marginBottom:18},kicker:{fontSize:11,fontWeight:800,letterSpacing:1.4,color:"#777b8d",margin:"0 0 8px"},
  h2:{fontSize:24,margin:"0 0 5px",letterSpacing:-.7},muted:{color:"#747889",fontSize:13},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10},
  button:{width:"100%",border:0,borderRadius:14,padding:"15px 20px",background:"#171923",color:"#fff",fontWeight:800,fontSize:15,marginTop:14},
  result:{marginTop:14,padding:16,borderRadius:14,background:"#f6f6fa",lineHeight:1.6},row:{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:8},
  small:{border:"1px solid #dfe0e8",background:"#fff",borderRadius:10,padding:"8px 11px",fontWeight:700,whiteSpace:"nowrap"}
};
