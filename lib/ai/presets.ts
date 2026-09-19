import type { ImageJobMode } from "./types";

export interface GenerationPreset {
  id: ImageJobMode;
  label: string;
  description: string;
  prompt: string;
  aspectRatio: string;
}

const PRODUCT_CORE =
  "Create a photorealistic professional commercial image from the supplied product reference. Before generating, silently identify the exact product category, likely customer, real-world use and visual selling context. Preserve the exact product identity, geometry, proportions, materials, colors, transparent parts, handles, seams, labels and visible details. Never redesign, replace, merge, duplicate or invent product features.";

const CATEGORY_INTELLIGENCE =
  "Match the scene to the actual product instead of using a generic product background. If the reference is a school backpack, a natural variation may show it worn by a school-age child or teenager on the way to school, with the backpack clearly visible. If it is a book, use a believable desk, study table, reading nook or bedside context. If it is cookware, use a realistic kitchen. If it is jewelry, use an elegant fashion/editorial context. If it is footwear, use a believable fashion or walking context. If it is stationery, use a desk/workspace. These are examples only: infer the correct context from the actual product. Human presence is allowed when genuinely appropriate to the product; never add people merely as decoration.";

const VARIATIONS = [
  "Hero: eye-level three-quarter product presentation, premium commercial key light, clean controlled background.",
  "Hero: low camera angle that gives the product visual authority while preserving realistic scale and proportions.",
  "Hero: elevated camera angle with a refined composition and natural soft shadow.",
  "Hero: centered catalog composition with generous breathing room and crisp product separation.",
  "Hero: asymmetric premium composition with the product dominant and intentional negative space.",
  "Hero: close editorial crop that still shows the complete product clearly.",
  "Hero: wide environmental hero showing the product's natural surroundings without distracting from it.",
  "Hero: subtle foreground/background depth with realistic lens perspective.",
  "Hero: premium campaign composition using restrained props that logically belong to the product category.",
  "Hero: strongest natural commercial presentation for this exact product, different from previous views.",
  "Studio: soft gray seamless studio sweep, large softbox, realistic contact shadow.",
  "Studio: warm ivory studio environment with gentle side lighting and controlled reflections.",
  "Studio: cool neutral studio environment with crisp edge definition and soft fill.",
  "Studio: premium tabletop studio scene with a surface appropriate to the product material.",
  "Studio: dramatic side light revealing texture and geometry without changing the product.",
  "Studio: high-key editorial lighting with subtle gradient background.",
  "Studio: low-key premium lighting with controlled highlights and realistic shadow falloff.",
  "Studio: top-down studio composition when physically appropriate for the product.",
  "Studio: three-quarter editorial camera with shallow but believable depth of field.",
  "Studio: luxury catalog composition with precise product placement and immaculate realism.",
  "Lifestyle: place the product in the most natural real-world environment for its category.",
  "Lifestyle: show the product in the environment where the target customer would normally encounter it.",
  "Lifestyle: show believable scale by including appropriate contextual objects from the product's real environment.",
  "Lifestyle: natural morning-light interpretation suited to the product and its likely use.",
  "Lifestyle: warm afternoon/evening interpretation suited to the product and its likely use.",
  "Lifestyle: authentic active-use moment only when the product genuinely benefits from human interaction.",
  "Lifestyle: quiet everyday scene with the product naturally integrated rather than staged.",
  "Lifestyle: premium editorial lifestyle scene with realistic depth and restrained background detail.",
  "Lifestyle: wider environmental scene communicating place, purpose and scale.",
  "Lifestyle: strongest believable use-case scene for this exact product, clearly different from prior images.",
  "Detail: macro-style material texture shot using only details actually visible in the reference.",
  "Detail: close-up of a real construction feature such as stitching, seams, joints or edges.",
  "Detail: close-up of a functional component such as a handle, control, compartment or closure when present.",
  "Detail: close-up emphasizing finish, surface, transparency or material quality when visible.",
  "Detail: three-quarter detail view showing how two real product components connect.",
  "Detail: top-down detail composition when it communicates a real product feature.",
  "Detail: side-lit detail shot designed to reveal genuine texture without inventing features.",
  "Detail: shallow-depth editorial detail with the product feature sharply resolved.",
  "Detail: premium catalog feature shot that communicates one useful selling point.",
  "Detail: most informative real detail visible in the reference, with no fabricated construction.",
  "Social: bold clean advertising composition with strong product hierarchy.",
  "Social: minimal gradient campaign background with generous negative space for later copy.",
  "Social: lifestyle-inspired social advertisement matched to the product category.",
  "Social: asymmetric composition designed for modern social-media advertising.",
  "Social: close product crop optimized for visual impact.",
  "Social: wide composition with intentional copy-safe negative space.",
  "Social: premium editorial/fashion treatment when appropriate to the category.",
  "Social: natural-use advertising scene when appropriate to the product.",
  "Social: seasonal or time-of-day campaign treatment only when relevant to the product.",
  "Social: strongest believable social-media selling scenario for this exact product.",
];

function buildPrompt(mode: ImageJobMode, index = 0) {
  const modeInstruction: Record<ImageJobMode, string> = {
    hero: "Create a premium e-commerce hero image.",
    white: "Create a marketplace-ready pure-white product image with a soft realistic contact shadow.",
    studio: "Create a refined professional studio photograph with controlled softbox lighting and a premium set.",
    lifestyle: "Create a photorealistic lifestyle scene showing the product in a believable real-world context.",
    detail: "Create a close, useful product-detail photograph emphasizing only real visible construction or material features.",
    social: "Create a polished social-media advertising visual with intentional negative space for later design.",
  };
  return `${PRODUCT_CORE} ${modeInstruction[mode]} ${CATEGORY_INTELLIGENCE} ${VARIATIONS[index % VARIATIONS.length]} Make this variation materially different from other requested variations in composition, camera angle, environment, lighting or usage context while keeping the exact same product. No hallucinated features, generated text, badges or watermark.`;
}

export const GENERATION_PRESETS: GenerationPreset[] = [
  { id: "hero", label: "E-ticaret Seti", description: "Ana görsel + farklı satış sahneleri", prompt: buildPrompt("hero"), aspectRatio: "1:1" },
  { id: "white", label: "Beyaz Arka Plan", description: "Marketplace görselleri", prompt: buildPrompt("white"), aspectRatio: "1:1" },
  { id: "studio", label: "Profesyonel Stüdyo", description: "Premium stüdyo çekimleri", prompt: buildPrompt("studio"), aspectRatio: "4:5" },
  { id: "lifestyle", label: "Gerçek Kullanım", description: "Ürüne göre doğal kullanım sahneleri", prompt: buildPrompt("lifestyle"), aspectRatio: "4:5" },
  { id: "detail", label: "Detay & Özellik", description: "Gerçek ürün detaylarını öne çıkarır", prompt: buildPrompt("detail"), aspectRatio: "4:5" },
  { id: "social", label: "Sosyal Medya", description: "Reklam ve sosyal medya kompozisyonları", prompt: buildPrompt("social"), aspectRatio: "4:5" },
];

export function getPreset(mode: ImageJobMode) {
  return GENERATION_PRESETS.find((preset) => preset.id === mode) ?? GENERATION_PRESETS[0];
}

export function getVariationPrompt(mode: ImageJobMode, index: number, customPrompt = "") {
  const base = buildPrompt(mode, index);
  return customPrompt.trim() ? `${base}\n\nAdditional user direction: ${customPrompt.trim()}` : base;
}
