# AGT Product AI

Mobile-first AI product studio for e-commerce creators.

## Current build — v0.5

- responsive web/PWA product studio
- mobile camera/gallery input
- JPG / PNG / WEBP validation
- 12 MB per-image and 48 MB batch upload guards
- six commercial image presets
- 1–4 outputs per product
- single-product and up-to-6-product batch generation
- configurable ComfyUI / Qwen Image Edit workflow integration
- same-origin ComfyUI asset proxy
- server-side ZIP export for generated assets
- deterministic catalog title, description, tags and SEO keyword generation
- Turkish and English catalog copy API
- health endpoint exposing module readiness

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
- Windows desktop app
- product video

## Architecture

```text
Phone / Browser / Tauri
          |
          v
      Next.js UI
          |
          +-- /api/generate ---- image provider ---- ComfyUI / Qwen workflow
          +-- /api/batch -------- same provider pipeline
          +-- /api/asset -------- safe provider image delivery
          +-- /api/catalog ------ catalog + SEO copy
          +-- /api/export/zip --- validated assets -> ZIP
```

## Catalog / SEO

`POST /api/catalog` accepts product name, category, optional brand, keywords, marketplace and language. It returns structured title, short description, description, tags and SEO keywords. The current generator is deterministic and does not claim facts that were not supplied by the user; it is a reliable fallback until an optional LLM catalog provider is connected.

## ComfyUI connection

Copy `.env.example` to `.env.local` and configure:

```env
IMAGE_PROVIDER=comfyui
COMFYUI_BASE_URL=http://127.0.0.1:8188
COMFYUI_TIMEOUT_MS=180000
COMFYUI_WORKFLOW_JSON={...}
```

Export the production workflow from ComfyUI in API format. The adapter replaces:

- `__IMAGE__`
- `__PROMPT__`
- `__WIDTH__`
- `__HEIGHT__`

The repository does not bundle model weights or third-party workflow files. Review licenses for models, workflows, LoRAs, custom nodes and generated assets separately before commercial distribution.

## Development

```bash
npm install
npm run dev
```

Validation:

```bash
npm run typecheck
npm run build
```

## Roadmap

1. Catalog export / copy-to-clipboard package
2. Windows Tauri 2 shell
3. Optional persistent job history
4. QA checks for generated assets
5. Product video pipeline
