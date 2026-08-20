import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import ARViewer from './components/ARViewer';
import CheckoutModal from './components/CheckoutModal';
import CartDrawer from './components/CartDrawer';
import { fetchProducts } from './services/api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // E-commerce states
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  
  // Checkout & Cart Modal state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutColor, setCheckoutColor] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Load products on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data);

        // Check if URL hash matches a product id for direct deep-linking
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          const match = data.find((p) => p.id === hash);
          if (match) setSelectedProduct(match);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Listen to hash changes (e.g. browser back/forward or mobile deep links)
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    window.location.hash = product.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setSelectedProduct(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Wishlist toggle
  const handleToggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Add to Cart
  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const index = prev.findIndex((item) => item.id === product.id);
      if (index > -1) {
        const updated = [...prev];
        updated[index].quantity += 1;
        return updated;
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId, newQty) => {
    setCartItems((prev) => 
      prev.map((item) => item.id === productId ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // Direct Buy Now / Express Checkout
  const handleBuyNow = (product, color = null) => {
    setCheckoutProduct(product);
    setCheckoutColor(color || product?.colors?.[0] || null);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="app-container">
      <Navbar 
        selectedProduct={selectedProduct} 
        onBackToCatalog={handleBackToCatalog}
        wishlistCount={wishlist.length}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main style={{ flexGrow: 1 }}>
        {selectedProduct ? (
          <ARViewer 
            product={selectedProduct} 
            onBack={handleBackToCatalog}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        ) : (
          <ProductGrid 
            products={products} 
            loading={loading} 
            onSelectProduct={handleSelectProduct}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}
      </main>

      {/* Express Buy / Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct}
        selectedColor={checkoutColor}
        onOpenAR={(product) => {
          handleSelectProduct(product);
        }}
      />

      {/* Slide-over Shopping Bag */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={(item) => {
          handleBuyNow(item);
        }}
        onOpenAR={(product) => {
          handleSelectProduct(product);
        }}
      />

      {/* Aesthetic TRYSPACE Footer */}
      <footer style={{ 
        marginTop: '5rem', 
        paddingTop: '2.5rem', 
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        fontSize: '0.88rem',
        color: 'var(--text-secondary)'
      }}>
        <div>
          <strong style={{ color: '#111827', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            TRYSPACE<span style={{ color: 'var(--accent-rose)' }}>.</span>
          </strong> — AI & Augmented Reality Virtual Shopping Platform
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem' }}>
          <span>Real-Scale 3D</span>
          <span>Google AR Camera (ARCore)</span>
          <span>Instant Express Checkout</span>
          <span>SIH Prototype</span>
        </div>
      </footer>
    </div>
  );
}
