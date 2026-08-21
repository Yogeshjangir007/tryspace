import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Copy, Check, Wifi, Globe, ExternalLink, Sparkles } from 'lucide-react';
import { fetchServerInfo } from '../services/api';

export default function QRCodeModal({ product, onClose }) {
  const [copied, setCopied] = useState(false);
  const [networkIp, setNetworkIp] = useState('10.209.186.161');
  const [customPort, setCustomPort] = useState('5173');
  const [qrMode, setQrMode] = useState('web'); // 'web' | 'android-sceneviewer'
  const [targetUrl, setTargetUrl] = useState('');

  useEffect(() => {
    async function loadServerInfo() {
      try {
        const info = await fetchServerInfo();
        if (info.localIp && !info.localIp.startsWith('127.')) {
          setNetworkIp(info.localIp);
        }
      } catch (e) {
        console.warn("Could not fetch server info:", e);
      }
    }
    loadServerInfo();
  }, []);

  useEffect(() => {
    if (qrMode === 'web') {
      // Normal web app link accessible over LAN
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
      const url = `${protocol}//${networkIp}:${customPort}/#${product.id}`;
      setTargetUrl(url);
    } else {
      // Standard Google Scene Viewer link for instant 1-tap Android camera AR
      const absoluteGlb = product.modelUrl;
      const sceneViewerUrl = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(absoluteGlb)}&mode=ar_only&title=${encodeURIComponent(product.name)}&resizable=true`;
      setTargetUrl(sceneViewerUrl);
    }
  }, [networkIp, customPort, qrMode, product]);

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          id="qr-modal-close"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Smartphone size={22} color="#38bdf8" />
          <h3 style={{ fontSize: '1.25rem' }}>Try AR on Your Phone</h3>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto 1rem' }}>
          Scan with your phone's camera to visualize <strong>{product.name}</strong> in real-scale augmented reality on your room floor.
        </p>

        {/* Mode Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <button 
            className={`pill-btn ${qrMode === 'web' ? 'active' : ''}`}
            onClick={() => setQrMode('web')}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
          >
            <Wifi size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            <span>Wi-Fi Network App</span>
          </button>
          <button 
            className={`pill-btn ${qrMode === 'android-sceneviewer' ? 'active' : ''}`}
            onClick={() => setQrMode('android-sceneviewer')}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
          >
            <Sparkles size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            <span>Direct Google AR Link</span>
          </button>
        </div>

        {/* QR Code Canvas */}
        <div className="qr-canvas-wrap">
          <QRCodeSVG 
            value={targetUrl || `http://${networkIp}:${customPort}/#${product.id}`}
            size={185}
            level="M"
            includeMargin={true}
          />
        </div>

        {/* Instructions */}
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.1)', 
          border: '1px solid rgba(99, 102, 241, 0.25)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '0.65rem 0.85rem',
          fontSize: '0.78rem',
          color: '#c7d2fe',
          textAlign: 'left',
          marginBottom: '0.85rem'
        }}>
          <strong>Quick Steps:</strong>
          <ol style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
            <li>Ensure phone & computer are on the same Wi-Fi.</li>
            <li>Scan QR with iOS Camera or Android Google Lens.</li>
            <li>Tap <strong>"Place in Room"</strong> to anchor onto floor.</li>
          </ol>
        </div>

        {/* IP Configurator input if user wants to customize host */}
        {qrMode === 'web' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Host IP:</span>
            <input 
              type="text" 
              value={networkIp}
              onChange={(e) => setNetworkIp(e.target.value)}
              className="search-input"
              style={{ width: '140px', padding: '0.25rem 0.6rem', fontSize: '0.78rem', textAlign: 'center' }}
              placeholder="192.168.x.x"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Port:</span>
            <input 
              type="text" 
              value={customPort}
              onChange={(e) => setCustomPort(e.target.value)}
              className="search-input"
              style={{ width: '60px', padding: '0.25rem 0.5rem', fontSize: '0.78rem', textAlign: 'center' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <button 
            className="back-btn" 
            onClick={handleCopy}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? "Link Copied!" : "Copy Mobile URL"}</span>
          </button>
        </div>

        <div className="modal-url-box">
          {targetUrl}
        </div>
      </div>
    </div>
  );
}
