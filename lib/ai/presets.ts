import type { ImageJobMode } from "./types";

export interface GenerationPreset {
  id: ImageJobMode;
  label: string;
  description: string;
  prompt: string;
  aspectRatio: string;
}

const PRODUCT_CORE =
  "Create a realistic professional commercial product photograph from the supplied reference. The reference product is the only subject. Preserve the exact product identity, geometry, proportions, materials, colors, transparent parts, handles, seams, labels and visible details. Do not redesign, replace, merge or invent product features. No people, hands, faces, bodies or human skin are visible. Product-only composition.";

export const GENERATION_PRESETS: GenerationPreset[] = [
  {
    id: "hero",
    label: "E-ticaret Seti",
    description: "Ana görsel + destek görselleri",
    prompt: `${PRODUCT_CORE} Create a premium e-commerce product set with clean commercial photography. Use a different professional composition for each generated variation: pure white marketplace shot, soft neutral studio gradient, tasteful home/lifestyle tabletop scene, and close product-focused editorial shot. Keep the product large, centered and sharply recognizable. Realistic lighting, natural shadows, no people, no text, no badges, no watermarks.`,
    aspectRatio: "1:1",
  },
  {
    id: "white",
    label: "Beyaz Arka Plan",
    description: "Temiz marketplace görseli",
    prompt: `${PRODUCT_CORE} Create a marketplace-ready product photo on a pure white background. Center the product with generous clean space, soft contact shadow and high-key studio lighting. The product must remain unchanged and fully recognizable. No people, no hands, no body parts, no text, no props, no watermarks.`,
    aspectRatio: "1:1",
  },
  {
    id: "studio",
    label: "Stüdyo",
    description: "Premium ürün çekimi",
    prompt: `${PRODUCT_CORE} Create a premium professional studio product photograph. Use a minimal neutral studio set, controlled softbox lighting, subtle realistic floor shadow and a refined commercial look. Keep the exact product shape and colors. No people, no hands, no skin, no lifestyle characters, no text, no watermark.`,
    aspectRatio: "4:5",
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    description: "Gerçek kullanım sahnesi",
    prompt: `${PRODUCT_CORE} Place the product in a tasteful, empty lifestyle environment such as a clean kitchen, nursery shelf or bright family-home tabletop, but do not show any person or body part. The product remains the clear hero and must not be used by a person. Realistic photography, natural depth of field, soft daylight, premium e-commerce styling. No text or watermark.`,
    aspectRatio: "4:5",
  },
  {
    id: "detail",
    label: "Detay",
    description: "Yakın plan ve detay görselleri",
    prompt: `${PRODUCT_CORE} Create a premium close-up product detail photograph showing useful construction and material details. Use realistic macro photography, controlled lighting and shallow depth of field while keeping the product geometry accurate. No people, hands, skin, faces, text or watermark.`,
    aspectRatio: "4:5",
  },
  {
    id: "social",
    label: "Sosyal Medya",
    description: "Instagram ve reklam formatları",
    prompt: `${PRODUCT_CORE} Create a polished social-media advertising product visual. Use a clean editorial composition, attractive but restrained background, realistic studio lighting and strong product focus. Leave intentional negative space for later design work, but do not generate text, logos or badges. No people, hands, faces or body parts.`,
    aspectRatio: "4:5",
  },
];

export function getPreset(mode: ImageJobMode) {
  return GENERATION_PRESETS.find((preset) => preset.id === mode) ?? GENERATION_PRESETS[0];
}
