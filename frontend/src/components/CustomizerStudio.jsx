import React, { useState, useRef, useEffect } from 'react';
import { 
  Sliders, 
  Maximize2, 
  RotateCw, 
  Sparkles, 
  Check, 
  MapPin, 
  Camera, 
  Smartphone, 
  Layers, 
  Grid, 
  Info,
  RefreshCw,
  Box,
  Compass
} from 'lucide-react';

const SIZE_PRESETS = [
  { id: 'compact', name: 'Compact / Studio', scale: 0.8, desc: 'Ideal for apartments, small nooks & tight corners' },
  { id: 'standard', name: 'Standard 1:1', scale: 1.0, desc: 'True manufacturer specification scale' },
  { id: 'spacious', name: 'Spacious / Large', scale: 1.25, desc: 'Statement piece for large living halls & open layouts' },
  { id: 'custom', name: 'Custom Slider', scale: null, desc: 'Manually adjust width, depth, and height' }
];

const ROOM_PLACEMENT_SPOTS = [
  { id: 'corner', name: 'Living Room Corner', posX: -0.6, posZ: -0.4, rotY: 45, desc: 'Angled snug against corner walls' },
  { id: 'center', name: 'Center on Rug', posX: 0, posZ: 0, rotY: 0, desc: 'Centerpiece focal placement' },
  { id: 'window', name: 'Beside Window', posX: 0.7, posZ: -0.2, rotY: -30, desc: 'Placed near natural daylight' },
  { id: 'wall', name: 'Against Back Wall', posX: 0, posZ: -0.8, rotY: 0, desc: 'Flush against accent wall' }
];

const FINISH_PRESETS = [
  { name: 'Emerald Velvet', hex: '#1b4d3e', materialType: 'Velvet' },
  { name: 'Midnight Navy', hex: '#1e3a8a', materialType: 'Matte Leather' },
  { name: 'Warm Terracotta', hex: '#c2410c', materialType: 'Woven Linen' },
  { name: 'Nordic Charcoal', hex: '#1e293b', materialType: 'Textured Bouclé' },
  { name: 'Brushed Gold', hex: '#d97706', materialType: 'Metallic' },
  { name: 'Pure Sand', hex: '#e2e8f0', materialType: 'Natural Canvas' }
];

export default function CustomizerStudio({ 
  product, 
  onLaunchAR, 
  onOpenQR, 
  onApplyCustomization 
}) {
  const modelViewerRef = useRef(null);

  // Size customization state
  const [selectedSizePreset, setSelectedSizePreset] = useState('standard');
  const [widthRatio, setWidthRatio] = useState(1.0);
  const [heightRatio, setHeightRatio] = useState(1.0);
  const [depthRatio, setDepthRatio] = useState(1.0);
  const [uniformScale, setUniformScale] = useState(1.0);

  // Placement state (Where to put)
  const [selectedSpot, setSelectedSpot] = useState(ROOM_PLACEMENT_SPOTS[1]);
  const [floorPosX, setFloorPosX] = useState(0);
  const [floorPosZ, setFloorPosZ] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(0);

  // Finish / Color
  const [selectedFinish, setSelectedFinish] = useState(product?.colors?.[0] || FINISH_PRESETS[0]);
  const [activeTab, setActiveTab] = useState('size'); // 'size' | 'placement' | 'finishes'

  const baseW = product.dimensions?.widthCm || 75;
  const baseD = product.dimensions?.depthCm || 80;
  const baseH = product.dimensions?.heightCm || 85;

  const currentW = (baseW * widthRatio * uniformScale).toFixed(1);
  const currentD = (baseD * depthRatio * uniformScale).toFixed(1);
  const currentH = (baseH * heightRatio * uniformScale).toFixed(1);
  const cubicMeters = ((currentW * currentD * currentH) / 1000000).toFixed(2);

  const modelSrc = product?.localModelUrl || product?.modelUrl;

  // Handle Preset Size Click
  const handleSizePresetClick = (preset) => {
    setSelectedSizePreset(preset.id);
    if (preset.scale !== null) {
      setUniformScale(preset.scale);
      setWidthRatio(1.0);
      setHeightRatio(1.0);
      setDepthRatio(1.0);
    }
  };

  // Handle Room Spot Click
  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    setFloorPosX(spot.posX);
    setFloorPosZ(spot.posZ);
    setRotationDeg(spot.rotY);
  };

  // Update model material color
  const handleFinishChange = (finish) => {
    setSelectedFinish(finish);
    if (modelViewerRef.current && modelViewerRef.current.model) {
      try {
        const material = modelViewerRef.current.model.materials[0];
        if (material && material.pbrMetallicRoughness) {
          const hex = finish.hex.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16) / 255;
          const g = parseInt(hex.substring(2, 4), 16) / 255;
          const b = parseInt(hex.substring(4, 6), 16) / 255;
          material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1.0]);
        }
      } catch (e) {
        console.log("Material update error:", e);
      }
    }
  };

  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      if (selectedFinish && viewer.model && viewer.model.materials && viewer.model.materials[0]) {
        try {
          const material = viewer.model.materials[0];
          if (material && material.pbrMetallicRoughness) {
            const hex = selectedFinish.hex.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;
            material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1.0]);
          }
        } catch (e) {
          // ignore
        }
      }
    };

    viewer.addEventListener('load', handleLoad);
    return () => {
      viewer.removeEventListener('load', handleLoad);
    };
  }, [selectedFinish, product]);

  const scaleString = `${widthRatio * uniformScale} ${heightRatio * uniformScale} ${depthRatio * uniformScale}`;

  return (
    <div className="customizer-studio-container">
      {/* Studio Header */}
      <div className="customizer-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="nav-logo-icon" style={{ width: '32px', height: '32px' }}>
            <Sliders size={17} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Customization & Staging Studio</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Customize dimensions, materials, and test floor placement in your room
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="studio-tabs">
          <button 
            className={`tab-btn ${activeTab === 'size' ? 'active' : ''}`}
            onClick={() => setActiveTab('size')}
          >
            <Maximize2 size={14} />
            <span>1. Custom Size</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'placement' ? 'active' : ''}`}
            onClick={() => setActiveTab('placement')}
          >
            <MapPin size={14} />
            <span>2. Where to Put</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'finishes' ? 'active' : ''}`}
            onClick={() => setActiveTab('finishes')}
          >
            <Sparkles size={14} />
            <span>3. Upholstery & Color</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: 3D Canvas on Left, Interactive Controls on Right */}
      <div className="customizer-grid">
        {/* 3D Preview Canvas */}
        <div className="viewer-card glass-panel studio-canvas-wrap">
          {/* Top Live Dimensions Pill */}
          <div className="viewer-overlay-top">
            <div className="badge-3d" style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(99, 102, 241, 0.5)' }}>
              <Box size={13} color="#818cf8" />
              <span>{currentW}W × {currentD}D × {currentH}H cm</span>
            </div>

            <div className="badge-cat" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
              Vol: {cubicMeters} m³
            </div>
          </div>

          {/* 3D Model with Dynamic Scale and Floor Offset */}
          <model-viewer
            ref={modelViewerRef}
            src={modelSrc}
            poster={product.thumbnail}
            alt={product.name}
            camera-controls
            auto-rotate
            rotation-per-second="18deg"
            scale={scaleString}
            shadow-intensity="1.6"
            shadow-softness="0.75"
            exposure="1.1"
            environment-image="neutral"
            bounds="tight"
            loading="eager"
            reveal="auto"
            touch-action="pan-y"
            camera-orbit={`${rotationDeg}deg 75deg 105%`}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Real Dimension Hotspots */}
            <div 
              slot="hotspot-dimension"
              data-position="0 0.5 0"
              data-normal="0 1 0"
              className="dimension-badge"
              style={{ position: 'absolute', top: '12%', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
            >
              📐 {currentW} × {currentD} × {currentH} cm
            </div>
          </model-viewer>

          {/* Floor Alignment Compass Overlay */}
          {activeTab === 'placement' && (
            <div className="placement-compass-badge">
              <Compass size={14} color="#38bdf8" />
              <span>Location: {selectedSpot.name} (Rot: {rotationDeg}°)</span>
            </div>
          )}

          {/* Quick Action Bar under Canvas */}
          <div className="viewer-overlay-bottom">
            <button 
              className="phone-qr-btn"
              onClick={onOpenQR}
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
            >
              <Smartphone size={15} color="#38bdf8" />
              <span>Try on Phone QR</span>
            </button>

            <button 
              className="launch-ar-btn"
              onClick={onLaunchAR}
              style={{ fontSize: '0.88rem', padding: '0.55rem 1.1rem' }}
            >
              <Camera size={16} />
              <span>Place in My Room (AR)</span>
            </button>
          </div>
        </div>

        {/* Right Side Control Panels */}
        <div className="product-details-panel glass-panel">
          {/* TAB 1: SIZE CUSTOMIZATION */}
          {activeTab === 'size' && (
            <div className="customizer-panel-content">
              <div className="detail-header">
                <span className="detail-category">Dimension Customizer</span>
                <h3 style={{ fontSize: '1.35rem' }}>Adjust Furniture Size</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Scale the 3D model to fit your room constraints before placing.
                </p>
              </div>

              {/* Size Presets */}
              <div className="size-preset-grid">
                {SIZE_PRESETS.map((preset) => (
                  <div 
                    key={preset.id}
                    className={`size-preset-card ${selectedSizePreset === preset.id ? 'active' : ''}`}
                    onClick={() => handleSizePresetClick(preset)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{preset.name}</strong>
                      {selectedSizePreset === preset.id && <Check size={14} color="#10b981" />}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {preset.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Sliders for Width, Depth, Height */}
              <div className="spec-box" style={{ marginTop: '1rem' }}>
                <span className="spec-title">
                  <Maximize2 size={13} />
                  <span>Dimensional Sliders</span>
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span>Width: <strong>{currentW} cm</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>({(widthRatio * uniformScale * 100).toFixed(0)}%)</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.6" 
                      max="1.5" 
                      step="0.05"
                      value={widthRatio} 
                      onChange={(e) => {
                        setSelectedSizePreset('custom');
                        setWidthRatio(parseFloat(e.target.value));
                      }}
                      className="ar-range-slider"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span>Depth: <strong>{currentD} cm</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>({(depthRatio * uniformScale * 100).toFixed(0)}%)</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.6" 
                      max="1.5" 
                      step="0.05"
                      value={depthRatio} 
                      onChange={(e) => {
                        setSelectedSizePreset('custom');
                        setDepthRatio(parseFloat(e.target.value));
                      }}
                      className="ar-range-slider"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span>Height: <strong>{currentH} cm</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>({(heightRatio * uniformScale * 100).toFixed(0)}%)</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.6" 
                      max="1.5" 
                      step="0.05"
                      value={heightRatio} 
                      onChange={(e) => {
                        setSelectedSizePreset('custom');
                        setHeightRatio(parseFloat(e.target.value));
                      }}
                      className="ar-range-slider"
                    />
                  </div>
                </div>

                <button 
                  className="back-btn"
                  onClick={() => {
                    setSelectedSizePreset('standard');
                    setWidthRatio(1.0);
                    setHeightRatio(1.0);
                    setDepthRatio(1.0);
                    setUniformScale(1.0);
                  }}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', fontSize: '0.78rem' }}
                >
                  <RefreshCw size={13} />
                  <span>Reset to Original Factory Scale</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: WHERE TO PUT (ROOM PLACEMENT & STAGING) */}
          {activeTab === 'placement' && (
            <div className="customizer-panel-content">
              <div className="detail-header">
                <span className="detail-category">Room Staging & Layout</span>
                <h3 style={{ fontSize: '1.35rem' }}>Where to Put in Room</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Test positioning spots, orientation, and clearance in room spaces.
                </p>
              </div>

              {/* Room Spots Selection */}
              <div className="size-preset-grid">
                {ROOM_PLACEMENT_SPOTS.map((spot) => (
                  <div 
                    key={spot.id}
                    className={`size-preset-card ${selectedSpot.id === spot.id ? 'active' : ''}`}
                    onClick={() => handleSpotClick(spot)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} color="#38bdf8" />
                        <strong>{spot.name}</strong>
                      </div>
                      {selectedSpot.id === spot.id && <Check size={14} color="#10b981" />}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {spot.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Rotation & Position Sliders */}
              <div className="spec-box" style={{ marginTop: '1rem' }}>
                <span className="spec-title">
                  <RotateCw size={13} />
                  <span>Orientation & Floor Angle</span>
                </span>

                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                    <span>Rotation Angle: <strong>{rotationDeg}°</strong></span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    step="15"
                    value={rotationDeg} 
                    onChange={(e) => setRotationDeg(parseInt(e.target.value))}
                    className="ar-range-slider"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>Front (0°)</span>
                    <span>Side (90°)</span>
                    <span>Back (180°)</span>
                    <span>Side (270°)</span>
                  </div>
                </div>
              </div>

              {/* Clearance Tips */}
              <div className="ar-tip-banner" style={{ marginTop: '1rem' }}>
                <Info size={18} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.8rem' }}>
                  <strong>Placement Recommendation:</strong>
                  <p style={{ marginTop: '0.2rem', opacity: 0.9 }}>
                    Keep at least 45 cm walkway clearance around seating for optimal flow.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UPHOLSTERY & FINISHES */}
          {activeTab === 'finishes' && (
            <div className="customizer-panel-content">
              <div className="detail-header">
                <span className="detail-category">Material & Color Customizer</span>
                <h3 style={{ fontSize: '1.35rem' }}>Choose Finish</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Preview premium fabrics and colors mapped directly onto the 3D model.
                </p>
              </div>

              <div className="size-preset-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {FINISH_PRESETS.map((finish) => (
                  <div 
                    key={finish.name}
                    className={`size-preset-card ${selectedFinish?.name === finish.name ? 'active' : ''}`}
                    onClick={() => handleFinishChange(finish)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          backgroundColor: finish.hex, 
                          border: '1px solid rgba(255,255,255,0.3)',
                          display: 'inline-block'
                        }} 
                      />
                      <strong>{finish.name}</strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                      {finish.materialType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button 
              className="launch-ar-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem 1.5rem', fontSize: '0.98rem' }}
              onClick={onLaunchAR}
              id="btn-apply-ar-studio"
            >
              <Camera size={18} />
              <span>View This Custom Design in AR Room</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
