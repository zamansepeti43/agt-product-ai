import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getProviderConfig } from "@/lib/ai/provider-session";
import { configuredImageProviderId, generateWithConfiguredStrategy } from "@/lib/ai/provider";
import { getPreset, getVariationPrompt } from "@/lib/ai/presets";
import type { GenerationJob, ImageJobMode, ProviderConfig } from "@/lib/ai/types";
import type { ProviderConfigMap } from "@/lib/ai/router";
export const runtime = "nodejs";
export const maxDuration = 300;
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MODES = new Set<ImageJobMode>(["hero", "white", "studio", "lifestyle", "detail", "social"]);
const PROVIDERS = new Set(["gemini", "comfyui", "aihorde", "pollinations", "cloudflare", "openai", "custom-openai", "auto-free"]);
function readProviderConfig(formData: FormData) {
  const provider = String(formData.get("provider") || process.env.IMAGE_PROVIDER || "").trim().toLowerCase();
  const fallback: ProviderConfig = {
    model: String(formData.get("providerModel") || "").trim().slice(0, 160),
    baseUrl: String(formData.get("providerBaseUrl") || "").trim().slice(0, 500),
    accountId: String(formData.get("providerAccountId") || "").trim().slice(0, 160),
  };
  const configs: ProviderConfigMap = provider && provider !== "auto-free" ? { [provider]: fallback } : {};
  return { provider, configs };
}
export async function POST(request: Request) {
  try {
    const formData=await request.formData(); const file=formData.get("image"); const rawMode=String(formData.get("mode")??"hero"); const rawCount=Number(formData.get("count")??1); const customPrompt=String(formData.get("prompt")??"").trim().slice(0,1200); const {provider:providerId,configs}=readProviderConfig(formData);
    if (!(file instanceof File)) return NextResponse.json({error:"Ürün görseli gerekli."},{status:400}); if(!ALLOWED_TYPES.has(file.type)) return NextResponse.json({error:"Sadece JPG, PNG veya WEBP kabul edilir."},{status:415}); if(file.size===0||file.size>MAX_FILE_SIZE) return NextResponse.json({error:"Görsel 12 MB'dan küçük olmalı."},{status:413}); if(!MODES.has(rawMode as ImageJobMode)) return NextResponse.json({error:"Geçersiz üretim modu."},{status:400}); if(!Number.isInteger(rawCount)||rawCount<1||rawCount>10) return NextResponse.json({error:"Görsel sayısı 1 ile 10 arasında olmalı."},{status:400}); if(providerId&&!PROVIDERS.has(providerId)) return NextResponse.json({error:"Desteklenmeyen AI provider."},{status:400});
    if (providerId === "auto-free") {
      const storedHorde = await getProviderConfig("aihorde");
      if (storedHorde.apiKey) configs.aihorde = { apiKey: storedHorde.apiKey };
    }

    if (providerId && providerId !== "auto-free" && providerId !== "comfyui") {
      const stored = await getProviderConfig(providerId);
      configs[providerId] = { ...configs[providerId], apiKey: stored.apiKey, accountId: stored.accountId };
      if (providerId !== "aihorde" && !stored.apiKey) return NextResponse.json({error:"Bu AI provider bağlı değil. Önce API anahtarını bağla."},{status:401});
    }
    const mode=rawMode as ImageJobMode; const preset=getPreset(mode); const effectiveProviderId=providerId||configuredImageProviderId(); const hasStrategy=effectiveProviderId==="auto-free"||Boolean(effectiveProviderId); const prompt=getVariationPrompt(mode,0,customPrompt);
    const job:GenerationJob={id:randomUUID(),status:hasStrategy?"processing":"queued",mode,provider:effectiveProviderId||"not-configured",createdAt:new Date().toISOString(),message:hasStrategy?`${preset.label} üretimi başlatıldı.`:"Görsel doğrulandı. AI provider bağlantısı bekleniyor."};
    if(!hasStrategy) return NextResponse.json({job,input:{fileName:file.name,mimeType:file.type,sizeBytes:file.size,count:rawCount,preset}},{status:202});
    const height=["studio","lifestyle","detail","social"].includes(mode)?1280:1024;
    const indexes=Array.from({length:rawCount},(_,i)=>i);
    const assets=[];
    const skipped=[];
    for(let start=0;start<indexes.length;start+=3){
      const batch=indexes.slice(start,start+3);
      const results=await Promise.allSettled(batch.map(index=>generateWithConfiguredStrategy(effectiveProviderId,{sourceImage:file,fileName:file.name,mimeType:file.type,mode,prompt:getVariationPrompt(mode,index,customPrompt),width:1024,height,count:1},configs)));
      for(const item of results){
        if(item.status==="fulfilled"){assets.push(...item.value.assets); if(item.value.skipped.length) skipped.push(...item.value.skipped);}
        else if(start===0 && assets.length===0) throw item.reason;
      }
    }
    if(!assets.length) throw new Error("Hiç görsel üretilemedi.");
    if(assets.length<rawCount) throw new Error(`${assets.length}/${rawCount} farklı görsel üretilebildi. Eksik varyasyonları tamamlamak için tekrar dene.`);
    const providerUsed=effectiveProviderId==="auto-free" ? "auto-free" : effectiveProviderId;
    const message=""+assets.length+" farklı görsel üretildi.";
    return NextResponse.json({job:{...job,provider:providerUsed,status:"completed",message},assets,input:{fileName:file.name,mimeType:file.type,sizeBytes:file.size,count:rawCount,preset}});
  } catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Üretim sırasında bilinmeyen bir hata oluştu."},{status:500});}
}
