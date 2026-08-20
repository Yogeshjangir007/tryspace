import React from 'react';
import { ArrowLeft, ShoppingBag, Heart, Smartphone } from 'lucide-react';

export default function Navbar({ 
  selectedProduct, 
  onBackToCatalog,
  wishlistCount = 0,
  cartCount = 0,
  onOpenCart
}) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo: TRYSPACE. */}
        <div className="nav-brand" onClick={onBackToCatalog}>
          <span className="nav-logo-text">TRYSPACE<span className="nav-logo-dot"></span></span>
        </div>

        {/* Center Links */}
        <nav className="nav-links">
          <button className="nav-link-item active" onClick={onBackToCatalog}>
            Shop
          </button>
          <button 
            className="nav-link-item"
            onClick={() => {
              const el = document.getElementById('products-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Virtual AR
          </button>
          <button 
            className="nav-link-item"
            onClick={() => {
              if (selectedProduct) {
                const el = document.getElementById('qr-section-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                const el = document.getElementById('products-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Scan QR Code
          </button>
        </nav>

        {/* Right Actions: Back to Catalog, Wishlist, Cart */}
        <div className="nav-actions">
          {selectedProduct && (
            <button 
              className="btn-retailer" 
              onClick={onBackToCatalog}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <ArrowLeft size={16} />
              <span>Catalog</span>
            </button>
          )}

          <button 
            className="btn-icon-counter"
            title="Wishlist"
            onClick={() => {
              const el = document.getElementById('products-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Heart size={16} fill={wishlistCount > 0 ? "var(--accent-rose)" : "none"} color={wishlistCount > 0 ? "var(--accent-rose)" : "currentColor"} />
            <span>{wishlistCount}</span>
          </button>

          <button 
            className="btn-cart-black"
            onClick={onOpenCart}
            id="btn-open-cart"
          >
            <ShoppingBag size={15} />
            <span>Bag</span>
            <span className="badge-count">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
