import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  Smartphone, 
  RotateCw, 
  RotateCcw, 
  Maximize2, 
  Sparkles, 
  Camera, 
  Copy, 
  Check, 
  QrCode, 
  Loader2, 
  Wifi, 
  ShoppingBag,
  CreditCard,
  Edit3
} from 'lucide-react';
import { fetchServerInfo } from '../services/api';

export default function ARViewer({ 
  product, 
  onBack,
  onAddToCart,
  onBuyNow
}) {
  const modelViewerRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
  const [modelLoading, setModelLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Network IP configuration for QR code
  const [networkIp, setNetworkIp] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.hostname;
    }
    return '';
  });
  const [networkPort, setNetworkPort] = useState('5173');
  const [qrType, setQrType] = useState('direct-sceneviewer'); // 'direct-sceneviewer' (Any network/4G) | 'web' (Local Wi-Fi)
  const [isEditingIp, setIsEditingIp] = useState(false);

  // Model source (Absolute HTTPS required for Google Scene Viewer)
  const modelSrc = product?.modelUrl || product?.localModelUrl;

  // URLs (mode=ar_preferred loads 3D preview and initializes AR camera smoothly without black screen)
  const isTunnelOrDomain = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const webAppUrl = isTunnelOrDomain 
    ? `${window.location.origin}/#${product.id}` 
    : `${protocol}//${networkIp}:${networkPort}/#${product.id}`;
  const directGoogleARUrl = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(product.modelUrl)}&mode=ar_preferred&title=${encodeURIComponent(product.name)}&resizable=true`;
  const sceneViewerIntent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(product.modelUrl)}&mode=ar_preferred&title=${encodeURIComponent(product.name)}&resizable=true#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;`;

  const activeQrValue = qrType === 'web' ? webAppUrl : directGoogleARUrl;

  useEffect(() => {
    async function loadServer() {
      try {
        const info = await fetchServerInfo();
        if (info.localIp && !info.localIp.startsWith('127.')) {
          setNetworkIp(info.localIp);
        }
      } catch (e) {
        console.warn("Could not fetch server info:", e);
      }
    }
    loadServer();
  }, []);

  useEffect(() => {
    setModelLoading(true);
    setSelectedColor(product?.colors?.[0] || null);
  }, [product]);

  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      setModelLoading(false);
      
      // Apply initial color if defined
      if (selectedColor && viewer.model && viewer.model.materials && viewer.model.materials[0]) {
        try {
          const material = viewer.model.materials[0];
          if (material && material.pbrMetallicRoughness) {
            const hex = selectedColor.hex.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;
            material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1.0]);
          }
        } catch (e) {
          console.warn("Material color apply:", e);
        }
      }
    };

    const handleError = () => {
      setModelLoading(false);
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, [product, selectedColor]);

  // Launch Native Google AR Camera directly on phone
  const handleLaunchPhoneAR = () => {
    if (modelViewerRef.current && modelViewerRef.current.canActivateAR) {
      try {
        modelViewerRef.current.activateAR();
        return;
      } catch (e) {
        console.warn("activateAR fallback:", e);
      }
    }

    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href = sceneViewerIntent;
    } else {
      window.location.href = directGoogleARUrl;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeQrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
    if (modelViewerRef.current) {
      modelViewerRef.current.autoRotate = !autoRotate;
    }
  };

  const handleResetCamera = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.cameraOrbit = 'auto auto auto';
      modelViewerRef.current.cameraTarget = 'auto auto auto';
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    if (modelViewerRef.current && modelViewerRef.current.model) {
      try {
        const material = modelViewerRef.current.model.materials[0];
        if (material && material.pbrMetallicRoughness) {
          const hex = color.hex.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16) / 255;
          const g = parseInt(hex.substring(2, 4), 16) / 255;
          const b = parseInt(hex.substring(4, 6), 16) / 255;
          material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1.0]);
        }
      } catch (e) {
        console.log("Material update:", e);
      }
    }
  };

  return (
    <div className="ar-page-container">
      {/* Mobile Top Callout (Visible on Phones) */}
      <div className="mobile-ar-hero-banner" style={{
        background: '#111827',
        color: 'white',
        padding: '1rem',
        borderRadius: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        textAlign: 'center',
        marginBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="var(--accent-rose)" />
          <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>Ready to place in your room?</span>
        </div>
        <button 
          className="btn-pill-primary"
          style={{ background: 'var(--accent-rose)', width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}
          onClick={handleLaunchPhoneAR}
          id="btn-phone-hero-ar"
        >
          <Camera size={20} />
          <span>Launch Google AR Camera (Place on Floor)</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="ar-main-content">
        {/* 3D Model Viewer Card */}
        <div className="viewer-card">
          {/* Top Overlay Badge */}
          <div className="viewer-overlay-top">
            <div className="badge-3d">
              <Sparkles size={13} color="#f43f5e" />
              <span>TRYSPACE 3D Preview</span>
            </div>

            <div className="dimension-badge">
              📐 {product.dimensions?.widthCm}W × {product.dimensions?.depthCm}D × {product.dimensions?.heightCm}H cm
            </div>
          </div>

          {/* Loading Spinner */}
          {modelLoading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(11, 15, 25, 0.75)',
              zIndex: 15,
              gap: '0.75rem',
              color: '#ffffff'
            }}>
              <Loader2 size={36} className="spin-slow" />
              <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>Loading TRYSPACE 3D Furniture...</span>
            </div>
          )}

          {/* Google model-viewer Web Component */}
          <model-viewer
            ref={modelViewerRef}
            src={product.modelUrl}
            poster={product.thumbnail}
            alt={`3D model of ${product.name}`}
            ar
            ar-modes="scene-viewer quick-look webxr"
            ar-scale="auto"
            ar-placement="floor"
            camera-controls
            auto-rotate={autoRotate ? "" : undefined}
            auto-rotate-delay="500"
            rotation-per-second="20deg"
            shadow-intensity="1.6"
            shadow-softness="0.75"
            exposure="1.05"
            environment-image="neutral"
            bounds="tight"
            loading="eager"
            reveal="auto"
            touch-action="pan-y"
            camera-target="auto auto auto"
            style={{ width: '100%', height: '100%' }}
          >
            <button 
              slot="ar-button"
              id="model-viewer-native-ar-btn"
              className="launch-ar-btn"
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}
            >
              <Camera size={18} />
              <span>Launch Google AR Camera</span>
            </button>
          </model-viewer>

          {/* Floating Controls Bar */}
          <div className="viewer-overlay-bottom">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`viewer-ctrl-btn ${autoRotate ? 'active' : ''}`}
                onClick={toggleAutoRotate}
                title={autoRotate ? "Pause Rotation" : "Start Rotation"}
              >
                <RotateCw size={16} />
              </button>

              <button 
                className="viewer-ctrl-btn"
                onClick={handleResetCamera}
                title="Reset Camera"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Mobile 1-Tap AR Camera Launch Button */}
            <button 
              className="launch-ar-btn" 
              onClick={handleLaunchPhoneAR}
              id="btn-launch-phone-ar-bottom"
            >
              <Camera size={18} />
              <span>Launch AR Camera</span>
            </button>
          </div>
        </div>

        {/* Right Side Panel: Specs + Buy Now + Live QR Code */}
        <div className="product-details-panel">
          <div className="detail-header">
            <span className="detail-category">{product.category}</span>
            <h1 className="detail-title">{product.name}</h1>
            <div className="detail-price-row">
              <span className="detail-price">${product.price.toFixed(2)}</span>
            </div>
          </div>

          {/* BUY NOW & ADD TO BAG ACTION ROW */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn-pill-primary"
              style={{ flex: 1.2, justifyContent: 'center', padding: '0.9rem', fontSize: '0.95rem' }}
              onClick={() => onBuyNow && onBuyNow(product, selectedColor)}
              id="btn-buy-now-viewer"
            >
              <CreditCard size={18} />
              <span>Buy Now • ${product.price.toFixed(2)}</span>
            </button>

            <button 
              className="btn-pill-secondary"
              style={{ flex: 1, justifyContent: 'center', padding: '0.9rem', fontSize: '0.95rem' }}
              onClick={() => onAddToCart && onAddToCart(product)}
              id="btn-add-bag-viewer"
            >
              <ShoppingBag size={18} />
              <span>Add to Bag</span>
            </button>
          </div>

          {/* Color Finish Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="colors-box">
              <span className="colors-title">
                Finish: <strong style={{ color: '#111827' }}>{selectedColor?.name}</strong>
              </span>
              <div className="color-swatches">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    className={`color-btn ${selectedColor?.name === c.name ? 'active' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => handleColorChange(c)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Real-Scale Dimensions */}
          {product.dimensions && (
            <div className="spec-box">
              <span className="spec-title">
                <Maximize2 size={13} />
                <span>Exact Scale Dimensions</span>
              </span>
              <div className="spec-grid">
                <div className="spec-item">
                  <span className="spec-val">{product.dimensions.widthCm} cm</span>
                  <span className="spec-lbl">Width</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val">{product.dimensions.depthCm} cm</span>
                  <span className="spec-lbl">Depth</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val">{product.dimensions.heightCm} cm</span>
                  <span className="spec-lbl">Height</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
             LIVE PHONE AR QR CODE CARD
             ============================================================ */}
          <div id="qr-section-anchor" style={{
            background: '#ffffff',
            border: '2px solid #111827',
            borderRadius: '24px',
            padding: '1.6rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Smartphone size={22} color="var(--accent-rose)" />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#111827' }}>
                Scan to Open AR on Phone
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
              {qrType === 'direct-sceneviewer' ? (
                <span><strong>No same Wi-Fi needed!</strong> Scan with your phone camera or Google Lens to download directly from the cloud and open in AR.</span>
              ) : (
                <span>Opens the interactive TrySpace website on your phone. (Requires same Wi-Fi).</span>
              )}
            </p>

            {/* QR Mode Switcher Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
              <button 
                onClick={() => setQrType('direct-sceneviewer')}
                style={{
                  background: qrType === 'direct-sceneviewer' ? '#111827' : '#f3efe8',
                  color: qrType === 'direct-sceneviewer' ? 'white' : '#4b5563',
                  border: 'none',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Cloud AR (Any Network / 4G / 5G)
              </button>

              <button 
                onClick={() => setQrType('web')}
                style={{
                  background: qrType === 'web' ? '#111827' : '#f3efe8',
                  color: qrType === 'web' ? 'white' : '#4b5563',
                  border: 'none',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Wifi size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Full Web App (Same Wi-Fi)
              </button>
            </div>

            {/* Live QR Code Canvas */}
            <div style={{
              background: '#ffffff',
              padding: '0.85rem',
              borderRadius: '16px',
              display: 'inline-block',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              border: '1px solid var(--border-subtle)'
            }}>
              <QRCodeSVG 
                value={activeQrValue}
                size={185}
                level="M"
                includeMargin={true}
              />
            </div>

            {/* Host IP Configurator Toggle */}
            {qrType === 'web' && (
              <div style={{ marginTop: '0.85rem' }}>
                {!isEditingIp ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Target IP: <strong>{networkIp}:{networkPort}</strong></span>
                    <button 
                      onClick={() => setIsEditingIp(true)}
                      style={{ background: 'none', border: 'none', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Change IP"
                    >
                      <Edit3 size={12} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', marginTop: '0.4rem' }}>
                    <input 
                      type="text" 
                      value={networkIp} 
                      onChange={(e) => setNetworkIp(e.target.value)}
                      style={{ width: '130px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                      placeholder="192.168.x.x"
                    />
                    <button 
                      onClick={() => setIsEditingIp(false)}
                      style={{ background: '#111827', color: 'white', border: 'none', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Steps */}
            <div style={{
              background: '#f8f6f2',
              borderRadius: '12px',
              padding: '0.75rem 0.85rem',
              fontSize: '0.75rem',
              color: '#334155',
              textAlign: 'left',
              marginTop: '0.85rem',
              lineHeight: '1.4'
            }}>
              <strong>Quick Steps:</strong>
              <ol style={{ paddingLeft: '1.2rem', marginTop: '0.2rem' }}>
                <li>Phone and computer must be on the <strong>same Wi-Fi</strong>.</li>
                <li>Scan QR with Camera or Google Lens.</li>
                <li>Tap <strong>"Launch Google AR Camera"</strong> on your phone!</li>
              </ol>
            </div>

            {/* Direct Mobile Launch & Copy Link */}
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                className="btn-pill-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.8rem 1.2rem', fontSize: '0.9rem' }}
                onClick={handleLaunchPhoneAR}
                id="btn-direct-phone-ar"
              >
                <Camera size={18} />
                <span>Launch Google AR on This Device</span>
              </button>

              <button 
                className="btn-retailer"
                onClick={handleCopyLink}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copied ? "Link Copied!" : "Copy Mobile Link"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
