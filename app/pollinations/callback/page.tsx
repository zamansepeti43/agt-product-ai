"use client";

import { useEffect, useState } from "react";

export default function PollinationsCallbackPage() {
  const [message, setMessage] = useState("Pollinations bağlantısı tamamlanıyor…");

  useEffect(() => {
    const run = async () => {
      const query = new URLSearchParams(window.location.search);
      const code = query.get("code");
      const returnedState = query.get("state");
      const error = query.get("error");
      const expectedState = sessionStorage.getItem("agt-pollinations-state");
      const verifier = sessionStorage.getItem("agt-pollinations-pkce-verifier");
      const appKey = localStorage.getItem("agt-pollinations-app-key");
      const redirectUri = `${window.location.origin}/pollinations/callback`;

      if (error) {
        setMessage(error === "access_denied" ? "Pollinations bağlantısı iptal edildi." : `Pollinations bağlantısı başarısız: ${error}`);
        return;
      }

      if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
        setMessage("Pollinations bağlantısı doğrulanamadı. Lütfen tekrar bağlan.");
        return;
      }

      if (!verifier || !appKey?.startsWith("pk_")) {
        setMessage("OAuth oturumu eksik. Lütfen AGT içinden tekrar bağlan.");
        return;
      }

      try {
        const response = await fetch("/api/pollinations/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, clientId: appKey, redirectUri, codeVerifier: verifier }),
        });
        const data = await response.json();
        if (!response.ok || !data.access_token?.startsWith("sk_")) {
          throw new Error(data.error || "Token alınamadı.");
        }

        localStorage.setItem("agt-pollinations-user-key", data.access_token);
        sessionStorage.removeItem("agt-pollinations-state");
        sessionStorage.removeItem("agt-pollinations-pkce-verifier");
        setMessage("✓ Pollinations bağlandı. AGT Product AI'ya dönüyorsun…");
        window.setTimeout(() => window.location.replace("/?pollinations=connected"), 500);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Pollinations bağlantısı tamamlanamadı.");
      }
    };

    void run();
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
