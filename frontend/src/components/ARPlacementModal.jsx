import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  X, 
  RotateCw, 
  RotateCcw,
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Sliders, 
  Sparkles, 
  Smartphone, 
  Image as ImageIcon,
  Check, 
  Download, 
  AlertCircle, 
  Move, 
  FlipHorizontal,
  Box,
  Eye,
  Layers,
  Palette,
  Video,
  Loader2
} from 'lucide-react';

const ROOM_PRESETS = [
  { 
    id: 'camera', 
    name: 'Live Room Camera', 
    isCamera: true 
  },
  { 
    id: 'living-modern', 
    name: 'Modern Living Room', 
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'scandi-lounge', 
    name: 'Scandinavian Studio', 
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'industrial-loft', 
    name: 'Industrial Loft', 
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'minimalist-space', 
    name: 'Minimalist Apartment', 
    url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1600&auto=format&fit=crop&q=80' 
  }
];

export default function ARPlacementModal({ product, onClose, onOpenQR }) {
  const videoRef = useRef(null);
  const modelViewerRef = useRef(null);
  const streamRef = useRef(null);

  const [activePreset, setActivePreset] = useState(ROOM_PRESETS[0]); // Default to live camera
  const [cameraError, setCameraError] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'

  // Placement transform state
  const [scale, setScale] = useState(1.0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [modelHeightOffset, setModelHeightOffset] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Selected Color / Material
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);

  // UI state
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  const modelSrc = product?.localModelUrl || product?.modelUrl;

  // Initialize camera stream
  const startCamera = async (facing = facingMode) => {
    setCameraError(null);
    setCameraLoading(true);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported or requires secure HTTPS context.");
      }

      let stream;
      try {
        // Try ideal back camera (environment) first
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (err1) {
        try {
          // Fallback to basic facingMode
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facing },
            audio: false
          });
        } catch (err2) {
          // Fallback to any available video stream
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch((e) => console.warn("Video play onloadedmetadata:", e));
          }
        };
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn("Direct video play:", e);
        }
      }

      setCameraActive(true);
      setActivePreset(ROOM_PRESETS[0]);
    } catch (err) {
      console.warn("Camera start failed:", err);
      setCameraError("Camera permission needed or camera unavailable. Switched to Room Environment.");
      setCameraActive(false);
      setActivePreset(ROOM_PRESETS[1]); // Fallback to Modern Living Room image
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (activePreset.isCamera) {
      startCamera(nextFacing);
    }
  };

  // Start camera on mount if activePreset is camera
  useEffect(() => {
    if (activePreset.isCamera) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activePreset.id]);

  // Ensure video element always has stream assigned
  useEffect(() => {
    if (videoRef.current && streamRef.current && activePreset.isCamera) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.warn);
      }
    }
  }, [activePreset.isCamera, cameraActive]);

  // Apply material color dynamically to model-viewer
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
        console.warn("Material color change error:", e);
      }
    }
  };

  // Drag-to-Place handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    setDragStart({ x: clientX - posX, y: clientY - posY });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    setPosX(clientX - dragStart.x);
    setPosY(clientY - dragStart.y);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleCaptureSnapshot = () => {
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2500);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(`TRYSPACE AR Placement — ${product.name}`, 40, 70);
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Dimensions: ${product.dimensions?.widthCm || 0}W × ${product.dimensions?.depthCm || 0}D × ${product.dimensions?.heightCm || 0}H cm | Scale: ${(scale * 100).toFixed(0)}%`, 40, 110);
      
      const link = document.createElement('a');
      link.download = `tryspace-ar-${product.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (e) {
      console.log("Snapshot export helper:", e);
    }
  };

  const handleResetPlacement = () => {
    setScale(1.0);
    setRotationDeg(0);
    setModelHeightOffset(0);
    setPosX(0);
    setPosY(30);
  };

  return (
    <div 
      className="ar-room-modal-backdrop"
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* Background Viewport: Both Video and Image are kept in DOM to prevent ref losing */}
      <div className="ar-room-viewport">
        {/* Live Camera Video Element */}
        <video 
          ref={videoRef} 
          className="ar-camera-feed" 
          autoPlay 
          playsInline 
          muted 
          webkit-playsinline="true"
          x5-playsinline="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: activePreset.isCamera ? 2 : 0,
            opacity: activePreset.isCamera && cameraActive ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* Photorealistic Fallback Room Background Image */}
        <img 
          src={activePreset.url || ROOM_PRESETS[1].url} 
          alt="Room Environment" 
          className="ar-room-bg-image" 
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            opacity: !activePreset.isCamera || !cameraActive ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* Camera Starting Loader Overlay */}
        {cameraLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 15,
            gap: '0.75rem',
            color: 'white'
          }}>
            <Loader2 size={36} className="spin-slow" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Starting Camera Feed...</span>
          </div>
        )}

        {/* Floor Reticle Target Anchor */}
        <div 
          className="ar-floor-reticle"
          style={{
            transform: `translate(calc(-50% + ${posX}px), calc(-50% + ${posY + 140 + modelHeightOffset}px)) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.08s ease-out'
          }}
        >
          <div className="reticle-ring"></div>
          <div className="reticle-dot"></div>
          <span className="reticle-label">
            <Move size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Floor Anchor Point ({posX > 0 ? `+${posX.toFixed(0)}` : posX.toFixed(0)}px)
          </span>
        </div>

        {/* 3D Model Placement Layer */}
        <div 
          className="ar-model-overlay-container"
          style={{
            transform: `translate(${posX}px, ${posY + modelHeightOffset}px) scale(${scale})`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            zIndex: 20
          }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        >
          <model-viewer
            ref={modelViewerRef}
            src={modelSrc}
            poster={product.thumbnail}
            alt={product.name}
            camera-controls
            auto-rotate
            rotation-per-second="18deg"
            shadow-intensity="2.0"
            shadow-softness="0.75"
            exposure="1.15"
            environment-image="neutral"
            bounds="tight"
            loading="eager"
            reveal="auto"
            touch-action="pan-y"
            camera-orbit={`${rotationDeg}deg 75deg 105%`}
            style={{
              width: '85vw',
              height: '65vh',
              maxWidth: '850px',
              maxHeight: '650px',
              background: 'transparent',
              '--poster-color': 'transparent'
            }}
          >
            {/* Dimensions Hotspot Badge */}
            {product.dimensions && (
              <div 
                slot="hotspot-dimension"
                data-position="0 0.5 0"
                data-normal="0 1 0"
                className="dimension-badge"
                style={{
                  position: 'absolute',
                  top: '10%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 25,
                  whiteSpace: 'nowrap',
                  background: 'rgba(17, 24, 39, 0.9)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                📐 True Scale: {product.dimensions.widthCm}W × {product.dimensions.depthCm}D × {product.dimensions.heightCm}H cm
              </div>
            )}
          </model-viewer>
        </div>
      </div>

      {/* Top Action Header */}
      <div className="ar-room-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="badge-3d" style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', color: '#6ee7b7' }}>
            <Sparkles size={13} />
            <span>Room AR Active</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{product.name}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Flip Camera Button */}
          {activePreset.isCamera && (
            <button 
              className="viewer-ctrl-btn" 
              onClick={toggleCameraFacing}
              title="Flip Front / Rear Camera"
              id="btn-flip-camera"
            >
              <FlipHorizontal size={16} />
            </button>
          )}

          {/* Turn On/Off Live Camera Toggle */}
          {!cameraActive ? (
            <button 
              className="card-btn"
              onClick={() => startCamera(facingMode)}
              style={{ background: 'var(--accent-rose)', padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              title="Activate Phone Camera"
            >
              <Camera size={14} />
              <span>Enable Camera</span>
            </button>
          ) : (
            <button 
              className="card-btn"
              onClick={() => setActivePreset(ROOM_PRESETS[1])}
              style={{ background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              title="Use Room Preset"
            >
              <ImageIcon size={14} />
              <span>Room Preset</span>
            </button>
          )}

          <button 
            className="modal-close-btn" 
            onClick={onClose}
            id="ar-modal-close-btn"
            style={{ position: 'static' }}
            aria-label="Close Room AR"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Camera Alert / Error Toast */}
      {cameraError && (
        <div className="camera-alert-pill">
          <AlertCircle size={15} />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Snapshot Toast */}
      {snapshotTaken && (
        <div className="snapshot-toast">
          <Check size={16} color="#10b981" />
          <span>Room placement photo saved!</span>
        </div>
      )}

      {/* Bottom Floating Control Deck */}
      <div className="ar-room-bottom-panel glass-panel">
        {/* Environment Presets Bar */}
        <div className="room-preset-bar">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Background:
          </span>
          <div className="preset-scroll-row">
            {ROOM_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`pill-btn ${activePreset.id === preset.id ? 'active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => {
                  if (preset.isCamera) {
                    startCamera(facingMode);
                  } else {
                    setActivePreset(preset);
                  }
                }}
                id={`preset-${preset.id}`}
              >
                {preset.isCamera ? <Camera size={13} color="#10b981" /> : <ImageIcon size={13} />}
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color finish swatches if available */}
        {product.colors && product.colors.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Color Finish:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  className={`color-btn ${selectedColor?.name === c.name ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex, width: '22px', height: '22px' }}
                  onClick={() => handleColorChange(c)}
                  title={c.name}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: 600 }}>{selectedColor?.name}</span>
          </div>
        )}

        {/* Sliders and Quick Placement Controls */}
        <div className="placement-controls-row">
          {/* Scale Control */}
          <div className="ctrl-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="ctrl-label">
                <Maximize2 size={13} />
                <span>Scale: {(scale * 100).toFixed(0)}%</span>
              </span>
              <button 
                onClick={() => setScale(1.0)} 
                style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
              >
                1:1 True Scale
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className="viewer-ctrl-btn" 
                style={{ width: '28px', height: '28px' }}
                onClick={() => setScale((s) => Math.max(0.4, s - 0.1))}
                title="Decrease Scale"
              >
                <ZoomOut size={13} />
              </button>
              <input 
                type="range" 
                min="0.4" 
                max="2.0" 
                step="0.05"
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="ar-range-slider"
              />
              <button 
                className="viewer-ctrl-btn" 
                style={{ width: '28px', height: '28px' }}
                onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}
                title="Increase Scale"
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>

          {/* Rotation Dial */}
          <div className="ctrl-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="ctrl-label">
                <RotateCw size={13} />
                <span>Rotation: {rotationDeg}°</span>
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button 
                  onClick={() => setRotationDeg((r) => (r - 45 + 360) % 360)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#c7d2fe', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                >
                  -45°
                </button>
                <button 
                  onClick={() => setRotationDeg((r) => (r + 45) % 360)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#c7d2fe', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                >
                  +45°
                </button>
              </div>
            </div>
            <input 
              type="range" 
              min="0" 
              max="360" 
              step="10"
              value={rotationDeg} 
              onChange={(e) => setRotationDeg(parseInt(e.target.value))}
              className="ar-range-slider"
            />
          </div>

          {/* Elevation Height */}
          <div className="ctrl-group" style={{ minWidth: '120px' }}>
            <span className="ctrl-label">
              <Sliders size={13} />
              <span>Elevation: {modelHeightOffset}px</span>
            </span>
            <input 
              type="range" 
              min="-120" 
              max="120" 
              step="5"
              value={modelHeightOffset} 
              onChange={(e) => setModelHeightOffset(parseInt(e.target.value))}
              className="ar-range-slider"
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <button 
              className="back-btn" 
              onClick={handleResetPlacement}
              title="Reset Placement to Floor Center"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem' }}
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </button>

            <button 
              className="card-btn" 
              onClick={handleCaptureSnapshot}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', background: 'var(--accent-rose)' }}
              title="Capture and Save Photo"
              id="btn-capture-snapshot"
            >
              <Download size={13} />
              <span>Save Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
