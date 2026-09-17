export type ImageJobMode =
  | "hero"
  | "white"
  | "studio"
  | "lifestyle"
  | "detail"
  | "social";

export interface ProductImageInput {
  sourceImageUrl: string;
  mode: ImageJobMode;
  prompt?: string;
  width?: number;
  height?: number;
}

export interface GeneratedAsset {
  id: string;
  url: string;
  mode: ImageJobMode;
  width: number;
  height: number;
}

export interface ImageProvider {
  readonly id: string;
  generate(input: ProductImageInput): Promise<GeneratedAsset[]>;
}
