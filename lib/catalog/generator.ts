import type { ProductCatalogInput, ProductCatalogOutput } from "./types";

const STOPWORDS = new Set(["ve", "ile", "için", "bir", "the", "and", "for", "with"]);

function clean(value: string | undefined, fallback: string) {
  const text = value?.trim().replace(/\s+/g, " ");
  return text || fallback;
}

function uniqueWords(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const word = value.trim().replace(/\s+/g, " ");
    const key = word.toLocaleLowerCase("tr-TR");
    if (!word || STOPWORDS.has(key) || seen.has(key)) continue;
    seen.add(key);
    result.push(word);
  }
  return result;
}

export function generateCatalogCopy(input: ProductCatalogInput = {}): ProductCatalogOutput {
  const language = input.language ?? "tr";
  const name = clean(input.name, language === "tr" ? "Ürün" : "Product");
  const category = clean(input.category, language === "tr" ? "ürün" : "product");
  const brand = clean(input.brand, "");
  const keywords = uniqueWords([category, brand, ...(input.keywords ?? [])]).slice(0, 12);
  const marketplace = input.marketplace ?? "generic";

  if (language === "en") {
    const title = [brand, name, category].filter(Boolean).join(" — ").slice(0, 140);
    const tagSeed = uniqueWords([name, category, brand, ...(input.keywords ?? [])]);
    return {
      title,
      shortDescription: `A polished ${category} presentation for online marketplaces and social commerce.`,
      description: `${title}. Designed for a clear, professional product presentation with consistent naming, searchable keywords and marketplace-ready copy.`,
      tags: tagSeed.slice(0, 13),
      seoKeywords: keywords,
      marketplace,
    };
  }

  const title = [brand, name, category].filter(Boolean).join(" — ").slice(0, 140);
  const tagSeed = uniqueWords([name, category, brand, ...(input.keywords ?? [])]);
  return {
    title,
    shortDescription: `${category} için temiz, profesyonel ve pazaryeri uyumlu ürün sunumu.`,
    description: `${title}. Ürünü net biçimde anlatan, aranabilir anahtar kelimeler içeren ve e-ticaret listelemelerinde kullanılabilecek düzenli ürün açıklaması.`,
    tags: tagSeed.slice(0, 13),
    seoKeywords: keywords,
    marketplace,
  };
}
