import { cookies } from "next/headers";
import type { ProviderConfig } from "@/lib/ai/types";

const COOKIE_PREFIX = "agt-provider-";
const MAX_AGE = 30 * 24 * 60 * 60;
const PROVIDERS = new Set(["gemini","openai","custom-openai","cloudflare","aihorde","pollinations"]);

function cookieName(provider: string) {
  return COOKIE_PREFIX + provider;
}

export async function getProviderConfig(provider: string): Promise<ProviderConfig> {
  const id = provider.trim().toLowerCase();
  if (!PROVIDERS.has(id)) return {};
  const value = (await cookies()).get(cookieName(id))?.value;
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : undefined,
      accountId: typeof parsed.accountId === "string" ? parsed.accountId : undefined,
    };
  } catch {
    return {};
  }
}

export function setProviderCookie(response: { cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void } }, provider: string, config: ProviderConfig) {
  const id = provider.trim().toLowerCase();
  if (!PROVIDERS.has(id)) throw new Error("Desteklenmeyen AI provider.");
  const payload = JSON.stringify({
    apiKey: config.apiKey?.trim().slice(0, 1000) || undefined,
    accountId: config.accountId?.trim().slice(0, 200) || undefined,
  });
  response.cookies.set(cookieName(id), payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearProviderCookie(response: { cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void } }, provider: string) {
  const id = provider.trim().toLowerCase();
  if (!PROVIDERS.has(id)) throw new Error("Desteklenmeyen AI provider.");
  response.cookies.set(cookieName(id), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
