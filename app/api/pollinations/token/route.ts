import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, clientId, redirectUri, codeVerifier } = body || {};

    if (
      typeof code !== "string" ||
      typeof clientId !== "string" ||
      !clientId.startsWith("pk_") ||
      typeof redirectUri !== "string" ||
      typeof codeVerifier !== "string"
    ) {
      return NextResponse.json({ error: "Geçersiz OAuth isteği." }, { status: 400 });
    }

    const tokenResponse = await fetch("https://enter.pollinations.ai/api/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
      cache: "no-store",
    });

    const text = await tokenResponse.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || "Pollinations token endpoint geçersiz yanıt verdi." };
    }

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: typeof data.error_description === "string" ? data.error_description : typeof data.error === "string" ? data.error : "Pollinations token alınamadı." },
        { status: tokenResponse.status },
      );
    }

    return NextResponse.json({ access_token: data.access_token, token_type: data.token_type });
  } catch {
    return NextResponse.json({ error: "Pollinations OAuth sunucusuna ulaşılamadı." }, { status: 502 });
  }
}
