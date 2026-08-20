// API service for fetching products and interacting with FastAPI backend

const API_BASE = '/api';
const BACKEND_DIRECT_URL = 'http://127.0.0.1:8000';

// Fallback seed data with exact local thumbnails and fallback CDN
const FALLBACK_PRODUCTS = [
  {
    id: "glam-velvet-sofa",
    name: "Luxury Glam Velvet 3-Seater Sofa",
    category: "Seating",
    price: 899.00,
    rating: 4.9,
    reviewCount: 154,
    description: "Exquisite channel-tufted velvet upholstery with deep foam cushioning, sculpted armrests, and polished metallic trim. The ultimate statement centerpiece for modern living rooms.",
    dimensions: { widthCm: 210, depthCm: 95, heightCm: 82 },
    colors: [
      { name: "Emerald Velvet", hex: "#1b4d3e" },
      { name: "Midnight Navy", hex: "#1a365d" },
      { name: "Warm Terracotta", hex: "#c2410c" },
      { name: "Charcoal Grey", hex: "#334155" }
    ],
    thumbnail: "/thumbnails/GlamVelvetSofa.jpg",
    fallbackThumbnail: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/screenshot/screenshot.jpg",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb",
    localModelUrl: "/models/GlamVelvetSofa.glb",
    isFeatured: true
  },
  {
    id: "velvet-lounge-armchair",
    name: "Velvet Ergonomic Lounge Armchair",
    category: "Seating",
    price: 349.99,
    rating: 4.9,
    reviewCount: 128,
    description: "Luxurious velvet upholstery with ergonomic contouring and brushed brass legs. Perfect for living rooms, reading nooks, and modern office lounges.",
    dimensions: { widthCm: 76, depthCm: 82, heightCm: 88 },
    colors: [
      { name: "Emerald Green", hex: "#1b4d3e" },
      { name: "Royal Blue", hex: "#1a365d" },
      { name: "Warm Ochre", hex: "#c67d0a" },
      { name: "Nordic Slate", hex: "#475569" }
    ],
    thumbnail: "/thumbnails/SheenChair.jpg",
    fallbackThumbnail: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/screenshot/screenshot.jpg",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb",
    localModelUrl: "/models/SheenChair.glb",
    isFeatured: true
  },
  {
    id: "sheen-wood-leather-sofa",
    name: "Nordic Wood & Leather Studio Sofa",
    category: "Seating",
    price: 749.00,
    rating: 4.8,
    reviewCount: 92,
    description: "Solid natural hardwood framing paired with premium top-grain leather cushions and mid-century architectural lines. Built for lasting durability and timeless elegance.",
    dimensions: { widthCm: 195, depthCm: 90, heightCm: 78 },
    colors: [
      { name: "Chestnut Brown", hex: "#78350f" },
      { name: "Onyx Black", hex: "#18181b" },
      { name: "Cognac Tan", hex: "#b45309" }
    ],
    thumbnail: "/thumbnails/SheenWoodLeatherSofa.jpg",
    fallbackThumbnail: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenWoodLeatherSofa/screenshot/screenshot.jpg",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenWoodLeatherSofa/glTF-Binary/SheenWoodLeatherSofa.glb",
    localModelUrl: "/models/SheenWoodLeatherSofa.glb",
    isFeatured: true
  },
  {
    id: "botanical-indoor-plant",
    name: "Botanical Fiddle-Leaf Fig & Ceramic Planter",
    category: "Décor",
    price: 79.99,
    rating: 4.8,
    reviewCount: 64,
    description: "Lush indoor botanical accent featuring lifelike broad leaves nestled in a minimalist ceramic planter pot. Adds vibrant natural energy to room corners, credenzas, and entryways.",
    dimensions: { widthCm: 45, depthCm: 45, heightCm: 110 },
    colors: [
      { name: "Matte White Pot", hex: "#f8fafc" },
      { name: "Terracotta Pot", hex: "#c2410c" },
      { name: "Slate Grey Pot", hex: "#334155" }
    ],
    thumbnail: "/thumbnails/DiffuseTransmissionPlant.jpg",
    fallbackThumbnail: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DiffuseTransmissionPlant/screenshot/screenshot.jpg",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DiffuseTransmissionPlant/glTF-Binary/DiffuseTransmissionPlant.glb",
    localModelUrl: "/models/DiffuseTransmissionPlant.glb",
    isFeatured: false
  },
  {
    id: "modern-geometric-lamp",
    name: "Prism Geometric Ambient Table Lamp",
    category: "Lighting",
    price: 119.00,
    rating: 4.9,
    reviewCount: 78,
    description: "Contemporary faceted lampshade with warm diffused ambient lighting and iridescent refractive accents. Perfect accent for nightstands, consoles, and study desks.",
    dimensions: { widthCm: 32, depthCm: 32, heightCm: 52 },
    colors: [
      { name: "Iridescent Opal", hex: "#cbd5e1" },
      { name: "Amber Glow", hex: "#d97706" },
      { name: "Smoked Glass", hex: "#475569" }
    ],
    thumbnail: "/thumbnails/IridescenceLamp.jpg",
    fallbackThumbnail: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/IridescenceLamp/screenshot/screenshot.jpg",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/IridescenceLamp/glTF-Binary/IridescenceLamp.glb",
    localModelUrl: "/models/IridescenceLamp.glb",
    isFeatured: false
  },
  {
    id: "industrial-pendant-lamp",
    name: "Industrial Studio Barn Pendant Lamp",
    category: "Lighting",
    price: 149.00,
    rating: 4.7,
    reviewCount: 51,
    description: "Heavy-gauge spun metal shade with brushed anisotropic finish and exposed vintage brass fittings. Ideal lighting for dining tables, kitchen islands, and workspace desks.",
    dimensions: { widthCm: 38, depthCm: 38, heightCm: 65 },
    colors: [
      { name: "Brushed Steel", hex: "#94a3b8" },
      { name: "Matte Charcoal", hex: "#1e293b" },
      { name: "Aged Brass", hex: "#b45309" }
    ],
    thumbnail: "/thumbnails/AnisotropyBarnLamp.jpg",
    fallbackThumbnail: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AnisotropyBarnLamp/screenshot/screenshot.jpg",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AnisotropyBarnLamp/glTF-Binary/AnisotropyBarnLamp.glb",
    localModelUrl: "/models/AnisotropyBarnLamp.glb",
    isFeatured: false
  },
  {
    id: "vintage-industrial-lantern",
    name: "Cast Iron Studio Lantern",
    category: "Lighting",
    price: 89.00,
    rating: 4.8,
    reviewCount: 67,
    description: "Cast iron frame with distressed brass finish and warm ambient illumination. Adds rustic, industrial charm to shelves, patios, and entryway sideboards.",
    dimensions: { widthCm: 24, depthCm: 24, heightCm: 46 },
    colors: [
      { name: "Aged Brass", hex: "#b58d3d" },
      { name: "Matte Black", hex: "#1a202c" }
    ],
    thumbnail: "/thumbnails/Lantern.jpg",
    fallbackThumbnail: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/screenshot/screenshot.jpg",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb",
    localModelUrl: "/models/Lantern.glb",
    isFeatured: false
  }
];

export async function fetchProducts(category = null) {
  try {
    const url = category && category !== 'All' 
      ? `${API_BASE}/products?category=${encodeURIComponent(category)}`
      : `${API_BASE}/products`;
      
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      const directUrl = category && category !== 'All'
        ? `${BACKEND_DIRECT_URL}/products?category=${encodeURIComponent(category)}`
        : `${BACKEND_DIRECT_URL}/products`;
      const directRes = await fetch(directUrl);
      if (!directRes.ok) throw new Error(`HTTP error! status: ${directRes.status}`);
      return await directRes.json();
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend fetch failed or offline, using fallback catalog:", err);
    if (category && category !== 'All') {
      return FALLBACK_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    return FALLBACK_PRODUCTS;
  }
}

export async function fetchProductById(id) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (res.ok) return await res.json();
    const directRes = await fetch(`${BACKEND_DIRECT_URL}/products/${id}`);
    if (directRes.ok) return await directRes.json();
    const found = FALLBACK_PRODUCTS.find(p => p.id === id);
    if (found) return found;
    throw new Error("Product not found");
  } catch (err) {
    const found = FALLBACK_PRODUCTS.find(p => p.id === id);
    if (found) return found;
    throw err;
  }
}

export async function fetchServerInfo() {
  try {
    const res = await fetch(`${API_BASE}/server-info`);
    if (res.ok) return await res.json();
    const directRes = await fetch(`${BACKEND_DIRECT_URL}/server-info`);
    if (directRes.ok) return await directRes.json();
    return { localIp: window.location.hostname, frontendNetworkUrl: window.location.origin };
  } catch (err) {
    return { localIp: window.location.hostname, frontendNetworkUrl: window.location.origin };
  }
}
