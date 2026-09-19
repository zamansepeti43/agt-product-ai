const I={
tr:{brand:"PRODUCT AI",badge:"AI ile daha fazlasını üret ✨",h1:"Ürünün gücünü",h2:"görselleştir.",hero:"Profesyonel ürün görselleriyle satışlarını artır. Hızlı, kolay, etkili.",fast:"Hızlı üretim",quality:"Yüksek kalite",creative:"Sınırsız yaratıcılık",upload:"Ürün fotoğrafını yükle",formats:"JPG, PNG veya WEBP • Maks. 12 MB",choose:"Dosya Seç",prompt:"Ne tür bir görsel istiyorsun?",ph:"İsteğe bağlı açıklama…",all:"Tümü",ai:"AI Modeli",settings:"Görsel Ayarları",ratio:"Görsel oranı",count:"Görsel sayısı",free:"Ücretsiz",generate:"Görsel Üret",generating:"Görsel hazırlanıyor…",time:"Yaklaşık 10–30 saniye sürecektir",history:"Geçmiş",favorites:"Favoriler",home:"Ana Sayfa",settingsNav:"Ayarlar",addAI:"AI Ekle",freeFirst:"Ücretsiz öncelikli",paidFirst:"Ücretli öncelikli",manual:"Ben seçeyim",addTitle:"AI bağlantısı",save:"Bağlantıyı kaydet",name:"Bağlantı adı",key:"API anahtarı",model:"Model",base:"Base URL",account:"Account ID",secure:"🔒 Anahtar cihazda güvenli tutulur.",language:"Dil",notifications:"Üretim bildirimleri",notifyOn:"Görsel hazır olduğunda bildirim gönder",done:"Görsel hazır",notifyText:"Görsel üretildi. Sonuçlarını uygulamada görebilirsin.",download:"İndir",needFile:"Önce bir ürün fotoğrafı seç.",needAI:"Önce bir AI motoru bağla.",error:"Üretim tamamlanamadı: ",app:"AGT Studio • Product AI"},
en:{brand:"PRODUCT AI",badge:"Create more with AI ✨",h1:"Visualize your",h2:"product's power.",hero:"Create professional product visuals that help you sell. Fast, simple, effective.",fast:"Fast generation",quality:"High quality",creative:"Unlimited creativity",upload:"Upload product photo",formats:"JPG, PNG or WEBP • Max. 12 MB",choose:"Choose File",prompt:"What visual do you want?",ph:"Optional description…",all:"All",ai:"AI Model",settings:"Image Settings",ratio:"Aspect ratio",count:"Image count",free:"Free",generate:"Generate Image",generating:"Preparing image…",time:"Usually takes 10–30 seconds",history:"History",favorites:"Favorites",home:"Home",settingsNav:"Settings",addAI:"Add AI",freeFirst:"Free first",paidFirst:"Paid first",manual:"I'll choose",addTitle:"AI connection",save:"Save connection",name:"Connection name",key:"API key",model:"Model",base:"Base URL",account:"Account ID",secure:"🔒 Your key is stored securely on this device.",language:"Language",notifications:"Generation notifications",notifyOn:"Notify me when an image is ready",done:"Image ready",notifyText:"Image generated. You can view it in the app.",download:"Download",needFile:"Choose a product photo first.",needAI:"Connect an AI engine first.",error:"Generation failed: ",app:"AGT Studio • Product AI"}};
const RECIPES={
hero:{tr:"Satışa Hazır",en:"Ready to Sell",icon:"🛍️",ratio:"1:1",prompt:"Create a premium commercial e-commerce image from the supplied product reference. First silently identify what the product is and its real-world use. Preserve exact product identity, geometry, proportions, materials, colors, labels and visible details. Then choose a realistic sales scene appropriate to that product category. Do not invent product features."},
white:{tr:"Beyaz Arka Plan",en:"Marketplace",icon:"✨",ratio:"1:1",prompt:"Create a marketplace-ready product photograph from the supplied reference. First identify the product and preserve its exact identity, geometry, proportions, materials, colors and visible details. Use a clean white-background composition with a professional angle, realistic contact shadow and high-key studio lighting. No invented product features, no text or watermark."},
studio:{tr:"Profesyonel Stüdyo",en:"Studio",icon:"📸",ratio:"4:5",prompt:"Create a premium professional studio photograph from the supplied product reference. First identify the product category and the visual language normally used to sell it. Preserve exact product identity, geometry, proportions, materials, colors and details. Build a refined studio set with realistic lighting, depth and a distinct composition. Do not invent product features, text or watermark."},
lifestyle:{tr:"Gerçek Kullanım",en:"Lifestyle",icon:"🏠",ratio:"4:5",prompt:"Create a photorealistic lifestyle commercial image from the supplied product reference. First determine what the product is, who normally uses it, where it is used and how it is naturally presented. Show the product in an authentic real-world context appropriate to that category, while keeping the product clearly recognizable and visually dominant. Preserve exact product identity and details. Human presence is allowed when it makes genuine sense for the product; never add people merely for decoration. No invented product features, text or watermark."},
detail:{tr:"Detay & Özellik",en:"Detail",icon:"🔍",ratio:"4:5",prompt:"Create a premium product-detail commercial photograph from the supplied reference. First identify the product's most useful visual selling points such as material, texture, construction, compartments, controls, finish or craftsmanship. Preserve exact product geometry, proportions, materials, colors and details. Use a close but useful composition that communicates a real feature without inventing one. Photorealistic, sharp, commercial, no text or watermark."},
social:{tr:"Sosyal Medya",en:"Social Ad",icon:"📱",ratio:"4:5",prompt:"Create a polished social-media advertising image from the supplied product reference. First identify the product category, target customer and natural usage context. Create a visually strong but believable commercial scene tailored to that product. Preserve exact product identity, geometry, materials, colors and visible details. Leave useful negative space for later design work. Human presence is allowed when contextually appropriate. No generated text, badges or watermark."}};
const SCENE_VARIATIONS=[
"Hero: eye-level three-quarter product presentation with premium commercial lighting.",
"Hero: low camera angle giving the product visual authority while preserving realistic scale.",
"Hero: elevated camera angle with refined composition and natural soft shadow.",
"Hero: centered catalog composition with generous breathing room and crisp separation.",
"Hero: asymmetric premium composition with intentional negative space.",
"Hero: close editorial crop while keeping the complete product clearly recognizable.",
"Hero: wide environmental presentation showing the product's natural surroundings.",
"Hero: subtle foreground/background depth with realistic lens perspective.",
"Hero: restrained logical props that belong to the actual product category.",
"Hero: strongest natural commercial presentation for this exact product.",
"Studio: soft gray seamless sweep, large softbox and realistic contact shadow.",
"Studio: warm ivory studio environment with gentle side lighting.",
"Studio: cool neutral studio environment with crisp edges and soft fill.",
"Studio: premium tabletop studio scene using a surface appropriate to the product.",
"Studio: dramatic side light revealing real texture and geometry.",
"Studio: high-key editorial lighting with a subtle gradient background.",
"Studio: low-key premium lighting with controlled highlights.",
"Studio: top-down studio composition when physically appropriate.",
"Studio: three-quarter editorial camera with believable shallow depth of field.",
"Studio: luxury catalog composition with precise product placement.",
"Lifestyle: place the product in the most natural real-world environment for its category.",
"Lifestyle: show the environment where the target customer normally encounters the product.",
"Lifestyle: use contextual objects that communicate believable scale.",
"Lifestyle: natural morning-light interpretation suited to the product.",
"Lifestyle: warm afternoon/evening interpretation suited to the product.",
"Lifestyle: authentic active-use moment only when the product genuinely benefits from interaction.",
"Lifestyle: quiet everyday scene with the product naturally integrated.",
"Lifestyle: premium editorial lifestyle scene with realistic depth.",
"Lifestyle: wider environmental scene communicating place, purpose and scale.",
"Lifestyle: strongest believable use-case scene for this exact product.",
"Detail: macro-style material texture using only details visible in the reference.",
"Detail: close-up of real construction such as stitching, seams, joints or edges.",
"Detail: close-up of a functional component such as a handle, control, compartment or closure.",
"Detail: close-up emphasizing finish, transparency or material quality when visible.",
"Detail: three-quarter detail view showing how real components connect.",
"Detail: top-down detail composition when useful for the actual product.",
"Detail: side-lit detail shot revealing genuine texture without invention.",
"Detail: shallow-depth editorial detail with the real feature sharply resolved.",
"Detail: premium catalog feature shot communicating one useful selling point.",
"Detail: most informative real detail visible in the reference.",
"Social: bold clean advertising composition with strong product hierarchy.",
"Social: minimal gradient campaign background with generous copy-safe negative space.",
"Social: lifestyle-inspired social advertisement matched to the product category.",
"Social: asymmetric composition designed for modern social-media advertising.",
"Social: close product crop optimized for visual impact.",
"Social: wide composition with intentional copy-safe negative space.",
"Social: premium editorial/fashion treatment when appropriate.",
"Social: natural-use advertising scene when appropriate to the product.",
"Social: seasonal/time-of-day campaign treatment only when relevant.",
"Social: strongest believable social-media selling scenario for this exact product."
];
function intelligentPrompt(recipeId,index=0,extra=""){
const base=RECIPES[recipeId]?.prompt||RECIPES.hero.prompt;
const scene=SCENE_VARIATIONS[index%SCENE_VARIATIONS.length];
return base+"\n\nPRODUCT INTELLIGENCE: Analyze the supplied reference before generating. Silently classify the product and infer its likely customer, environment and natural use. Build a COMPLETE PHOTOGRAPHIC SCENE around the product; do not simply cut out the product and place it on a flat background. Examples: if it is a school backpack, show it naturally worn by a school-age child or teenager on the way to school when appropriate, keeping the backpack clearly visible; if it is a book, place it naturally on a desk, reading table, bedside table or study environment with believable scale and lighting; if it is cookware, show it in a realistic kitchen context; if it is jewelry, use an elegant fashion/editorial context; if it is footwear, show a realistic fashion or walking context; if it is stationery, show a desk/workspace context. These are examples, not fixed rules—always infer from the actual reference. Never force an unrelated scene.\n\nCOMPOSITION RULES: Do NOT center the product by default. Use a professional rule-of-thirds composition, placing the product left or right of center and leaving meaningful environmental space around it. Show a believable surface, background depth, foreground/background elements, contact shadow, reflections and atmospheric lighting appropriate to the product. The final image should look like a real commercial photograph taken on location or in a designed studio set, not a cropped product cutout. Do not crop the product, do not zoom it to fill the frame, and do not make the product occupy most of the image.\n\nFRAGRANCE SPECIAL RULE: If the reference is a perfume or fragrance bottle, create a complete luxury fragrance campaign scene around the exact bottle. Preserve the bottle silhouette, cap, glass, liquid color, label and visible details. Use a sophisticated environment such as dark marble, satin fabric, stone, flowers, soft mist, warm/cool cinematic light or elegant architectural surfaces according to the product mood. Place the bottle clearly off-center using the rule of thirds, approximately one-third of the frame, with the scene extending naturally around it. The bottle must sit on a real surface with believable contact shadow and reflections; never float, isolate, crop or paste it onto a plain gradient.\n\n"+scene+"\n\nVARIATION RULE: Make this image materially different from other requested variations in camera angle, composition, environment, lighting or use context while keeping the exact same product. Do not redesign, merge, duplicate or alter the product. No hallucinated features, labels, logos, text or watermark."+(extra.trim()?"\n\nAdditional user direction: "+extra.trim():"");
}
const MODEL_CATALOG={
pollinations:["Qwen Image 3","Qwen Image","FLUX.1 Schnell","FLUX.2 Klein 4B","FLUX.1 Kontext Pro","GPT Image 2","GPT Image 1.5","GPT Image 1 Mini","Grok Imagine","Grok Imagine Image 2.0","Grok Imagine Pro","Ideogram 4.0 Balanced","Ideogram 4.0 Quality","Ideogram 4.0 Turbo","Krea 2","Nano Banana","Nano Banana 2","Nano Banana 2 Lite","Nano Banana Pro","Recraft V4.1","Seedream 4.0","Seedream 4.5","Seedream 5.0 Lite","Seedream 5.0 Pro","Wan 2.7 Image","Wan 2.7 Image Pro","Z-Image Turbo","Lucid Origin","DreamShaper 8 LCM"],
aihorde:["AlbedoBase XL (SDXL)","AlbedoBase XL v2","Animagine XL 3.1","Anything Diffusion XL","Deliberate","DreamShaper XL1.0","Juggernaut XL","RealVisXL V4.0","SDXL 1.0","Stable Diffusion 1.5","Pony Diffusion V6 XL"],
gemini:["gemini-3.1-flash-image","gemini-3.1-flash-lite-image","gemini-3-pro-image","gemini-2.5-flash-image","imagen-4.0-generate"],
openai:["gpt-image-2","gpt-image-1.5","gpt-image-1","gpt-image-1-mini","dall-e-3"],
cloudflare:["@cf/runwayml/stable-diffusion-v1-5-img2img","@cf/lykon/dreamshaper-8-lcm","@cf/bytedance/stable-diffusion-xl-lightning","@cf/black-forest-labs/flux-1-schnell","@cf/black-forest-labs/flux-1-dev"],
custom:[],
generic:[],
comfyui:["Qwen Image Edit","Qwen Image","Flux.1 Kontext","SDXL"],
puter:["openai/gpt-image-2.5-flare","openai/gpt-image-2","google/gemini-3.1-flash-image-preview","qwen/qwen-image-2.0-pro","black-forest-labs/flux-2-pro","black-forest-labs/flux-2-klein-9b-base","x-ai/grok-imagine-image"]
};
const MODEL_CACHE_KEY="agt-model-cache";
function isFreeModel(pid,id){return pid==="puter"&&/:free$/i.test(String(id||""))}
function renderModelOptions(pid,list){
  const safe=[...new Set((list||[]).filter(Boolean))];
  if(pid!=="puter")return safe.map(x=>"<option value=\""+esc(x)+"\">"+esc(x)+"</option>").join("");
  const free=safe.filter(x=>isFreeModel(pid,x)),other=safe.filter(x=>!isFreeModel(pid,x));
  let h="";
  if(free.length)h+="<optgroup label=\"🆓 Ücretsiz (sağlayıcı kotası)\">"+free.map(x=>"<option value=\""+esc(x)+"\">"+esc(String(x).replace(/:free$/i,""))+"</option>").join("")+"</optgroup>";
  if(other.length)h+="<optgroup label=\"Puter modelleri\">"+other.map(x=>"<option value=\""+esc(x)+"\">"+esc(x)+"</option>").join("")+"</optgroup>";
  if(!h)h="<option value=\"\">Ücretsiz model bulunamadı</option>";
  return h;
}
function cachedModels(pid){const all=read(MODEL_CACHE_KEY)||{};return Array.isArray(all[pid])?all[pid]:[]}
function saveModels(pid,list){const all=read(MODEL_CACHE_KEY)||{};all[pid]=list;write(MODEL_CACHE_KEY,all)}
function normalizeModels(data,pid){
let raw=[];
if(Array.isArray(data))raw=data;
else if(Array.isArray(data?.data))raw=data.data;
else if(Array.isArray(data?.models))raw=data.models;
else if(Array.isArray(data?.result))raw=data.result;
raw=raw.map(x=>typeof x==="string"?x:(x?.id||x?.name||x?.model||x?.model_id||x?.base_model_id||"")).filter(Boolean);
if(pid==="gemini")raw=raw.filter(x=>/image|imagen|nano.?banana/i.test(x));
if(pid==="openai"||pid==="generic"||pid==="custom")raw=raw.filter(x=>/image|dall-e|flux|sdxl|qwen|ideogram|recraft|seedream|grok|kontext|banana/i.test(x));
if(pid==="cloudflare")raw=raw.filter(x=>/image|flux|stable-diffusion|dreamshaper|sdxl|qwen|recraft|ideogram/i.test(x));
return [...new Set(raw)].sort((a,b)=>a.localeCompare(b));
}
async function fetchProviderModels(pid,old){
let url="",headers={},p=provider(pid);
if(pid==="pollinations")return MODEL_CATALOG.pollinations.slice();
else if(pid==="aihorde")url="https://aihorde.net/api/v2/status/models";
else if(pid==="gemini")url="https://generativelanguage.googleapis.com/v1beta/models?key="+encodeURIComponent(old.key);
else if(pid==="openai")url=(old.baseUrl||"https://api.openai.com/v1").replace(/\/$/,"")+"/models";
else if(pid==="cloudflare"){if(!old.accountId||!old.key)throw Error("Cloudflare Account ID ve API Token gerekli");url="https://api.cloudflare.com/client/v4/accounts/"+encodeURIComponent(old.accountId)+"/ai/models/search?per_page=100&task=text-to-image";headers.Authorization="Bearer "+old.key}
else if(pid==="custom"||pid==="generic"){url=(old.baseUrl||"").replace(/\/$/,"")+"/models";if(old.key)headers.Authorization="Bearer "+old.key}
else if(pid==="puter"){
  try{
    const r=await fetch("https://api.puter.com/puterai/image/models/details",{cache:"no-store"});
    const d=await r.json();
    const raw=Array.isArray(d?.models)?d.models:(Array.isArray(d)?d:[]);
    const ids=[];
    raw.forEach(x=>{
      const id=typeof x==="string"?x:(x?.id||x?.model||x?.model_id||"");
      if(id)ids.push(id);
      if(Array.isArray(x?.variants))x.variants.forEach(v=>{const vid=typeof v==="string"?v:(v?.id||v?.model||"");if(vid)ids.push(vid)});
    });
    const list=[...new Set(ids.filter(Boolean))];
    if(list.length){
      const free=list.filter(x=>/:free$/i.test(x));
      const merged=[...free,...MODEL_CATALOG.puter,...list.filter(x=>!free.includes(x)&&!MODEL_CATALOG.puter.includes(x))];
      saveModels(pid,merged);
      return merged;
    }
  }catch(e){}
  return MODEL_CATALOG.puter.slice();
}
else return MODEL_CATALOG[pid]||[];
const r=await fetch(url,{headers});const d=await r.json();if(!r.ok)throw Error(d?.error?.message||d?.message||"Model listesi alınamadı");let list=normalizeModels(d,pid);
if(pid==="cloudflare"&&!list.length){const r2=await fetch("https://api.cloudflare.com/client/v4/accounts/"+encodeURIComponent(old.accountId)+"/ai/models/search?per_page=100&task=image-to-image",{headers});const d2=await r2.json();if(r2.ok)list=normalizeModels(d2,pid)}
if(list.length){saveModels(pid,list);return list}
throw Error("Görsel modeli bulunamadı")
}
async function refreshModelSelect(pid,old){
const sel=$("#model");const status=$("#modelStatus");if(!sel)return;
const fallback=[...new Set([...(pid==="pollinations"?MODEL_CATALOG[pid]:cachedModels(pid)),...(MODEL_CATALOG[pid]||[]),...(pid==="pollinations"?"":old&&old.model)].filter(Boolean))];
sel.innerHTML=renderModelOptions(pid,fallback);
const defaultModel=pid==="pollinations"?"qwen-image-3":(old&&old.model)||fallback[0]||"";
if(defaultModel&&fallback.includes(defaultModel))sel.value=defaultModel;
if(status)status.textContent="Model listesi yükleniyor…";
try{const list=await fetchProviderModels(pid,old);sel.innerHTML=renderModelOptions(pid,list);if(old&&list.includes(old.model))sel.value=old.model;else if(list[0])sel.value=list[0];const freeCount=list.filter(x=>isFreeModel(pid,x)).length;if(status)status.textContent=pid==="puter"?(freeCount?freeCount+" ücretsiz model bulundu":"Ücretsiz :free varyantı şu an yayınlanmıyor • diğer Puter modelleri hazır"):list.length+" model bulundu";}catch(e){if(status)status.textContent="Hazır liste kullanılıyor";}}
const PROVIDERS=[["pollinations","Pollinations","⚡",true,true,"qwen-image-3"],["aihorde","AI Horde","🌐",true,false,"AlbedoBase XL (SDXL)"],["puter","Puter AI","🚀",true,false,"openai/gpt-image-2.5-flare"],["gemini","Google Gemini","✨",false,true,"gemini-3.1-flash-image"],["openai","OpenAI","◉",false,true,"gpt-image-1"],["cloudflare","Cloudflare AI","☁️",false,true,"@cf/runwayml/stable-diffusion-v1-5-img2img"],["custom","Özel OpenAI","🔌",false,true,""],["generic","OpenAI uyumlu / Özel API","🔗",false,true,""],["comfyui","Yerel ComfyUI","🖥️",true,false,"Qwen Image Edit"]];
let state={file:null,recipe:"hero",slots:(read("provider-slots")||[]).filter(s=>{const p=PROVIDERS.find(x=>x[0]===s.provider);return p&&(!p[4]||s.key)}),selected:null,mode:read("provider-mode")||"free",count:1,ratio:"1:1",busy:false,results:[],error:"",history:Array.isArray(read("agt-history"))?read("agt-history"):[],favorites:Array.isArray(read("agt-favorites"))?read("agt-favorites"):[],nav:"home",extra:read("extra")||"",lang:read("agt-lang")||"tr",notify:read("agt-notify")!==false};
const $=s=>document.querySelector(s),L=()=>I[state.lang],provider=id=>PROVIDERS.find(p=>p[0]===id),esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function read(k){try{if(window.AGTNativeVault){const v=window.AGTNativeVault.get(k);return v?JSON.parse(v):null}}catch(e){}try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}}
function write(k,v){try{if(window.AGTNativeVault){window.AGTNativeVault.set(k,JSON.stringify(v));return}}catch(e){}try{if(k==="provider-slots"&&Array.isArray(v)){const safe=v.map(({key,...rest})=>rest);localStorage.setItem(k,JSON.stringify(safe));return}localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function toast(x,type){const e=$("#toast");if(e){e.textContent=x;e.className="toast show "+(type||"");clearTimeout(window.__toast);window.__toast=setTimeout(()=>e.className="toast",3000)}}
function nativeNotify(title,text){if(state.notify&&window.AGTNative&&window.AGTNative.notify)window.AGTNative.notify(title,text)}
function promptText(index=0){return intelligentPrompt(state.recipe,index,state.extra)}
function mountApp(){
const t=L(),A=$("#app");
A.innerHTML='<div class="app-shell"><header class="topbar"><div class="brand"><div><strong>AGT <em>Studio</em></strong><small>'+t.brand+'</small></div></div><div class="top-actions"><button class="lang" id="langBtn" aria-label="Dil"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21M12 3c-2.2 2.4-3.3 5.4-3.3 9S9.8 18.6 12 21"></path></svg><span>'+state.lang.toUpperCase()+'</span><i>⌄</i></button><button class="icon-btn" id="settingsBtn" aria-label="Ayarlar">⚙</button></div></header><main><section class="hero"><div class="hero-copy"><div class="badge">'+t.badge+'</div><h1><span class="hero-title-line">'+(state.lang==="tr"?"Ürünün":"Visualize")+'</span><br><span class="hero-title-line">'+(state.lang==="tr"?"gücünü":"your product’s")+'</span><br><span class="hero-title-line">'+(state.lang==="tr"?"göster.":"power.")+'</span></h1><p>'+t.hero+'</p><div class="benefits"><span>✓ '+t.fast+'</span><span>✓ '+t.quality+'</span><span>✓ '+t.creative+'</span></div></div><div class="hero-art"><div class="hero-product-scene" role="img" aria-label="Premium parfüm ürün sahnesi"></div></div></section><section class="upload-card" id="upload"><input id="file" type="file" accept="image/jpeg,image/png,image/webp"><div class="upload-icon">↥</div><h3 id="fname">'+(state.file?esc(state.file.name):t.upload)+'</h3><p>'+t.formats+'</p><button id="pick" class="outline-btn">▧ &nbsp; '+t.choose+'</button></section><section class="styles-row" id="recipes"></section><section class="prompt-card"><div class="prompt-title">✦ <span>'+t.prompt+'</span><small id="counter">'+state.extra.length+'/500</small></div><textarea id="extra" maxlength="500" placeholder="'+t.ph+'">'+esc(state.extra)+'</textarea><div class="prompt-tags" id="tags"></div></section><section class="two-col"><div class="panel ai-panel"><div class="panel-head"><span>◉ &nbsp;'+t.ai+'</span><button id="add">'+t.addAI+' ＋</button></div><div id="slots"></div></div><div class="panel"><div class="panel-head"><span>▧ &nbsp;'+t.settings+'</span></div><label class="field-label">'+t.ratio+'<select id="ratio"><option>1:1</option><option>4:5</option><option>16:9</option><option>9:16</option></select></label><label class="field-label">'+t.count+'<select id="count"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option></select></label></div></section><button class="generate" id="generate"><span>✦ &nbsp; '+(state.busy?t.generating:t.generate)+'</span><small>'+t.time+'</small><b>›</b></button><section class="results-card" id="resultsCard" style="display:'+(state.results.length?"block":"none")+'"><div class="panel-head"><span>✦ &nbsp;'+t.done+'</span></div><div class="results" id="results"></div></section></main><nav class="bottom-nav"><button id="bottomHome" class="active" aria-label="'+t.home+'"><span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8v9.1a1 1 0 0 1-1 1h-5.2v-6.4H9.2v6.4H4a1 1 0 0 1-1-1z"></path></svg></span><span>'+t.home+'</span></button><button id="bottomHistory" aria-label="'+t.history+'"><span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7v5l3 2"></path></svg></span><span>'+t.history+'</span></button><button id="bottomFavorites" aria-label="'+t.favorites+'"><span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 20-1.3-1.2C6 14.5 3 11.8 3 8.4 3 5.9 4.9 4 7.4 4c1.4 0 2.8.7 3.6 1.8C11.8 4.7 13.2 4 14.6 4 17.1 4 19 5.9 19 8.4c0 3.4-3 6.1-7.7 10.4z"></path></svg></span><span>'+t.favorites+'</span></button><button id="bottomSettings" aria-label="'+t.settingsNav+'"><span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.8a2 2 0 0 1 2 2v.4l1.5.7.3-.2a2 2 0 1 1 2.8 2.8l-.2.3.7 1.5h.4a2 2 0 1 1 0 4h-.4l-.7 1.5.2.3a2 2 0 1 1-2.8 2.8l-.3-.2-1.5.7v.4a2 2 0 1 1-4 0v-.4l-1.5-.7-.3.2a2 2 0 1 1-2.8-2.8l.2-.3-.7-1.5h-.4a2 2 0 1 1 0-4h.4l.7-1.5-.2-.3A2 2 0 1 1 9.4 7l.3.2 1.5-.7v-.4a2 2 0 0 1 .8-1.6"></path><circle cx="12" cy="12" r="3"></circle></svg></span><span>'+t.settingsNav+'</span></button></nav><div class="toast" id="toast"></div></div><div class="modal hidden" id="modal"><div class="sheet"><div class="sheet-head"><div><small>AGT STUDIO</small><h2 id="sheetTitle"></h2></div><button id="close">×</button></div><div id="sheetBody"></div></div></div>';
$("#ratio").value=state.ratio;$("#count").value=state.count;renderRecipes();renderTags();renderSlots();renderResults();bind()}
let uiMounted=false;
let uiLang=null;
let uiRecipe=null;
let uiSlotsKey="";
let uiResultsKey="";
function render(){
  if(!uiMounted){
    mountApp();
    uiMounted=true;
    uiLang=state.lang;
    uiRecipe=state.recipe;
    uiSlotsKey="";
    uiResultsKey="";
    return;
  }
  renderNav();
  if(uiLang!==state.lang){
    mountApp();
    uiLang=state.lang;
    uiRecipe=state.recipe;
    uiSlotsKey="";
    uiResultsKey="";
    return;
  }
  const fileName=$("#fname"); if(fileName) fileName.textContent=state.file?esc(state.file.name):L().upload;
  const extra=$("#extra"); if(extra && extra.value!==state.extra) extra.value=state.extra;
  const counter=$("#counter"); if(counter) counter.textContent=state.extra.length+"/500";
  const ratio=$("#ratio"); if(ratio && ratio.value!==state.ratio) ratio.value=state.ratio;
  const count=$("#count"); if(count && count.value!==String(state.count)) count.value=String(state.count);
  const gen=$("#generate");
  if(gen){
    const t=L();
    const span=gen.querySelector("span"), small=gen.querySelector("small");
    if(span) span.textContent="✦  "+(state.busy?t.generating:t.generate);
    if(small) small.textContent=t.time;
    gen.disabled=!!state.busy;
    gen.setAttribute("aria-busy",state.busy?"true":"false");
  }
  if(uiRecipe!==state.recipe){
    renderRecipes();
    uiRecipe=state.recipe;
  }
  const slotsKey=state.slots.map(x=>x.id+":"+x.provider+":"+x.model).join("|")+"|"+state.selected+"|"+state.mode;
  if(uiSlotsKey!==slotsKey){
    renderSlots();
    uiSlotsKey=slotsKey;
  }
  const resultsKey=state.results.length+":"+state.results.map(x=>x.url?x.url.length:0).join(",");
  if(uiResultsKey!==resultsKey){
    renderResults();
    uiResultsKey=resultsKey;
    const card=$("#resultsCard"); if(card) card.style.display=state.results.length?"block":"none";
  }
}
function renderRecipes(){const box=$("#recipes");if(!box)return;box.replaceChildren();Object.entries(RECIPES).forEach(([id,r])=>{const b=document.createElement("button");b.className="style-card "+(state.recipe===id?"active":"");b.innerHTML="<strong>"+r.icon+"</strong><span>"+(state.lang==="tr"?r.tr:r.en)+"</span>";b.onclick=()=>{state.recipe=id;state.ratio=r.ratio;render()};box.appendChild(b)});const b=document.createElement("button");b.className="style-card";b.innerHTML="<strong>••</strong><span>"+L().all+"</span>";box.appendChild(b)}
function renderTags(){const box=$("#tags");if(!box)return;box.replaceChildren();["promptTags"].forEach(()=>["White background","Natural light","Premium look","Social media"].forEach((x,i)=>{const names=state.lang==="tr"?["Beyaz arka plan","Doğal ışık","Premium görünüm","Sosyal medya"]:["White background","Natural light","Premium look","Social media"];const b=document.createElement("button");b.textContent=names[i];b.onclick=()=>{$("#extra").value=($("#extra").value?$("#extra").value+", ":"")+names[i];state.extra=$("#extra").value;write("extra",state.extra);$("#counter").textContent=state.extra.length+"/500"};box.appendChild(b)}))}
function removeProvider(id){const item=state.slots.find(x=>x.id===id);if(!item)return;state.slots=state.slots.filter(x=>x.id!==id);if(state.selected===id)state.selected=state.slots[0]?.id||null;write("provider-slots",state.slots);render();toast("✓ AI bağlantısı kaldırıldı","success")}
function renderSlots(){const box=$("#slots");if(!box)return;box.replaceChildren();if(!state.slots.length){box.innerHTML='<div class="empty-ai"><b>'+L().needAI+'</b><button id="emptyAdd">'+L().addAI+' ＋</button></div>';$("#emptyAdd").onclick=openProviderModal;return}state.slots.forEach(s=>{const p=provider(s.provider);if(!p)return;const wrap=document.createElement("div");wrap.className="ai-slot-wrap";const b=document.createElement("button");b.className="ai-slot "+(state.mode==="manual"&&state.selected===s.id?"active":"");b.innerHTML='<span class="ai-icon">'+p[2]+'</span><div><b>'+esc(s.label||p[1])+'</b><small>'+esc(s.model||p[5]||"Ready")+'</small></div><i>'+(p[3]?L().free:"API")+'</i><em>›</em>';b.onclick=()=>{state.selected=s.id;state.mode="manual";write("provider-mode","manual");render()};const del=document.createElement("button");del.className="ai-remove";del.type="button";del.textContent="×";del.title="Bağlantıyı kaldır";del.onclick=e=>{e.stopPropagation();removeProvider(s.id)};wrap.append(b,del);box.appendChild(wrap)});const m=document.createElement("div");m.className="strategy";m.innerHTML='<span>⚙</span><div><b>AI selection</b><small>'+({free:L().freeFirst,paid:L().paidFirst,manual:L().manual}[state.mode])+'</small></div><select id="strategy"><option value="free">'+L().freeFirst+'</option><option value="paid">'+L().paidFirst+'</option><option value="manual">'+L().manual+'</option></select>';box.appendChild(m);m.querySelector("select").value=state.mode;m.querySelector("select").onchange=e=>{state.mode=e.target.value;state.selected=null;write("provider-mode",state.mode);render()}}
function renderResults(){const box=$("#results");if(!box)return;box.replaceChildren();if(state.error){const card=document.createElement("div");card.className="result-error";const icon=document.createElement("div");icon.className="result-error-icon";icon.textContent="!";const title=document.createElement("strong");title.textContent="Görsel oluşturulamadı";const msg=document.createElement("p");msg.textContent=state.error;const hint=document.createElement("small");hint.textContent=state.error.toLowerCase().includes("bakiye")||state.error.toLowerCase().includes("balance")?"Pollinations hesabındaki Pollen bakiyeni kontrol et.":"Bağlantını ve seçtiğin AI modelini kontrol edip tekrar dene.";card.append(icon,title,msg,hint);box.appendChild(card);return}state.results.forEach((x,i)=>{const f=document.createElement("figure"),img=document.createElement("img"),actions=document.createElement("div"),b=document.createElement("button"),fav=document.createElement("button");f.className="result-item";img.loading="lazy";img.decoding="async";img.alt="Üretilen ürün görseli";img.src=x.url;img.onerror=()=>{if(!f.dataset.failed){f.dataset.failed="1";img.style.display="none";const e=document.createElement("div");e.className="result-image-error";e.textContent="Görsel yüklenemedi";f.insertBefore(e,actions)}};actions.className="result-actions";b.textContent=L().download;b.onclick=()=>download(x,i);fav.className="favorite-btn "+(isFavorite(x)?"on":"");fav.textContent=isFavorite(x)?"♥":"♡";fav.title=isFavorite(x)?"Favoriden çıkar":"Favorilere ekle";fav.onclick=()=>toggleFavorite(x);actions.append(b,fav);f.append(img,actions);box.appendChild(f)})}
function renderNav(){
  const map={bottomHome:"home",bottomHistory:"history",bottomFavorites:"favorites",bottomSettings:"settings"};
  Object.entries(map).forEach(([id,key])=>{const b=$("#"+id);if(b)b.classList.toggle("active",state.nav===key)});
}
function librarySafe(items){return (Array.isArray(items)?items:[]).filter(x=>x&&x.url&&typeof x.url==="string")}
function persistLibrary(){
  const trim=items=>librarySafe(items).slice(0,20).map(x=>({...x,url:x.url.length>700000?"":x.url})).filter(x=>x.url);
  write("agt-history",trim(state.history));
  write("agt-favorites",trim(state.favorites));
}
function addHistory(){
  const now=Date.now();
  state.results.forEach((x,i)=>{if(!x.id)x.id=(crypto.randomUUID?crypto.randomUUID():String(now+i)+"-"+Math.random().toString(36).slice(2));x.createdAt=now+i;x.recipe=state.recipe});
  state.history=[...state.results,...state.history].slice(0,20);
  persistLibrary();
}
function isFavorite(item){return state.favorites.some(x=>x.id===item.id)}
function toggleFavorite(item){
  if(isFavorite(item))state.favorites=state.favorites.filter(x=>x.id!==item.id);
  else state.favorites=[item,...state.favorites].slice(0,20);
  persistLibrary();
  renderResults();
  if(state.nav==="favorites")renderLibrary("favorites");
}
function openLibrary(kind){
  state.nav=kind;
  const t=L();
  $("#modal").classList.remove("hidden");
  $("#sheetTitle").textContent=kind==="history"?t.history:t.favorites;
  $("#sheetBody").replaceChildren();
  renderLibrary(kind);
  $("#close").onclick=()=>{$("#modal").classList.add("hidden");state.nav="home";renderNav()};
  renderNav();
}
function renderLibrary(kind){
  const body=$("#sheetBody");if(!body)return;
  body.replaceChildren();
  const items=librarySafe(kind==="history"?state.history:state.favorites);
  if(!items.length){
    const empty=document.createElement("div");empty.className="library-empty";
    empty.innerHTML="<strong>"+(kind==="history"?"Henüz geçmiş yok":"Henüz favori yok")+"</strong><small>"+(kind==="history"?"Ürettiğin görseller burada görünecek.":"Beğendiğin görselleri kalp ile kaydet.")+"</small>";
    body.appendChild(empty);return;
  }
  const grid=document.createElement("div");grid.className="library-grid";
  items.forEach(item=>{
    const card=document.createElement("article");card.className="library-item";
    const img=document.createElement("img");img.loading="lazy";img.decoding="async";img.src=item.url;img.alt="Üretilen ürün görseli";
    const meta=document.createElement("div");meta.className="library-meta";
    const date=document.createElement("small");date.textContent=item.createdAt?new Date(item.createdAt).toLocaleString(state.lang==="tr"?"tr-TR":"en-US"):"";
    const actions=document.createElement("div");actions.className="library-actions";
    const fav=document.createElement("button");fav.className="library-action favorite "+(isFavorite(item)?"on":"");fav.textContent=isFavorite(item)?"♥":"♡";fav.title=isFavorite(item)?"Favoriden çıkar":"Favorilere ekle";fav.onclick=()=>toggleFavorite(item);
    const dl=document.createElement("button");dl.className="library-action";dl.textContent="↓";dl.title=L().download;dl.onclick=()=>download(item,0);
    actions.append(fav,dl);meta.append(date,actions);card.append(img,meta);grid.appendChild(card);
  });
  body.appendChild(grid);
}
function bind(){$("#pick").onclick=e=>{e.stopPropagation();$("#file").click()};$("#upload").onclick=e=>{if(e.target.id!=="pick")$("#file").click()};$("#file").onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(!["image/jpeg","image/png","image/webp"].includes(f.type)||f.size>12582912){toast("JPG / PNG / WEBP • 12 MB","error");return}state.file=f;state.results=[];render();toast("✓ "+L().upload,"success")};$("#extra").oninput=e=>{state.extra=e.target.value;write("extra",state.extra);$("#counter").textContent=state.extra.length+"/500"};$("#count").onchange=e=>state.count=Number(e.target.value);$("#ratio").onchange=e=>state.ratio=e.target.value;$("#add").onclick=openProviderModal;$("#settingsBtn").onclick=openSettings;$("#bottomHome").onclick=()=>{state.nav="home";$("#modal").classList.add("hidden");renderNav();window.scrollTo({top:0,behavior:"smooth"})};$("#bottomHistory").onclick=()=>openLibrary("history");$("#bottomFavorites").onclick=()=>openLibrary("favorites");$("#bottomSettings").onclick=()=>{state.nav="settings";openSettings();renderNav()};$("#langBtn").onclick=()=>{state.lang=state.lang==="tr"?"en":"tr";write("agt-lang",state.lang);render()};$("#generate").onclick=generate}
function openSettings(){const t=L();$("#modal").classList.remove("hidden");$("#sheetTitle").textContent=t.settingsNav;$("#sheetBody").innerHTML='<div class="setting-row"><div><b>'+t.language+'</b><small>Türkçe / English</small></div><button class="choice" id="languageChoice">'+(state.lang==="tr"?"🇹🇷 Türkçe":"🇬🇧 English")+'</button></div><div class="setting-row"><div><b>'+t.notifications+'</b><small>'+t.notifyOn+'</small></div><button class="toggle '+(state.notify?"on":"")+'" id="notifyToggle"><span></span></button></div><div class="about">'+t.app+'<br><small>v1.0</small></div>';$("#close").onclick=()=>$("#modal").classList.add("hidden");$("#languageChoice").onclick=()=>{state.lang=state.lang==="tr"?"en":"tr";write("agt-lang",state.lang);$("#modal").classList.add("hidden");render()};$("#notifyToggle").onclick=()=>{state.notify=!state.notify;write("agt-notify",state.notify);openSettings()}}
function openProviderModal(){$("#modal").classList.remove("hidden");$("#sheetTitle").textContent=L().addTitle;$("#sheetBody").innerHTML='<div class="provider-grid" id="providerGrid"></div><div id="form" class="provider-form-host" hidden></div>';$("#close").onclick=()=>$("#modal").classList.add("hidden");const grid=$("#providerGrid"),form=$("#form");if(!grid||!form)return;grid.hidden=false;grid.classList.remove("is-hidden");grid.style.display="grid";form.hidden=true;form.style.display="none";grid.replaceChildren();PROVIDERS.forEach(p=>{const connected=state.slots.some(s=>s.provider===p[0]);const btn=document.createElement("button");btn.type="button";btn.className=connected?"connected-provider":"";btn.innerHTML="<strong>"+p[2]+"</strong><span>"+p[1]+"</span><small>"+(connected?"✓ Bağlı":(p[3]?L().free:"API key"))+"</small>";btn.onclick=()=>showForm(p[0]);grid.appendChild(btn)})}
function showForm(pid){const p=provider(pid),old=state.slots.find(x=>x.provider===pid),t=L();let grid=$("#providerGrid"),form=$("#form");if(!p){toast("AI sağlayıcısı bulunamadı","error");return}if(!form){const body=$("#sheetBody");if(!body)return;form=document.createElement("div");form.id="form";form.className="provider-form-host";body.appendChild(form)}try{let models=[...new Set([...(pid==="pollinations"?MODEL_CATALOG[pid]:cachedModels(pid)),...(MODEL_CATALOG[pid]||[]),...(pid==="pollinations"?"":old&&old.model)].filter(Boolean))];let h='<div class="form"><h3>'+p[2]+" "+p[1]+'</h3><label>'+t.name+'<input id="label" value="'+esc(old&&old.label||p[1])+'"></label>';if(p[4])h+='<label>'+t.key+'<input id="key" type="password" placeholder="'+(old&&old.key?"Kayıtlı anahtar — değiştirmek için yenisini gir":"••••••••")+'"></label>';if(old&&old.key)h+='<small class="key-saved-note">🔒 API anahtarı bu cihazda kayıtlı. Alanı boş bırakırsan mevcut anahtar korunur.</small>';if(pid==="cloudflare")h+='<label>'+t.account+'<input id="account" value="'+esc(old&&old.accountId||"")+'"></label>';if(["custom","generic","comfyui"].includes(pid))h+='<label>'+t.base+'<input id="base" value="'+esc(old&&old.baseUrl||(pid==="comfyui"?"http://127.0.0.1:8188":""))+'"></label>';if(pid==="comfyui")h+='<label>Workflow<textarea id="workflow">'+esc(old&&old.workflow||"")+'</textarea></label>';h+='<label class="model-field">'+t.model+'<div class="model-picker"><select id="model" aria-label="'+t.model+'">'+renderModelOptions(pid,models)+'</select><span class="model-chevron">⌄</span><button type="button" id="refreshModels" aria-label="Modelleri yenile">↻</button></div><small id="modelStatus">'+(models.length?models.length+" model hazır":"Model seç")+'</small></label><button class="save-btn" id="save">'+t.save+'</button><small class="secure-note">'+t.secure+'</small>'+(pid==="puter"?"<small class=\"secure-note\">🆓 Puter: geliştirici tarafında ücretsizdir. :free modeller varsa sağlayıcı kendi kota/rate limitini uygular.</small>":"")+'</div>';form.innerHTML=h;if(grid){grid.hidden=true;grid.classList.add("is-hidden");grid.style.display="none"}form.hidden=false;form.style.display="block";const model=$("#model");if(old&&old.model&&models.includes(old.model)&&model)model.value=old.model;const refresh=$("#refreshModels");if(refresh)refresh.onclick=()=>refreshModelSelect(pid,{...(old||{}),key:$("#key")&&$("#key").value.trim()||old&&old.key||"",baseUrl:$("#base")&&$("#base").value.trim()||old&&old.baseUrl||"",accountId:$("#account")&&$("#account").value.trim()||old&&old.accountId||""});if(["gemini","openai","pollinations","aihorde","cloudflare","puter"].includes(pid)&&!cachedModels(pid).length)refreshModelSelect(pid,{...(old||{}),key:old&&old.key||"",baseUrl:old&&old.baseUrl||"",accountId:old&&old.accountId||""});const save=$("#save");if(save)save.onclick=()=>saveProvider(pid,old,p)}catch(e){if(grid){grid.hidden=false;grid.classList.remove("is-hidden");grid.style.display="grid"}form.hidden=true;form.style.display="none";toast("AI bağlantı ekranı açılamadı: "+(e?.message||String(e)),"error")}}

function saveProvider(pid,old,p){const key=$("#key")&&$("#key").value.trim()||old&&old.key||"";if(p[4]&&!key){toast(L().key,"error");return}const selectedModel=$("#model").value.trim()||p[5]||(MODEL_CATALOG[pid]&&MODEL_CATALOG[pid][0])||"";const n={id:old&&old.id||crypto.randomUUID(),provider:pid,label:$("#label").value.trim()||p[1],key:key,model:selectedModel,baseUrl:$("#base")&&$("#base").value.trim()||old&&old.baseUrl||"",accountId:$("#account")&&$("#account").value.trim()||old&&old.accountId||"",workflow:$("#workflow")&&$("#workflow").value||old&&old.workflow||""};state.slots=old?state.slots.map(x=>x.id===n.id?n:x):state.slots.concat(n);write("provider-slots",state.slots);state.selected=n.id;state.mode="manual";write("provider-mode","manual");$("#modal").classList.add("hidden");render();toast("✓ "+L().ai,"success")}
async function generate(){if(state.busy)return;if(!state.file){toast(L().needFile,"error");return}state.error="";state.results=[];let list;if(state.mode==="free")list=[...state.slots].sort((a,b)=>Number(provider(b.provider)&&provider(b.provider)[3])-Number(provider(a.provider)&&provider(a.provider)[3]));else if(state.mode==="paid")list=[...state.slots].sort((a,b)=>Number(provider(a.provider)&&provider(a.provider)[3])-Number(provider(b.provider)&&provider(b.provider)[3]));else list=[state.slots.find(x=>x.id===state.selected)].filter(Boolean);if(!list.length){toast(L().needAI,"error");return}state.busy=true;render();let last="";for(const s of list){try{state.results=await callProvider(s);addHistory();state.busy=false;render();toast("✓ "+L().done,"success");nativeNotify(L().done,L().notifyText);return}catch(e){last=e.message||String(e)}}state.busy=false;state.results=[];state.error=last||"Bilinmeyen bir hata oluştu.";render();toast(L().error+state.error,"error")}
async function callProvider(s){
  const total=Math.max(1,Math.min(10,state.count));
  const sourceData=['gemini','aihorde','cloudflare'].includes(s.provider)?await b64(state.file):null;
  const runOne=async(index)=>{
    const p=promptText(index);
    if(s.provider==='puter'){
      if(!window.puter?.ai?.txt2img)throw Error('Puter AI yüklenemedi. İnternet bağlantısını kontrol et.');
      const input=await toData(state.file);
      const options={model:s.model||'openai/gpt-image-2.5-flare',input_image:input,quality:'high',ratio:{w:state.ratio==='4:5'?1024:1024,h:state.ratio==='4:5'?1280:1024}};
      let img;
      try{img=await window.puter.ai.txt2img(p,options)}catch(e){throw Error(e?.message||'Puter AI üretimi başarısız');}
      const url=typeof img==='string'?img:img?.src;
      if(!url)throw Error('Puter AI görsel döndürmedi');
      return[{url,provider:s.provider,model:s.model}];
    }
    if(s.provider==='gemini'){
      const source=sourceData;
      const r=await fetch('https://generativelanguage.googleapis.com/v1/models/'+encodeURIComponent(s.model)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':s.key},body:JSON.stringify({contents:[{role:'user',parts:[{inlineData:{mimeType:state.file.type,data:source}},{text:p}]}],generationConfig:{responseModalities:['IMAGE']}})});
      const d=await r.json();if(!r.ok)throw Error(d?.error?.message||'Gemini API hatası');
      const x=(d?.candidates?.[0]?.content?.parts||[]).find(v=>v.inlineData?.data)?.inlineData;if(!x)throw Error('Gemini görsel döndürmedi');
      return [{url:'data:'+x.mimeType+';base64,'+x.data}];
    }
    if(['openai','custom','generic'].includes(s.provider)){
      const fd=new FormData();fd.append('model',s.model);fd.append('prompt',p);fd.append('n','1');fd.append('size',s.provider==='openai'?'1024x1024':(state.ratio==='4:5'?'1024x1280':'1024x1024'));fd.append('image',state.file,state.file.name);
      const base=(s.baseUrl||'https://api.openai.com/v1').replace(/\/$/,'');const r=await fetch(base+'/images/edits',{method:'POST',headers:s.key?{Authorization:'Bearer '+s.key}:{},body:fd});const d=await r.json();if(!r.ok)throw Error(d?.error?.message||'OpenAI uyumlu API hatası');
      return(d.data||[]).map(x=>({url:x.b64_json?'data:image/png;base64,'+x.b64_json:x.url}));
    }
    if(s.provider==='pollinations'){
      if(!s.key)throw Error('Pollinations API anahtarı gerekli');
      const modelMap={
        'Qwen Image 3':'qwen/qwen-image-3',
        'Qwen Image':'qwen/qwen-image',
        'FLUX.1 Schnell':'black-forest-labs/flux.1-schnell',
        'FLUX.2 Klein 4B':'black-forest-labs/flux.2-klein-4b',
        'FLUX.1 Kontext Pro':'black-forest-labs/flux.1-kontext-pro',
        'GPT Image 2':'openai/gpt-image-2',
        'GPT Image 1.5':'openai/gpt-image-1.5',
        'GPT Image 1 Mini':'openai/gpt-image-1-mini',
        'Grok Imagine':'x-ai/grok-imagine-image',
        'Grok Imagine Image 2.0':'x-ai/grok-imagine-image-2.0',
        'Grok Imagine Pro':'x-ai/grok-imagine-image-quality',
        'Ideogram 4.0 Balanced':'ideogram-ai/ideogram-v4-balanced',
        'Ideogram 4.0 Quality':'ideogram-ai/ideogram-v4-quality',
        'Ideogram 4.0 Turbo':'ideogram-ai/ideogram-v4-turbo',
        'Krea 2':'krea/krea-2-medium',
        'Nano Banana':'google/gemini-2.5-flash-image',
        'Nano Banana 2':'google/gemini-3.1-flash-image',
        'Nano Banana 2 Lite':'google/gemini-3.1-flash-lite-image',
        'Nano Banana Pro':'google/gemini-3-pro-image',
        'Recraft V4.1':'recraft/recraft-v4.1-vector',
        'Seedream 4.0':'bytedance/seedream-4.0',
        'Seedream 4.5':'bytedance/seedream-4.5',
        'Seedream 5.0 Lite':'bytedance/seedream-5.0-lite',
        'Seedream 5.0 Pro':'bytedance/seedream-5.0-pro',
        'Wan 2.7 Image':'alibaba/wan-2.7-image',
        'Wan 2.7 Image Pro':'alibaba/wan-2.7-image-pro',
        'Z-Image Turbo':'tongyi-mai/z-image-turbo',
        'Lucid Origin':'leonardo/lucid-origin',
        'Pruna p-image':'prunaai/p-image',
        'Pruna p-image-edit':'prunaai/p-image-edit'
      };
      const model=modelMap[s.model]||s.model||'qwen/qwen-image-3';
      const size=state.ratio==='4:5'?'1024x1280':'1024x1024';
      const fd=new FormData();
      fd.append('image',state.file,state.file.name||'product.png');
      fd.append('prompt',p);
      fd.append('model',model);
      fd.append('n','1');
      fd.append('size',size);
      fd.append('quality','high');
      fd.append('response_format','url');
      const r=await fetch('https://gen.pollinations.ai/v1/images/edits',{
        method:'POST',
        headers:{Authorization:'Bearer '+s.key},
        body:fd
      });
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw Error(d?.error?.message||d?.error||('Pollinations API hatası ('+r.status+')'));
      const item=d?.data?.[0];
      if(!item)throw Error('Pollinations görsel döndürmedi');
      if(item.b64_json)return[{url:'data:image/png;base64,'+item.b64_json,provider:s.provider}];
      if(item.url){
        const ir=await fetch(item.url,{headers:{Authorization:'Bearer '+s.key},cache:'no-store'});
        const type=ir.headers.get('content-type')||'';
        if(!ir.ok){
          const body=await ir.text().catch(()=> '');
          let message='';
          try{const j=JSON.parse(body);message=j?.error?.message||j?.message||j?.error||''}catch(_){}
          if(ir.status===402)throw Error(message||'Pollinations hesabında yeterli Pollen bakiyesi yok.');
          throw Error(message||'Pollinations görseli alınamadı ('+ir.status+')');
        }
        if(!type.startsWith('image/')){const body=await ir.text().catch(()=> '');let message='';try{const j=JSON.parse(body);message=j?.error?.message||j?.message||''}catch(_){}throw Error(message||'Pollinations geçerli bir görsel döndürmedi.')}
        const blob=await ir.blob();
        return[{url:URL.createObjectURL(blob),persistentUrl:item.url,provider:s.provider}];
      }
      throw Error('Pollinations sonuç formatı tanınmadı');
    }
    if(s.provider==='aihorde'){
      const source=sourceData;
      const r=await fetch('https://aihorde.net/api/v2/generate/async',{method:'POST',headers:{'Content-Type':'application/json',apikey:s.key||'0000000000'},body:JSON.stringify({prompt:p+' ### duplicate product, extra product, deformed product, melted product, altered geometry, wrong colors, invented features, generated text, watermark, blurry, low quality, distorted anatomy. Allow realistic people only when the product naturally requires a user context.',models:[s.model||'AlbedoBase XL (SDXL)'],source_image:source,source_processing:'img2img',params:{width:1024,height:state.ratio==='4:5'?1280:1024,steps:30,n:1,cfg_scale:7.5,denoising_strength:.65},nsfw:false,censor_nsfw:true,r2:true,shared:false})});
      const d=await r.json();if(!r.ok||!d.id)throw Error(d?.message||'AI Horde isteği başarısız');
      for(let i=0;i<50;i++){await wait(1800);const q=await fetch('https://aihorde.net/api/v2/generate/check/'+encodeURIComponent(d.id),{headers:{apikey:s.key||'0000000000'}}).then(x=>x.json());if(q.faulted)throw Error(q.message||'AI Horde üretimi başarısız');if(q.done){const z=await fetch('https://aihorde.net/api/v2/generate/status/'+encodeURIComponent(d.id),{headers:{apikey:s.key||'0000000000'}}).then(x=>x.json()),g=z?.generations?.[0];if(!g?.img)throw Error('AI Horde görsel döndürmedi');return[{url:g.img}]}}throw Error('AI Horde kuyruğu zaman aşımına uğradı');
    }
    if(s.provider==='cloudflare'){
      if(!s.key||!s.accountId)throw Error('Cloudflare Account ID ve API Token gerekli');
      const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+encodeURIComponent(s.accountId)+'/ai/run/'+encodeURIComponent(s.model),{method:'POST',headers:{Authorization:'Bearer '+s.key,'Content-Type':'application/json'},body:JSON.stringify({image_b64:await b64(state.file),prompt:p})});
      const d=await r.json();if(!r.ok||!d.success)throw Error(d?.errors?.[0]?.message||'Cloudflare AI hatası');const x=d.result?.image||d.result?.output_image||d.result?.image_b64;if(!x)throw Error('Cloudflare görsel döndürmedi');return[{url:String(x).startsWith('data:')?String(x):'data:image/png;base64,'+x}];
    }
    if(s.provider==='comfyui')throw Error('ComfyUI bağlantısı uygulamanın masaüstü sürümünde kullanılmalıdır.');
    throw Error('Desteklenmeyen AI motoru');
  };
  const results=[];
  let lastError="";
  for(let start=0;start<total;start+=3){
    const batch=await Promise.allSettled(Array.from({length:Math.min(3,total-start)},(_,j)=>runOne(start+j)));
    for(const item of batch){
      if(item.status==='fulfilled')results.push(...item.value);
      else lastError=item.reason?.message||String(item.reason||"AI motoru görsel üretemedi.");
    }
  }
  results.__lastError=lastError;
  if(results.length<total){
    const detail=results.__lastError||"AI motoru görsel üretemedi.";
    throw Error(detail);
  }
  return results;
}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
function b64(f){return toData(f).then(v=>String(v).split(',')[1])}
function toData(f){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)})}
async function download(x,i){try{if(x.url.startsWith('blob:')||x.url.startsWith('data:')){const a=document.createElement('a');a.href=x.url;a.download='AGT-'+String(i+1).padStart(2,'0')+'.png';document.body.appendChild(a);a.click();a.remove();return}const slot=x.provider?state.slots.find(s=>s.provider===x.provider):null;const r=await fetch(x.url,slot?.key?{headers:{Authorization:'Bearer '+slot.key}}:{});if(!r.ok)throw Error('Görsel indirilemedi');const blob=await r.blob();const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='AGT-'+String(i+1).padStart(2,'0')+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)}catch(e){toast(e.message||'İndirme başarısız',"error")}}
render();