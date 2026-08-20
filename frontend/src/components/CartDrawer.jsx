import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Camera, CreditCard } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem,
  onCheckout,
  onOpenAR 
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>TRYSPACE Bag ({cartItems.length})</h3>
          </div>
          <button className="card-wishlist-btn" style={{ width: '32px', height: '32px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto 0', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h4 style={{ color: '#111827', marginBottom: '0.4rem' }}>Your shopping bag is empty</h4>
            <p style={{ fontSize: '0.85rem' }}>Explore our 3D furniture catalog, preview in real AR, and add items to your bag.</p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                <img src={item.thumbnail} alt={item.name} className="cart-item-img" />
                <div style={{ flex: 1 }}>
                  <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827' }}>{item.name}</h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>${(item.price * item.quantity).toFixed(2)}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f3efe8', borderRadius: 'var(--radius-full)', padding: '0.2rem 0.6rem' }}>
                      <button 
                        onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveItem(item.id)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Estimated Subtotal</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>${subtotal.toFixed(2)}</span>
            </div>

            <button 
              className="btn-pill-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
              onClick={() => {
                onClose();
                onCheckout(cartItems[0]);
              }}
            >
              <CreditCard size={18} />
              <span>Checkout Order • ${subtotal.toFixed(2)} →</span>
            </button>

            <button 
              className="btn-pill-secondary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}
              onClick={() => {
                onClose();
                onOpenAR(cartItems[0]);
              }}
            >
              <Camera size={16} />
              <span>Scan QR & Preview Bag in AR</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
