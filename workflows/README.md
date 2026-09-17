# ComfyUI workflow integration

AGT Product AI keeps model weights and third-party workflows outside the application repository.

## Required export

Export the production workflow from ComfyUI in **API format** and provide its JSON through `COMFYUI_WORKFLOW_JSON`.

The adapter replaces these placeholders when present:

- `__IMAGE__` — uploaded source image filename
- `__PROMPT__` — preset prompt plus optional user instruction
- `__WIDTH__` — requested output width
- `__HEIGHT__` — requested output height

## Product-preservation goal

Use an image-editing workflow when the uploaded product must remain recognizable. Test packaging, logos, text, shape, materials and color fidelity before shipping.

## Browser delivery

Generated ComfyUI `/view` assets are served to the browser through `/api/asset`. The proxy only permits the exact origin configured in `COMFYUI_BASE_URL`, only the `/view` path, and PNG/JPEG/WEBP responses up to 12 MB. This avoids requiring the browser to access a remote ComfyUI instance directly and keeps the same-origin gallery working for hosted deployments.

## Commercial distribution

Do not copy a community workflow into the commercial product unless its license explicitly permits the intended use. Model weights, custom nodes, LoRAs, workflows and application source code can have separate licenses.
