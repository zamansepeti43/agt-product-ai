# ComfyUI workflow integration

AGT Product AI intentionally keeps model weights and third-party workflows outside the application repository.

## Required export

In ComfyUI, export the production workflow in **API format** and place its JSON in the `COMFYUI_WORKFLOW_JSON` environment variable (or inject it through your deployment secret/configuration).

The provider replaces these placeholders when present:

- `__IMAGE__` — uploaded source image filename
- `__PROMPT__` — preset prompt plus the user's optional instruction
- `__WIDTH__` — requested output width
- `__HEIGHT__` — requested output height

## Product-preservation goal

The workflow should be an image-editing workflow rather than an unconstrained text-to-image workflow when the user expects the uploaded product to remain recognizable. Test packaging, logos, text, shape and color fidelity before shipping.

## Commercial distribution

Do not copy a community workflow into the commercial product unless its license explicitly permits the intended use. Model weights, custom nodes, LoRAs, workflows and application source code can have separate licenses.
