import type { GeneratedAsset, ImageProvider, ProductImageInput } from "../types";

interface ComfyHistoryOutput {
  images?: Array<{ filename: string; subfolder: string; type: string }>;
}

function requireConfig(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} yapılandırılmamış.`);
  return value;
}

export class ComfyUIProvider implements ImageProvider {
  readonly id = "comfyui";

  async generate(input: ProductImageInput): Promise<GeneratedAsset[]> {
    const baseUrl = (process.env.COMFYUI_BASE_URL || "http://127.0.0.1:8188").replace(/\/$/, "");
    const workflowTemplate = requireConfig("COMFYUI_WORKFLOW_JSON");
    const workflow = JSON.parse(workflowTemplate) as Record<string, unknown>;

    const upload = new FormData();
    upload.append("image", input.sourceImage, input.fileName || "product-image.png");
    upload.append("type", "input");
    upload.append("overwrite", "true");

    const uploadResponse = await fetch(`${baseUrl}/upload/image`, {
      method: "POST",
      body: upload,
    });
    if (!uploadResponse.ok) throw new Error(`ComfyUI görsel yükleme hatası: ${uploadResponse.status}`);
    const uploaded = await uploadResponse.json() as { name: string };

    const workflowJson = JSON.stringify(workflow)
      .replaceAll("__IMAGE__", uploaded.name)
      .replaceAll("__PROMPT__", input.prompt || "")
      .replaceAll("__WIDTH__", String(input.width || 1024))
      .replaceAll("__HEIGHT__", String(input.height || 1024));

    const promptResponse = await fetch(`${baseUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: JSON.parse(workflowJson) }),
    });
    if (!promptResponse.ok) throw new Error(`ComfyUI prompt hatası: ${promptResponse.status}`);
    const queued = await promptResponse.json() as { prompt_id: string };

    const timeoutAt = Date.now() + Number(process.env.COMFYUI_TIMEOUT_MS || 180000);
    while (Date.now() < timeoutAt) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const historyResponse = await fetch(`${baseUrl}/history/${queued.prompt_id}`, { cache: "no-store" });
      if (!historyResponse.ok) continue;
      const history = await historyResponse.json() as Record<string, { outputs?: Record<string, ComfyHistoryOutput> }>;
      const entry = history[queued.prompt_id];
      if (!entry?.outputs) continue;

      const assets: GeneratedAsset[] = [];
      for (const output of Object.values(entry.outputs)) {
        for (const image of output.images || []) {
          const params = new URLSearchParams({ filename: image.filename, subfolder: image.subfolder, type: image.type });
          assets.push({
            id: `${queued.prompt_id}:${image.filename}`,
            url: `${baseUrl}/view?${params.toString()}`,
            mode: input.mode,
            width: input.width || 1024,
            height: input.height || 1024,
          });
        }
      }
      if (assets.length) return assets;
    }

    throw new Error("ComfyUI üretimi zaman aşımına uğradı.");
  }
}
