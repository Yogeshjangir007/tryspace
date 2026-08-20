import React, { useState } from 'react';
import { Box, Eye, ArrowRight, Smartphone, Heart, ShoppingBag } from 'lucide-react';

const CATEGORY_TAGS = {
  'glam-velvet-sofa': 'Velvet • Channel Tufted • Statement',
  'velvet-lounge-armchair': 'Soft • Ergonomic • Brushed Brass',
  'sheen-wood-leather-sofa': 'Hardwood • Top-Grain Leather • Mid-Century',
  'botanical-indoor-plant': 'Botanical • Fiddle-Leaf • Ceramic Pot',
  'modern-geometric-lamp': 'Iridescent • Faceted • Ambient Glow',
  'industrial-pendant-lamp': 'Spun Steel • Vintage Brass • Loft',
  'vintage-industrial-lantern': 'Cast Iron • Distressed Brass • Ambient'
};

const CATEGORY_FALLBACKS = {
  'glam-velvet-sofa': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/screenshot/screenshot.jpg',
  'velvet-lounge-armchair': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/screenshot/screenshot.jpg',
  'sheen-wood-leather-sofa': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenWoodLeatherSofa/screenshot/screenshot.jpg',
  'botanical-indoor-plant': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DiffuseTransmissionPlant/screenshot/screenshot.jpg',
  'modern-geometric-lamp': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/IridescenceLamp/screenshot/screenshot.jpg',
  'industrial-pendant-lamp': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AnisotropyBarnLamp/screenshot/screenshot.jpg',
  'vintage-industrial-lantern': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/screenshot/screenshot.jpg'
};

export default function ProductCard({ 
  product, 
  onSelect,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow
}) {
  const [imgSrc, setImgSrc] = useState(product.thumbnail);

  const handleImgError = () => {
    if (imgSrc === product.thumbnail && product.fallbackThumbnail) {
      setImgSrc(product.fallbackThumbnail);
    } else if (CATEGORY_FALLBACKS[product.id]) {
      setImgSrc(CATEGORY_FALLBACKS[product.id]);
    }
  };

  const styleTag = CATEGORY_TAGS[product.id] || 'Modern • Curated • Real-Scale';

  return (
    <div 
      className="luxury-product-card"
      onClick={() => onSelect(product)}
      id={`product-card-${product.id}`}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(product); }}
    >
      {/* Image container */}
      <div className="card-top-image-box">
        <span className="card-cat-tag">{product.category}</span>
        
        <div className="card-ar-badge">
          <Smartphone size={12} />
          <span>Phone AR</span>
        </div>

        <img 
          src={imgSrc} 
          alt={product.name}
          className="card-img-cover"
          loading="lazy"
          onError={handleImgError}
        />

        {/* Wishlist Button */}
        <button 
          className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist && onToggleWishlist(product);
          }}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label="Wishlist"
        >
          <Heart 
            size={15} 
            fill={isWishlisted ? "var(--accent-rose)" : "none"} 
            color={isWishlisted ? "var(--accent-rose)" : "currentColor"} 
          />
        </button>
      </div>

      {/* Details */}
      <div className="card-body">
        <h3 className="card-title-serif">{product.name}</h3>
        <p className="card-style-tags">{styleTag}</p>

        {product.dimensions && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
            📐 {product.dimensions.widthCm}W × {product.dimensions.depthCm}D × {product.dimensions.heightCm}H cm
          </p>
        )}

        <div className="card-price-row">
          <span className="card-price-tag">${product.price.toFixed(2)}</span>
          <button 
            className="btn-generate-look"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            id={`btn-view-ar-${product.id}`}
          >
            <span>Scan QR / AR</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="card-actions-sub-row">
          <button 
            className="btn-card-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart && onAddToCart(product);
            }}
            id={`btn-add-cart-${product.id}`}
          >
            Add to Bag
          </button>

          <button 
            className="btn-card-rose"
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow ? onBuyNow(product) : onSelect(product);
            }}
            id={`btn-buy-now-${product.id}`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
