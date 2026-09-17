export interface ProductCatalogInput {
  name?: string;
  category?: string;
  brand?: string;
  keywords?: string[];
  marketplace?: "etsy" | "hepsiburada" | "trendyol" | "amazon" | "generic";
  language?: "tr" | "en";
}

export interface ProductCatalogOutput {
  title: string;
  shortDescription: string;
  description: string;
  tags: string[];
  seoKeywords: string[];
  marketplace: string;
}
