# AGT Product AI

Mobile-first AI product studio for e-commerce creators.

> Deployment pipeline: Vercel production is connected to the `main` branch.

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
- deterministic Turkish/English catalog title, description, tags and SEO keyword generation
- Windows Tauri 2 shell configuration
- GitHub Actions Windows installer workflow

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
          |
          +-- src-tauri -------- Windows hosted-app shell
```

## Catalog / SEO

`POST /api/catalog` accepts product name, category, optional brand, keywords, marketplace and language. It returns structured title, short description, description, tags and SEO keywords. The current generator is deterministic and does not invent product facts; it is a fallback that can later be paired with an LLM provider.

## Windows desktop

`src-tauri` contains a Tauri 2 native shell. The installer packages a small local launcher that opens the configured hosted AGT Product AI deployment, so the desktop client and web/PWA client share the same UI and server-side AI pipeline.

For manual Windows builds, the GitHub Actions workflow requires an `app_url` input. Version-tag builds use the repository variable `AGT_PRODUCT_AI_URL`. The URL must be `http://` or `https://` and must point to the deployed AGT Product AI application.

The repository does not embed private API keys, ComfyUI credentials, model weights or third-party workflow files in the desktop bundle.

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

1. Catalog copy-to-clipboard / export package
2. Windows Tauri installer validation against the hosted frontend
3. Optional persistent job history
4. Generated-image QA checks
5. Product video pipeline
