import type { ImageJobMode } from "./types";

export interface GenerationPreset {
  id: ImageJobMode;
  label: string;
  description: string;
  prompt: string;
  aspectRatio: string;
}

export const GENERATION_PRESETS: GenerationPreset[] = [
  {
    id: "hero",
    label: "E-ticaret Seti",
    description: "Ana görsel + destek görselleri",
    prompt: "Create a polished commercial e-commerce image set. Preserve the exact product identity, geometry, materials, colors, logos and visible details. Use clean premium composition and realistic lighting.",
    aspectRatio: "1:1",
  },
  {
    id: "white",
    label: "Beyaz Arka Plan",
    description: "Temiz marketplace görseli",
    prompt: "Create a marketplace-ready product photo on a pure white background. Preserve the exact product shape, proportions, colors, texture, branding and all visible details. Center the product with soft natural shadow and clean studio lighting.",
    aspectRatio: "1:1",
  },
  {
    id: "studio",
    label: "Stüdyo",
    description: "Premium ürün çekimi",
    prompt: "Create a premium professional studio product photograph. Preserve the exact product identity and geometry. Use sophisticated studio lighting, subtle realistic shadows and a minimal luxury set.",
    aspectRatio: "4:5",
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    description: "Gerçek kullanım sahnesi",
    prompt: "Place the exact product naturally into a believable premium lifestyle scene. The product must remain unchanged in shape, proportions, materials, colors and branding. Use realistic photography, depth and natural light.",
    aspectRatio: "4:5",
  },
  {
    id: "detail",
    label: "Detay",
    description: "Yakın plan ve detay görselleri",
    prompt: "Create a premium close-up product detail photograph. Preserve exact materials, texture, stitching, edges, labels and branding. Show useful product details with realistic macro photography and controlled lighting.",
    aspectRatio: "4:5",
  },
  {
    id: "social",
    label: "Sosyal Medya",
    description: "Instagram ve reklam formatları",
    prompt: "Create a high-quality social media advertising visual featuring the exact product. Preserve product identity and branding. Use a strong editorial composition, realistic photography and clear visual hierarchy with safe space for optional copy.",
    aspectRatio: "4:5",
  },
];

export function getPreset(mode: ImageJobMode) {
  return GENERATION_PRESETS.find((preset) => preset.id === mode) ?? GENERATION_PRESETS[0];
}
