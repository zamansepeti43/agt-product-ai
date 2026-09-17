# AGT Product AI

Folio-inspired, mobile-first AI product studio for e-commerce creators.

## Current build — v0.4

The functional foundation now includes:

- responsive product studio UI
- mobile camera/gallery input
- JPG / PNG / WEBP validation
- 12 MB per-image and 48 MB batch upload guards
- product preview
- six commercial image presets
- 1–4 output generation control
- optional per-generation prompt instruction
- single-product and up-to-6-product batch generation
- provider registry
- configurable ComfyUI adapter
- Qwen Image Edit-ready workflow placeholders
- real generated-asset gallery
- same-origin ComfyUI asset proxy
- secure server-side ZIP export for up to 24 assets / 50 MB
- cache-safe PWA shell
- health endpoint with provider/workflow status
- provider-independent prompt presets

## Product vision

One product photo in → a complete commercial content pack out:

- marketplace hero image
- white-background product image
- studio scene
- lifestyle scene
- detail images
- social-media formats
- product title, description and SEO copy
- batch generation
- ZIP export
- product video

## Platforms

- Responsive web/PWA: phone, tablet and desktop
- Windows desktop app via Tauri 2
- Android package via Tauri 2
- Same product workflow across devices

## Architecture

```text
Phone / Browser / Tauri
          |
          v
      Next.js UI
          |
          +------ /api/generate ---- Provider registry ---- ComfyUI
          |                                      |
          |                                      +-- Qwen Image Edit workflow
          |                                      +-- custom licensed workflows
          |
          +------ /api/batch -------- same provider pipeline
          |
          +------ /api/asset -------- same-origin image delivery
          |
          +------ /api/export/zip --- validated provider assets -> ZIP
          |
          +------ Future modules
                        +-- QA
                        +-- catalog/SEO
                        +-- image-to-video
```

## ComfyUI connection

Copy `.env.example` to `.env.local` and configure:

```env
IMAGE_PROVIDER=comfyui
COMFYUI_BASE_URL=http://127.0.0.1:8188
COMFYUI_TIMEOUT_MS=180000
COMFYUI_WORKFLOW_JSON={...}
```

The workflow JSON is provider-configurable. The adapter replaces these placeholders:

- `__IMAGE__`
- `__PROMPT__`
- `__WIDTH__`
- `__HEIGHT__`

The application does not bundle model weights or third-party workflow files. A licensed Qwen Image Edit workflow can be connected through configuration.

Generated `/view` assets are delivered through `/api/asset`, which only accepts the exact origin configured in `COMFYUI_BASE_URL`, the `/view` path, and image content up to 12 MB.

## ZIP export

The result gallery can package up to 24 provider assets into `AGT-Product-AI-export.zip`, with a 50 MB total payload guard. Only `/view` URLs from the configured ComfyUI origin are accepted.

## Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Validation:

```bash
npm run typecheck
npm run build
```

## Licensing discipline

The application code is being developed independently. Third-party repositories, code, workflows, model weights, APIs and generated assets must be reviewed separately before commercial distribution. A repository's software license does **not** automatically grant commercial rights to every model or asset it uses.
