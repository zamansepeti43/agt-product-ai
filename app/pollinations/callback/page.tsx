"use client";

import { useEffect, useState } from "react";

export default function PollinationsCallbackPage() {
  const [message, setMessage] = useState("Pollinations bağlantısı tamamlanıyor…");

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const apiKey = fragment.get("api_key");
    const error = fragment.get("error");

    if (apiKey?.startsWith("sk_")) {
      localStorage.setItem("agt-pollinations-user-key", apiKey);
      setMessage("✓ Pollinations bağlandı. AGT Product AI'ya dönüyorsun…");
      window.setTimeout(() => {
        window.location.replace("/?pollinations=connected");
      }, 500);
      return;
    }

    setMessage(error === "access_denied"
      ? "Pollinations bağlantısı iptal edildi."
      : "Pollinations bağlantı anahtarı alınamadı.");
  }, []);

  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#080a0f",color:"#fff",fontFamily:"system-ui"}}>
      <section style={{maxWidth:520,textAlign:"center",padding:32,border:"1px solid #262a36",borderRadius:24,background:"#11141d"}}>
        <div style={{fontSize:42,marginBottom:16}}>⚡</div>
        <h1 style={{margin:"0 0 10px"}}>Pollinations</h1>
        <p style={{color:"#a8afbf"}}>{message}</p>
      </section>
    </main>
  );
}
