import React, { useState } from 'react';
import { 
  X, 
  Check, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  ArrowRight,
  ShoppingBag,
  Smartphone
} from 'lucide-react';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  product, 
  selectedColor,
  quantity = 1,
  onOpenAR
}) {
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'cod'
  const [isProcessing, setIsProcessing] = useState(false);

  // Customer info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [orderId, setOrderId] = useState('');

  if (!isOpen || !product) return null;

  const itemPrice = product.price || 0;
  const subtotal = itemPrice * quantity;
  const shipping = subtotal > 500 ? 0 : 29.00;
  const total = subtotal + shipping;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      const randomOrderId = `TS-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(randomOrderId);
      setIsProcessing(false);
      setStep('success');
    }, 1200);
  };

  const handleClose = () => {
    setStep('form');
    onClose();
  };

  return (
    <div className="modal-overlay-luxury" onClick={handleClose}>
      <div className="modal-luxury-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', padding: '2.25rem' }}>
        <button 
          className="card-wishlist-btn" 
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: '34px', height: '34px' }}
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {step === 'success' ? (
          /* ================= ORDER CONFIRMATION ================= */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.2)'
            }}>
              <Check size={32} />
            </div>

            <span className="modal-overline">ORDER CONFIRMED</span>
            <h2 className="modal-title-editorial" style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>
              Thank you for your order.
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Order ID: <strong style={{ color: '#111827' }}>#{orderId}</strong>. A confirmation email has been sent to <strong>{email || 'your email'}</strong>.
            </p>

            {/* Purchased Item Card */}
            <div style={{
              background: '#f8f6f2',
              borderRadius: '16px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <img 
                src={product.thumbnail} 
                alt={product.name} 
                style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', background: 'white', padding: '4px' }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', color: '#111827', fontWeight: 700 }}>{product.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Finish: {selectedColor?.name || 'Standard'} • Qty: {quantity}
                </p>
                <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>${total.toFixed(2)}</strong>
              </div>
            </div>

            {/* AR Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                className="btn-pill-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem 1.4rem' }}
                onClick={() => {
                  handleClose();
                  onOpenAR && onOpenAR(product);
                }}
              >
                <Camera size={18} />
                <span>Place Your Purchased Furniture in Room (AR) →</span>
              </button>

              <button 
                className="btn-pill-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1.2rem' }}
                onClick={handleClose}
              >
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= CHECKOUT FORM ================= */
          <div>
            <span className="modal-overline">TRYSPACE EXPRESS CHECKOUT</span>
            <h2 className="modal-title-editorial" style={{ fontSize: '2.1rem' }}>Instant Purchase.</h2>

            {/* Product Summary Header */}
            <div style={{
              background: '#f8f6f2',
              borderRadius: '16px',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              margin: '1rem 0 1.25rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <img 
                src={product.thumbnail} 
                alt={product.name} 
                style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', background: 'white', padding: '3px' }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.92rem', color: '#111827', fontWeight: 700, lineHeight: '1.2' }}>{product.name}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Finish: {selectedColor?.name || 'Standard'} • Qty: {quantity}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '1.15rem', color: '#111827' }}>${total.toFixed(2)}</strong>
                <span style={{ display: 'block', fontSize: '0.68rem', color: shipping === 0 ? '#059669' : 'var(--text-muted)' }}>
                  {shipping === 0 ? 'Free Shipping' : `+$${shipping} delivery`}
                </span>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder}>
              {/* Shipping Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Jane Doe" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="jane@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Street address, apartment, suite" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City / State</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="New York, NY" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Postal / ZIP Code</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="10001" 
                    required
                  />
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                  Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      background: paymentMethod === 'card' ? '#111827' : '#f8f6f2',
                      color: paymentMethod === 'card' ? 'white' : '#4b5563',
                      border: '1px solid var(--border-medium)',
                      padding: '0.6rem 0.4rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <CreditCard size={14} />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    style={{
                      background: paymentMethod === 'upi' ? '#111827' : '#f8f6f2',
                      color: paymentMethod === 'upi' ? 'white' : '#4b5563',
                      border: '1px solid var(--border-medium)',
                      padding: '0.6rem 0.4rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Smartphone size={14} />
                    <span>UPI / GPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    style={{
                      background: paymentMethod === 'cod' ? '#111827' : '#f8f6f2',
                      color: paymentMethod === 'cod' ? 'white' : '#4b5563',
                      border: '1px solid var(--border-medium)',
                      padding: '0.6rem 0.4rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Truck size={14} />
                    <span>COD</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn-submit-full" 
                disabled={isProcessing}
                style={{ padding: '0.95rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isProcessing ? (
                  <span>Processing Secure Payment...</span>
                ) : (
                  <span>Complete Purchase • ${total.toFixed(2)} →</span>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.85rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={14} color="#059669" />
                <span>256-bit Encrypted Checkout • 30-Day Free Returns</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
