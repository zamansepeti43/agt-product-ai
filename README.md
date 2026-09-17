# AGT Product AI

Folio-inspired, mobile-first AI product studio for e-commerce creators.

## Current build — v0.3

The functional foundation now includes:

- responsive product studio UI
- mobile camera/gallery input
- JPG / PNG / WEBP validation
- 12 MB upload guard
- product preview
- six commercial image presets
- 1–4 output generation control
- optional per-generation prompt instruction
- server-side generation intake API
- provider registry
- configurable ComfyUI adapter
- Qwen Image Edit-ready workflow placeholders
- real generated-asset gallery
- secure server-side ZIP export for ComfyUI outputs
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
          +------ /api/generate
          |             |
          |             +-- Provider registry
          |                    +-- ComfyUI
          |                           +-- Qwen Image Edit workflow
          |                           +-- custom workflows
          |
          +------ /api/export/zip
          |             +-- validated provider assets
          |             +-- ZIP package
          |
          +------ Background provider
          |             +-- BiRefNet
          |
          +------ Future modules
                        +-- QA
                        +-- batch queue
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

The workflow JSON is intentionally provider-configurable. The adapter replaces these placeholders before submitting the workflow:

- `__IMAGE__`
- `__PROMPT__`
- `__WIDTH__`
- `__HEIGHT__`

The application does not bundle model weights or third-party workflow files. This keeps the code independent from a single ComfyUI node layout while allowing a licensed Qwen Image Edit workflow to be connected through configuration.

## ZIP export

After generation, the result gallery can package up to 8 provider assets into `AGT-Product-AI-export.zip`. The export endpoint only accepts `/view` URLs whose origin exactly matches `COMFYUI_BASE_URL`; arbitrary remote URLs are rejected to reduce SSRF risk. The current export has a 50 MB total payload guard.

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
