# AGT Product AI

Folio-inspired, mobile-first AI product studio for e-commerce creators.

## Product vision

One product photo in → a complete commercial content pack out:

- clean marketplace hero image
- white-background product image
- studio scene
- lifestyle scene
- detail images
- social-media formats
- product title, description and SEO copy
- batch generation
- ZIP export
- product video (later phase)

## Platforms

- Responsive web/PWA: phone, tablet and desktop
- Windows desktop app via Tauri 2
- Android package via Tauri 2
- AI generation is provider-based so the UI is not tied to one vendor or model

## Planned AI stack

- Qwen-Image-Edit-2509 for product-aware image editing/generation
- BiRefNet for foreground/background extraction
- ComfyUI workflows for advanced/local pipelines
- Wan2.2 I2V for the later video module

## Architecture

```text
Web / PWA / Tauri
        |
        v
   Next.js UI/API
        |
        +---- Product pipeline
        |       +-- background removal
        |       +-- image generation/editing
        |       +-- QA
        |       +-- batch jobs
        |       +-- ZIP export
        |
        +---- Provider layer
                +-- Qwen/ComfyUI local or remote
                +-- API providers
```

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Important licensing rule

The application code is being developed independently. Third-party code, model weights and workflows must be reviewed separately before commercial distribution. A repository's software license does **not** automatically grant commercial rights to every model or asset it uses.
