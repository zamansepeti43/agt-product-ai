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
  "Use a clean hero composition with an eye-level camera and premium commercial lighting.",
  "Use a substantially different three-quarter camera angle, camera height and depth of field.",
  "Use an authentic real-world environment where the product would naturally be used or displayed.",
  "Use a close editorial composition emphasizing a real material, construction detail or useful feature visible in the reference.",
  "Use a wider environmental composition that communicates realistic scale and the product's natural setting.",
  "Use a natural action/use moment only when genuinely appropriate for the product; keep the product clearly identifiable.",
  "Use a different time-of-day or seasonal visual treatment that fits the product category without distracting props.",
  "Use an asymmetric advertising composition with intentional negative space and a different camera perspective.",
  "Use a premium catalog/editorial composition with a distinct lens perspective and realistic depth.",
  "Use the strongest natural commercial selling scenario for the identified product category, clearly different from previous variations.",
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
