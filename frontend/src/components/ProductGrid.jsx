import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { Search, Sparkles, SlidersHorizontal, Box, ArrowRight, Smartphone, QrCode, Heart, ShoppingBag } from 'lucide-react';

const CATEGORIES = ['All', 'Seating', 'Lighting', 'Décor'];

export default function ProductGrid({ 
  products, 
  loading, 
  onSelectProduct,
  wishlist = [],
  onToggleWishlist,
  onAddToCart,
  onBuyNow
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = 
        selectedCategory === 'All' || 
        p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const featuredProduct = products[0] || {
    id: "glam-velvet-sofa",
    name: "Luxury Glam Velvet 3-Seater Sofa",
    price: 899,
    thumbnail: "/thumbnails/GlamVelvetSofa.jpg"
  };

  return (
    <div className="catalog-container">
      {/* ============================================================
         AESTHETIC EDITORIAL HERO (TRYSPACE — See it. Try it. Buy it.)
         ============================================================ */}
      <section className="hero-container">
        <div className="hero-content">
          <span className="hero-overline">TRYSPACE AI & AR VIRTUAL SHOPPING</span>
          
          <h1 className="hero-title-editorial">
            See it.<br />
            Try it.<br />
            Buy it.
          </h1>

          <p className="hero-desc">
            Visualize luxury furniture in your exact living space before you buy. TRYSPACE helps you make confident choices, scan instant QR codes for phone AR, and purchase seamlessly.
          </p>

          <div className="hero-cta-row">
            <button 
              className="btn-pill-primary"
              onClick={() => {
                const el = document.getElementById('products-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Explore Collection</span>
              <ArrowRight size={16} />
            </button>

            <button 
              className="btn-pill-secondary"
              onClick={() => onSelectProduct(featuredProduct)}
            >
              <QrCode size={16} color="var(--accent-rose)" />
              <span>Scan QR Code (AR)</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="hero-stats-row">
            <div className="stat-item">
              <span className="stat-val">100%</span>
              <span className="stat-lbl">Real-Scale AR</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">Instant</span>
              <span className="stat-lbl">QR Phone Camera</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">Fast</span>
              <span className="stat-lbl">Express Checkout</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Collage */}
        <div className="hero-collage-wrap">
          <div className="hero-main-card">
            <div className="badge-floating-top-left">
              <Sparkles size={12} color="var(--accent-rose)" />
              <span>✦ AI FIT 98%</span>
            </div>

            <div className="hero-main-img-wrap" onClick={() => onSelectProduct(featuredProduct)} style={{ cursor: 'pointer' }}>
              <img 
                src={featuredProduct.thumbnail || "/thumbnails/GlamVelvetSofa.jpg"} 
                alt={featuredProduct.name}
                className="hero-main-img"
              />
            </div>

            <div className="hero-main-footer">
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  TRYSPACE Signature
                </span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#111827' }}>
                  {featuredProduct.name}
                </h4>
              </div>

              <button 
                className="btn-generate-look"
                onClick={() => onSelectProduct(featuredProduct)}
                style={{ padding: '0.45rem 1.1rem' }}
              >
                <span>3D AR</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Floating Top Right Micro-card */}
          <div className="badge-floating-top-right">
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)' }}>
              ✦
            </div>
            <div>
              <strong style={{ fontSize: '0.78rem', display: 'block', color: '#111827' }}>TRYSPACE EDIT</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Curated Real-Scale</span>
            </div>
          </div>

          {/* Floating Bottom Left Micro-card */}
          <div className="badge-floating-bottom">
            <Heart size={18} color="var(--accent-rose)" fill="var(--accent-rose)" />
            <div>
              <strong style={{ fontSize: '0.78rem', display: 'block', color: '#111827' }}>FEELS LIKE HOME</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scan QR for Floor AR</span>
            </div>
          </div>

          {/* Floating Category Thumbnail Card */}
          <div className="thumb-floating-card">
            <img src="/thumbnails/DiffuseTransmissionPlant.jpg" alt="Decor" />
            <span>Décor</span>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section className="catalog-section" id="products-grid">
        <div className="catalog-header-row">
          <div className="filter-pills-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`pill-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                id={`filter-cat-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-bar-wrap">
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search TRYSPACE furniture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <Box size={36} className="spin-slow" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ fontWeight: 600 }}>Loading TRYSPACE 3D catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: '24px', textAlign: 'center', padding: '3rem 1.5rem', border: '1px solid var(--border-subtle)' }}>
            <SlidersHorizontal size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>No products match your filter</h3>
            <button 
              className="pill-filter-btn active" 
              style={{ marginTop: '1.25rem' }}
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="products-luxury-grid">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onSelect={onSelectProduct}
                isWishlisted={wishlist.some(w => w.id === product.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
