import sharp from "sharp";
import type { ImageJobMode, ProviderConfig } from "../types";
import { getPreset } from "../presets";

const BASE_URL = "https://aihorde.net/api/v2/generate";
const ANONYMOUS_KEY = "0000000000";
const DEFAULT_MODEL = "AlbedoBase XL (SDXL)";
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const VARIANTS: Record<string, string[]> = {
  hero: [
    "clean hero composition, eye-level premium commercial lighting",
    "three-quarter camera angle with a different camera height and depth of field",
    "authentic environment where the product naturally belongs",
    "editorial close-up emphasizing a real visible feature",
    "wider environmental composition showing realistic scale",
    "natural use moment when genuinely appropriate to the product",
    "different time-of-day treatment suited to the product",
    "asymmetric advertising composition with useful negative space",
    "premium catalog/editorial lens perspective",
    "strong natural high-conversion selling scenario different from the others",
  ],
  white: [
    "straight-on centered marketplace composition on pure white",
    "three-quarter product angle on pure white",
    "slightly elevated product angle on pure white",
    "close product crop with clean white negative space",
    "low camera angle with soft contact shadow",
    "high camera angle with generous clean space",
    "subtle diagonal composition while keeping the full product visible",
    "premium catalog angle with controlled studio light",
    "macro-inspired crop showing a real product detail",
    "final clean marketplace hero composition unlike the others",
  ],
  studio: [
    "soft gray studio sweep with controlled softbox lighting",
    "warm neutral studio sweep with a different camera angle",
    "cool neutral studio sweep with deeper realistic shadows",
    "premium tabletop studio composition",
    "dramatic but realistic side lighting",
    "high-key editorial studio setup",
    "low-key premium studio setup with controlled highlights",
    "asymmetric studio composition with negative space",
    "close editorial studio crop emphasizing material",
    "distinct luxury commercial studio composition",
  ],
  lifestyle: [
    "bright real-world environment naturally associated with the product",
    "modern home or workplace context appropriate to the product",
    "authentic outdoor or public context if the product belongs there",
    "close lifestyle scene showing a real use detail",
    "wider environment showing believable scale",
    "natural human interaction only when genuinely appropriate for the product",
    "different time-of-day atmosphere that fits the product",
    "editorial lifestyle composition with useful negative space",
    "premium candid-style commercial composition",
    "strongest natural product-use scenario, clearly different from the others",
  ],
  detail: [
    "close-up of a real construction detail",
    "close-up emphasizing material texture and finish",
    "close-up emphasizing a real handle, compartment, control or functional part",
    "close-up emphasizing stitching, edges or craftsmanship when visible",
    "macro-style crop of a real surface detail",
    "three-quarter detail showing how parts connect",
    "controlled side-lighting to reveal real texture",
    "top-down detail composition",
    "editorial detail crop with shallow depth of field",
    "most useful feature-focused detail image visible in the reference",
  ],
  social: [
    "clean editorial composition with generous negative space",
    "premium minimal gradient background",
    "bright lifestyle-inspired context appropriate to the product",
    "bold but tasteful studio composition with the product dominant",
    "asymmetric advertising layout with a different camera angle",
    "natural real-world use context when appropriate",
    "close social-ad crop emphasizing the product",
    "wide social composition with intentional negative space",
    "premium fashion/editorial treatment when suitable to the category",
    "strongest believable social advertising scenario for the product",
  ],
};
