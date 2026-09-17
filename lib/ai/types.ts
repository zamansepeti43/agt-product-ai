export type ImageJobMode =
  | "hero"
  | "white"
  | "studio"
  | "lifestyle"
  | "detail"
  | "social";

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface ProviderConfig {
  apiKey?: string;
  model?: string;
}

export interface ProductImageInput {
  sourceImage: Blob;
  fileName?: string;
  mimeType?: string;
  mode: ImageJobMode;
  prompt?: string;
  width?: number;
  height?: number;
  count?: number;
  providerConfig?: ProviderConfig;
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

export interface GenerationRequest {
  mode: ImageJobMode;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  count?: number;
}

export interface GenerationJob {
  id: string;
  status: JobStatus;
  mode: ImageJobMode;
  provider: string;
  createdAt: string;
  message: string;
}
