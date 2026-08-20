"""
Helper script to download 3D models (.glb) and thumbnails locally 
for guaranteed fast and offline-friendly loading.
"""
import os
import json
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
STATIC_MODELS = BASE_DIR / "static" / "models"
STATIC_THUMBS = BASE_DIR / "static" / "thumbnails"
FRONTEND_MODELS = BASE_DIR.parent / "frontend" / "public" / "models"
FRONTEND_THUMBS = BASE_DIR.parent / "frontend" / "public" / "thumbnails"
DATA_FILE = BASE_DIR / "data" / "products.json"

for d in [STATIC_MODELS, STATIC_THUMBS, FRONTEND_MODELS, FRONTEND_THUMBS]:
    d.mkdir(parents=True, exist_ok=True)

def download_assets():
    if not DATA_FILE.exists():
        print(f"Data file not found: {DATA_FILE}")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"Checking assets for {len(products)} products...")

    for p in products:
        model_url = p.get("modelUrl")
        local_rel = p.get("localModelUrl", "")
        filename = os.path.basename(local_rel) if local_rel else f"{p['id']}.glb"
        
        target_backend = STATIC_MODELS / filename
        target_frontend = FRONTEND_MODELS / filename

        for target_path in [target_backend, target_frontend]:
            if not target_path.exists():
                print(f"Downloading {filename} from {model_url} -> {target_path} ...")
                try:
                    req = urllib.request.Request(
                        model_url, 
                        headers={'User-Agent': 'Mozilla/5.0'}
                    )
                    with urllib.request.urlopen(req, timeout=20) as response, open(target_path, 'wb') as out_file:
                        out_file.write(response.read())
                    print(f"[OK] Downloaded {filename} ({target_path.stat().st_size / 1024:.1f} KB)")
                except Exception as e:
                    print(f"[WARN] Could not download {filename} from {model_url}: {e}")
            else:
                print(f"[EXISTS] {filename}")

if __name__ == "__main__":
    download_assets()
