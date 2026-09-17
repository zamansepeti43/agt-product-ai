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

function marketplaceTags(values: string[]) {
  // Etsy currently limits each listing tag to 20 characters; keeping the
  // generator within that boundary also makes its output safer to paste into
  // other marketplace editors.
  return uniqueWords(values)
    .map((value) => value.slice(0, 20).trim())
    .filter(Boolean)
    .slice(0, 13);
}

export function generateCatalogCopy(input: ProductCatalogInput = {}): ProductCatalogOutput {
  const language = input.language ?? "tr";
  const name = clean(input.name, language === "tr" ? "Ürün" : "Product");
  const category = clean(input.category, language === "tr" ? "ürün" : "product");
  const brand = clean(input.brand, "");
  const keywords = uniqueWords([category, brand, ...(input.keywords ?? [])]).slice(0, 12);
  const marketplace = input.marketplace ?? "generic";
  const tagSeed = [name, category, brand, ...(input.keywords ?? [])];

  if (language === "en") {
    const title = [brand, name, category].filter(Boolean).join(" — ").slice(0, 140);
    return {
      title,
      shortDescription: `A polished ${category} presentation for online marketplaces and social commerce.`,
      description: `${title}. Designed for a clear, professional product presentation with consistent naming, searchable keywords and marketplace-ready copy.`,
      tags: marketplaceTags(tagSeed),
      seoKeywords: keywords,
      marketplace,
    };
  }

  const title = [brand, name, category].filter(Boolean).join(" — ").slice(0, 140);
  return {
    title,
    shortDescription: `${category} için temiz, profesyonel ve pazaryeri uyumlu ürün sunumu.`,
    description: `${title}. Ürünü net biçimde anlatan, aranabilir anahtar kelimeler içeren ve e-ticaret listelemelerinde kullanılabilecek düzenli ürün açıklaması.`,
    tags: marketplaceTags(tagSeed),
    seoKeywords: keywords,
    marketplace,
  };
}
