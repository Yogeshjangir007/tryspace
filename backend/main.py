import json
import os
import socket
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "products.json"
STATIC_DIR = BASE_DIR / "static"

# Ensure static directories exist
(STATIC_DIR / "models").mkdir(parents=True, exist_ok=True)
(STATIC_DIR / "thumbnails").mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="AR Virtual Shopping Platform - Furniture Placement API",
    description="Backend API for browsing furniture, customizing size & dimensions, and serving 3D AR models (.glb)",
    version="1.1.0",
)

# Enable CORS for frontend development and mobile LAN access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directory
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


class Dimensions(BaseModel):
    widthCm: float
    depthCm: float
    heightCm: float


class ColorOption(BaseModel):
    name: str
    hex: str


class Product(BaseModel):
    id: str
    name: str
    category: str
    price: float
    rating: Optional[float] = 5.0
    reviewCount: Optional[int] = 0
    description: str
    dimensions: Optional[Dimensions] = None
    colors: Optional[List[ColorOption]] = None
    thumbnail: str
    fallbackThumbnail: Optional[str] = None
    modelUrl: str
    localModelUrl: Optional[str] = None
    usdzUrl: Optional[str] = ""
    arScale: Optional[str] = "auto"
    isFeatured: Optional[bool] = False


def get_local_ip() -> str:
    # Method 1: Connect UDP socket to public DNS to find active interface IP (works on macOS, Linux, Windows)
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        if ip and not ip.startswith("127."):
            return ip
    except Exception:
        pass

    # Method 2: Fallback to gethostbyname
    try:
        hostname = socket.gethostname()
        ip = socket.gethostbyname(hostname)
        if ip and not ip.startswith("127."):
            return ip
    except Exception:
        pass

    return "127.0.0.1"


def load_products_data() -> List[dict]:
    if not DATA_FILE.exists():
        raise HTTPException(status_code=500, detail="Products catalog file not found")
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read products catalog: {str(e)}")


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AR Shopping Platform API",
        "version": "1.1.0"
    }


@app.get("/server-info")
def get_server_info():
    """
    Returns server network IP so mobile phones can connect over Wi-Fi
    via generated QR codes.
    """
    local_ip = get_local_ip()
    return {
        "localIp": local_ip,
        "frontendPort": 5173,
        "backendPort": 8000,
        "frontendNetworkUrl": f"http://{local_ip}:5173",
        "backendNetworkUrl": f"http://{local_ip}:8000"
    }


@app.get("/products", response_model=List[Product])
def get_products(category: Optional[str] = None):
    """
    Get all furniture and home décor items.
    Optional query param `category` to filter items.
    """
    products = load_products_data()
    if category and category.lower() != "all":
        products = [
            p for p in products 
            if p.get("category", "").lower() == category.lower()
        ]
    return products


@app.get("/products/{product_id}", response_model=Product)
def get_product_by_id(product_id: str):
    """
    Get a single product by its unique id.
    """
    products = load_products_data()
    for product in products:
        if product.get("id") == product_id:
            return product
    raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
