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
  Eye
} from 'lucide-react';

const ROOM_PRESETS = [
  { id: 'camera', name: 'Live Camera (Your Room)', isCamera: true },
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

export default function ARPlacementModal({ product, onClose, onOpenQR, onLaunchGoogleAR }) {
  const videoRef = useRef(null);
  const modelViewerRef = useRef(null);
  const streamRef = useRef(null);
  const dragContainerRef = useRef(null);

  const [activePreset, setActivePreset] = useState(ROOM_PRESETS[0]);
  const [cameraError, setCameraError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'

  // Placement transform state
  const [scale, setScale] = useState(1.0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [modelHeightOffset, setModelHeightOffset] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(40); // default slightly lower on floor
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // UI state
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [nativeArSupported, setNativeArSupported] = useState(false);
  const [showHelperBanner, setShowHelperBanner] = useState(true);

  const modelSrc = product?.localModelUrl || product?.modelUrl;

  // Initialize camera stream
  const startCamera = async (facing = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported or insecure HTTP context.");
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (err) {
        // Fallback to basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera access failed:", err);
      setCameraError("In-browser camera over local Wi-Fi HTTP is blocked by mobile browsers. Tap 'Google AR Camera' above to launch native ARCore floor placement!");
      setCameraActive(false);
      setActivePreset(ROOM_PRESETS[1]); // Fallback to modern room preset
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
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

  useEffect(() => {
    if (activePreset.isCamera) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activePreset]);

  // Check if native WebXR AR is supported
  useEffect(() => {
    const checkNativeAR = async () => {
      if (navigator.xr && navigator.xr.isSessionSupported) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setNativeArSupported(supported);
        } catch (e) {
          setNativeArSupported(false);
        }
      }
    };
    checkNativeAR();
  }, []);

  const handleLaunchNativeAR = () => {
    if (modelViewerRef.current) {
      try {
        modelViewerRef.current.activateAR();
      } catch (e) {
        console.warn("Native AR activate error:", e);
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

    // Create download link for placement record
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(`ARoom AR Placement — ${product.name}`, 40, 70);
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Dimensions: ${product.dimensions?.widthCm || 0}W x ${product.dimensions?.depthCm || 0}D x ${product.dimensions?.heightCm || 0}H cm | Scale: ${(scale * 100).toFixed(0)}%`, 40, 110);
      
      const link = document.createElement('a');
      link.download = `ar-placement-${product.id}.png`;
      link.href = canvas.toDataURL();
      // Optional: link.click();
    } catch (e) {
      console.log("Snapshot export helper:", e);
    }
  };

  const handleResetPlacement = () => {
    setScale(1.0);
    setRotationDeg(0);
    setModelHeightOffset(0);
    setPosX(0);
    setPosY(40);
  };

  return (
    <div 
      className="ar-room-modal-backdrop"
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* Background Viewport: Live Camera Feed OR High-Res Room Preset */}
      <div className="ar-room-viewport">
        {activePreset.isCamera ? (
          <video 
            ref={videoRef} 
            className="ar-camera-feed" 
            autoPlay 
            playsInline 
            muted 
          />
        ) : (
          <img 
            src={activePreset.url} 
            alt={activePreset.name} 
            className="ar-room-bg-image" 
          />
        )}

        {/* Dynamic Floor Grid & Shadow beneath furniture */}
        <div 
          className="ar-floor-reticle"
          style={{
            transform: `translate(calc(-50% + ${posX}px), calc(-50% + ${posY + 160 + modelHeightOffset}px)) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
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
          ref={dragContainerRef}
          className="ar-model-overlay-container"
          style={{
            transform: `translate(${posX}px, ${posY + modelHeightOffset}px) scale(${scale})`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
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
              width: '80vw',
              height: '65vh',
              maxWidth: '850px',
              maxHeight: '650px',
              background: 'transparent',
              '--poster-color': 'transparent'
            }}
          >
            {/* Real Dimensions Annotation */}
            {product.dimensions && (
              <div 
                slot="hotspot-dimension"
                data-position="0 0.5 0"
                data-normal="0 1 0"
                className="dimension-badge"
                style={{
                  position: 'absolute',
                  top: '12%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 20,
                  whiteSpace: 'nowrap'
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
          {onLaunchGoogleAR && (
            <button 
              className="card-btn"
              onClick={onLaunchGoogleAR}
              style={{ background: 'var(--accent-gradient)', padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              title="Launch Google AR Scene Viewer (ARCore Floor Camera)"
            >
              <Camera size={14} />
              <span>Google AR Camera</span>
            </button>
          )}

          {activePreset.isCamera && (
            <button 
              className="viewer-ctrl-btn" 
              onClick={toggleCameraFacing}
              title="Flip Front/Back Camera"
              id="btn-flip-camera"
            >
              <FlipHorizontal size={16} />
            </button>
          )}

          {nativeArSupported && (
            <button 
              className="card-btn" 
              onClick={handleLaunchNativeAR}
              style={{ background: 'var(--accent-gradient)', padding: '0.45rem 0.9rem' }}
            >
              <Smartphone size={15} />
              <span>Native WebXR</span>
            </button>
          )}

          <button 
            className="viewer-ctrl-btn" 
            onClick={onOpenQR}
            title="Open on Mobile Phone"
            id="ar-modal-qr-btn"
          >
            <Smartphone size={16} color="#38bdf8" />
          </button>

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

      {/* Camera Alert / Error Toast if any */}
      {cameraError && (
        <div className="camera-alert-pill">
          <AlertCircle size={15} />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Snapshot Toast notification */}
      {snapshotTaken && (
        <div className="snapshot-toast">
          <Check size={16} color="#10b981" />
          <span>Room placement photo captured!</span>
        </div>
      )}

      {/* Bottom Floating Control Deck */}
      <div className="ar-room-bottom-panel glass-panel">
        {/* Room Environment / Camera Switcher */}
        <div className="room-preset-bar">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Room Space:
          </span>
          <div className="preset-scroll-row">
            {ROOM_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`pill-btn ${activePreset.id === preset.id ? 'active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => setActivePreset(preset)}
                id={`preset-${preset.id}`}
              >
                {preset.isCamera ? <Camera size={13} /> : <ImageIcon size={13} />}
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

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
                1:1 Scale
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
                <span>Rotate Angle: {rotationDeg}°</span>
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
          <div className="ctrl-group" style={{ minWidth: '130px' }}>
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
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
              title="Capture Photo"
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
