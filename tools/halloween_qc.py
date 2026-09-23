import json, os, shutil, subprocess, hashlib
from pathlib import Path
from PIL import Image
import imagehash
import torch
from transformers import CLIPProcessor, CLIPModel

SRC = Path("work/source/halloween_1000")
TMP = Path("work/qc_tmp")
OUT = Path("work/clean_halloween")
REJ = Path("work/rejected_halloween")
TMP.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
REJ.mkdir(parents=True, exist_ok=True)

CATS = {
    "01_Pumpkins": ["a Halloween pumpkin clipart", "a jack-o-lantern illustration", "a carved pumpkin graphic"],
    "02_Bats_Night_Flyers": ["a Halloween bat clipart", "a flying bat illustration", "a spooky bat graphic"],
    "03_Ghosts_Spirits_Undead": ["a Halloween ghost clipart", "a spooky ghost illustration", "a ghost spirit graphic"],
    "04_Witches_Brooms": ["a Halloween witch clipart", "a witch with a broom illustration", "a spooky witch graphic"],
    "05_Spiders_Webs": ["a Halloween spider clipart", "a spider web illustration", "a spooky spider graphic"],
    "06_Skulls_Skeletons": ["a Halloween skull clipart", "a skeleton illustration", "a spooky skull graphic"],
    "07_Cats_Felines": ["a black cat Halloween clipart", "a spooky cat illustration", "a Halloween feline graphic"],
    "08_Graveyard_Tombstones": ["a Halloween graveyard illustration", "a cemetery with tombstones graphic", "a spooky graveyard clipart"],
    "09_Haunted_Gothic_Buildings": ["a haunted house Halloween clipart", "a spooky gothic building illustration", "a haunted castle graphic"],
    "10_Halloween_Gothic_Decor": ["Halloween gothic decoration clipart", "a spooky Halloween decorative graphic", "gothic Halloween ornament clipart"],
}
DISTRACTORS = [
    "an owl illustration", "a crow or raven illustration", "a cricket bat or sports equipment",
    "a pumpkin pie or food illustration", "a drink or mug illustration", "a certificate or document",
    "flowers or floral decoration", "a bird illustration", "a random object or unrelated clipart"
]
PROMPTS = [p for vals in CATS.values() for p in vals] + DISTRACTORS
CAT_INDEX = {k: list(range(i*3, i*3+3)) for i,k in enumerate(CATS)}
MODEL = "openai/clip-vit-base-patch32"

print("Loading CLIP:", MODEL)
processor = CLIPProcessor.from_pretrained(MODEL)
model = CLIPModel.from_pretrained(MODEL)
model.eval()

with torch.inference_mode():
    txt = processor(text=PROMPTS, return_tensors="pt", padding=True)
    tfeat = model.get_text_features(**txt)
    tfeat = tfeat / tfeat.norm(dim=-1, keepdim=True)
    cat_text = {}
    for cat, idxs in CAT_INDEX.items():
        v = tfeat[idxs].mean(dim=0)
        cat_text[cat] = v / v.norm()

svg_files = sorted(SRC.rglob("*.svg"))
records = []
for i, svg in enumerate(svg_files, 1):
    rel = svg.relative_to(SRC)
    render = TMP / (svg.stem + "_" + str(i) + ".png")
    render.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["rsvg-convert", "-w", "512", "-h", "512", "-o", str(render), str(svg)], check=False)
    rec = {"source": str(rel), "status": "rejected", "reason": ""}
    try:
        im = Image.open(render).convert("RGBA")
        alpha = im.getchannel("A")
        bbox = alpha.getbbox()
        if not bbox:
            rec["reason"] = "empty_transparency"
            records.append(rec); continue
        area = ((bbox[2]-bbox[0]) * (bbox[3]-bbox[1])) / (512*512)
        if area < 0.012:
            rec["reason"] = "too_small_or_empty"
            records.append(rec); continue
        rec["bbox_area"] = round(area, 5)
        with torch.inference_mode():
            inp = processor(images=im, return_tensors="pt")
            if "input_ids" in inp:
                inp.pop("input_ids", None)
            if "attention_mask" in inp:
                inp.pop("attention_mask", None)
            feat = model.get_image_features(**inp)
            feat = feat / feat.norm(dim=-1, keepdim=True)
            scores = {cat: float((feat @ cat_text[cat]).item()) for cat in CATS}
        ranked = sorted(scores.items(), key=lambda x:x[1], reverse=True)
        top_cat, top_score = ranked[0]
        second_score = ranked[1][1]
        margin = top_score - second_score
        folder = rel.parts[0] if rel.parts else ""
        intended = folder if folder in CATS else None
        if intended != top_cat:
            rec["reason"] = f"wrong_category: predicted={top_cat}"
            rec["predicted"] = top_cat
            rec["score"] = round(top_score,4)
            records.append(rec); continue
        if margin < 0.035:
            rec["reason"] = f"ambiguous_category: margin={margin:.4f}"
            rec["predicted"] = top_cat
            rec["score"] = round(top_score,4)
            records.append(rec); continue
        rec.update({"status":"accepted","category":top_cat,"clip_score":round(top_score,4),"margin":round(margin,4)})
        records.append(rec)
    except Exception as e:
        rec["reason"] = "render_or_classification_error:" + str(e)[:180]
        records.append(rec)

# Remove exact/near duplicates inside each category, preferring higher CLIP score.
accepted = [r for r in records if r["status"]=="accepted"]
bycat = {}
for r in accepted:
    bycat.setdefault(r["category"], []).append(r)
final = []
for cat, items in bycat.items():
    items.sort(key=lambda r:r.get("clip_score",0), reverse=True)
    seen_hashes = []
    for r in items:
        src = SRC / r["source"]
        tmp = TMP / (Path(r["source"]).stem + "_" + str(svg_files.index(src)+1) + ".png")
        try:
            h = imagehash.phash(Image.open(tmp).convert("RGB"))
        except Exception:
            r["status"]="rejected"; r["reason"]="phash_error"; continue
        if any((h-x) <= 3 for x in seen_hashes):
            r["status"]="rejected"; r["reason"]="near_duplicate"
            continue
        seen_hashes.append(h)
        final.append(r)

final_set = {r["source"] for r in final}
for r in records:
    if r["status"]=="accepted" and r["source"] not in final_set:
        r["status"]="rejected"; r["reason"]="near_duplicate"

# Render accepted files at final size, sequentially numbered per category.
counts = {}
for cat in CATS:
    dest = OUT / cat
    dest.mkdir(parents=True, exist_ok=True)
    items = sorted([r for r in records if r["status"]=="accepted" and r["source"] in final_set and r["category"]==cat], key=lambda r:r["source"])
    for n, r in enumerate(items, 1):
        src = SRC / r["source"]
        out = dest / f"{n:03d}_{Path(r['source']).stem}.png"
        subprocess.run(["rsvg-convert", "-w", "2000", "-h", "2000", "-o", str(out), str(src)], check=True)
    counts[cat] = len(items)

# Save report and manifest.
report = {
    "total_source": len(svg_files),
    "accepted_total": sum(counts.values()),
    "rejected_total": len(svg_files)-sum(counts.values()),
    "counts": counts,
    "method": "transparent/size checks + CLIP zero-shot category check + perceptual duplicate filtering",
    "model": MODEL,
}
(REJ / "QC_REPORT.json").write_text(json.dumps({"summary":report,"files":records}, indent=2, ensure_ascii=False), encoding="utf-8")
(OUT / "QC_REPORT.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
(OUT / "LICENSE-AND-SOURCE.txt").write_text((SRC / "LICENSE-AND-SOURCE.txt").read_text(encoding="utf-8"), encoding="utf-8")
(OUT / "README.txt").write_text(
    "AGT Studio Halloween - QUALITY CONTROL EDITION\n"
    "Only files passing transparency/size, visual category, and duplicate checks are included.\n"
    "Counts are intentionally allowed to be below 100 per folder; quality is prioritized over quantity.\n",
    encoding="utf-8"
)
print(json.dumps(report, indent=2))
