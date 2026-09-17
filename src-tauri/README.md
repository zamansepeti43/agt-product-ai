# AGT Product AI — Windows shell

This directory contains the Tauri 2 desktop shell for the AGT Product AI web application.

The Windows app is intentionally a thin native shell: it packages a small local launcher and opens the configured hosted AGT Product AI deployment. AI inference, API routes, authentication, ComfyUI access, and other server-side capabilities remain on the hosted deployment.

## Build configuration

The CI workflow accepts `app_url` for manual builds. Tag builds read the repository variable `AGT_PRODUCT_AI_URL`.

The URL must use `http://` or `https://`. Do not put API keys, ComfyUI credentials, model weights, or private workflow files in this directory or in the desktop bundle.

## Output

Tauri produces both Windows installer targets:

- `.msi`
- NSIS `.exe`

The same product UI and backend are used by the web/PWA and Windows clients; the desktop shell does not duplicate the AI pipeline.
