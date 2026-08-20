import React, { useState } from 'react';
import { X, Check, ShieldCheck, Store, ArrowRight } from 'lucide-react';

export default function RetailerModal({ isOpen, onClose }) {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  
  // Retailer form state
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Admin form state
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  if (!isOpen) return null;

  const handleRetailerSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setAdminLoggedIn(true);
    setTimeout(() => {
      setAdminLoggedIn(false);
      setShowAdminLogin(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay-luxury" onClick={onClose}>
      <div className="modal-luxury-card" onClick={(e) => e.stopPropagation()}>
        <button 
          className="card-wishlist-btn" 
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* NESTED ADMIN ACCESS MODAL (Matching Screenshot 1) */}
        {showAdminLogin ? (
          <div className="admin-nested-popup">
            <button 
              className="card-wishlist-btn" 
              style={{ position: 'absolute', top: '1rem', right: '1rem', width: '30px', height: '30px' }}
              onClick={() => setShowAdminLogin(false)}
            >
              <X size={14} />
            </button>

            <span className="modal-overline">TRYSPACE / AROOM ADMIN</span>
            <h2 className="modal-title-editorial" style={{ fontSize: '2.1rem' }}>Admin access.</h2>
            <p className="modal-subtitle" style={{ fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Only the platform administrator can approve retailer applications in this prototype.
            </p>

            {adminLoggedIn ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--success)' }}>
                <Check size={36} style={{ margin: '0 auto 0.5rem' }} />
                <h4 style={{ color: '#111827' }}>Admin Access Granted</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Redirecting to verified dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleAdminSubmit}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Admin ID</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Admin ID"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      required 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="Password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Prototype credentials: admin / sih2026 (or any input for demo).
                </p>

                <button type="submit" className="btn-submit-full" style={{ padding: '0.8rem' }}>
                  Login as Admin →
                </button>
              </form>
            )}
          </div>
        ) : null}

        {/* PRIMARY RETAILER REGISTRATION MODAL */}
        <span className="modal-overline">SELL ON AROOM / TRYSPACE</span>
        <h2 className="modal-title-editorial">Become a retailer.</h2>
        <p className="modal-subtitle">
          Create your shop profile. For this SIH prototype, every new retailer starts as <strong>Pending verification</strong> and can upload 3D furniture models upon approval.
        </p>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#10b981' }}>
            <Check size={42} style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ color: '#111827', fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>Application Submitted!</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              Your store <strong>{shopName || "New Boutique"}</strong> has been registered with status: <em>Pending Verification</em>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRetailerSubmit}>
            <div className="form-group">
              <label className="form-label">Shop name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Nordic Atelier Studio"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="shop@brand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn-submit-full">
              Submit / Login →
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button 
                type="button" 
                className="modal-admin-link-btn"
                onClick={() => setShowAdminLogin(true)}
              >
                Admin login →
              </button>
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.85rem' }}>
              Prototype flow: submit once → admin approves → retailer logs in → adds 3D products.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
