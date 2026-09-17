import type { GeneratedAsset, ImageProvider, ProductImageInput } from "../types";

interface ComfyHistoryOutput {
  images?: Array<{ filename: string; subfolder: string; type: string; width?: number; height?: number }>;
}

type WorkflowValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

function requireConfig(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} yapılandırılmamış.`);
  return value;
}

function replacePlaceholders(value: WorkflowValue, replacements: Record<string, string>): WorkflowValue {
  if (typeof value === "string") {
    return Object.entries(replacements).reduce((result, [token, replacement]) => result.replaceAll(token, replacement), value);
  }
  if (Array.isArray(value)) return value.map((item) => replacePlaceholders(item as WorkflowValue, replacements));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replacePlaceholders(item as WorkflowValue, replacements)]));
  }
  return value;
}

export class ComfyUIProvider implements ImageProvider {
  readonly id = "comfyui";

  async generate(input: ProductImageInput): Promise<GeneratedAsset[]> {
    const baseUrl = (process.env.COMFYUI_BASE_URL || "http://127.0.0.1:8188").replace(/\/$/, "");
    const workflowTemplate = requireConfig("COMFYUI_WORKFLOW_JSON");
    let workflow: Record<string, unknown>;
    try {
      workflow = JSON.parse(workflowTemplate) as Record<string, unknown>;
    } catch {
      throw new Error("COMFYUI_WORKFLOW_JSON geçerli JSON değil.");
    }

    const count = Math.min(Math.max(Math.floor(input.count || 1), 1), 4);
    const assets: GeneratedAsset[] = [];

    const upload = new FormData();
    upload.append("image", input.sourceImage, input.fileName || "product-image.png");
    upload.append("type", "input");
    upload.append("overwrite", "true");

    const uploadResponse = await fetch(`${baseUrl}/upload/image`, { method: "POST", body: upload });
    if (!uploadResponse.ok) throw new Error(`ComfyUI görsel yükleme hatası: ${uploadResponse.status}`);
    const uploaded = await uploadResponse.json() as { name?: string };
    if (!uploaded.name) throw new Error("ComfyUI yükleme yanıtında görsel adı bulunamadı.");

    for (let index = 0; index < count; index += 1) {
      const workflowJson = replacePlaceholders(workflow, {
        "__IMAGE__": uploaded.name,
        "__PROMPT__": input.prompt || "",
        "__WIDTH__": String(input.width || 1024),
        "__HEIGHT__": String(input.height || 1024),
      });

      const promptResponse = await fetch(`${baseUrl}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: workflowJson }),
      });
      if (!promptResponse.ok) throw new Error(`ComfyUI prompt hatası: ${promptResponse.status}`);
      const queued = await promptResponse.json() as { prompt_id?: string; error?: string };
      if (!queued.prompt_id) throw new Error(queued.error || "ComfyUI prompt_id döndürmedi.");

      const timeoutAt = Date.now() + Number(process.env.COMFYUI_TIMEOUT_MS || 180000);
      let completed = false;
      while (Date.now() < timeoutAt) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const historyResponse = await fetch(`${baseUrl}/history/${queued.prompt_id}`, { cache: "no-store" });
        if (!historyResponse.ok) continue;
        const history = await historyResponse.json() as Record<string, { outputs?: Record<string, ComfyHistoryOutput> }>;
        const entry = history[queued.prompt_id];
        if (!entry?.outputs) continue;

        const jobAssets: GeneratedAsset[] = [];
        for (const output of Object.values(entry.outputs)) {
          for (const image of output.images || []) {
            const params = new URLSearchParams({ filename: image.filename, subfolder: image.subfolder, type: image.type });
            jobAssets.push({
              id: `${queued.prompt_id}:${image.filename}`,
              url: `${baseUrl}/view?${params.toString()}`,
              mode: input.mode,
              width: image.width || input.width || 1024,
              height: image.height || input.height || 1024,
            });
          }
        }
        if (jobAssets.length) {
          assets.push(...jobAssets);
          completed = true;
          break;
        }
      }

      if (!completed) throw new Error(`ComfyUI üretimi ${index + 1}. görselde zaman aşımına uğradı.`);
    }

    return assets;
  }
}
