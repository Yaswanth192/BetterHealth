import { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface FocalPointPickerProps {
  imageUrl: string;
  position: { x: number; y: number };
  onChange: (pos: { x: number; y: number }) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function FocalPointPicker({ imageUrl, position, onChange, zoom: zoomProp, onZoomChange, className = '', style }: FocalPointPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [internalZoom, setInternalZoom] = useState(1);
  const zoom = zoomProp ?? internalZoom;

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)));
    onChange({ x, y });
  }, [onChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setActive(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX, e.clientY);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!active) return;
    updatePosition(e.clientX, e.clientY);
  }, [active, updatePosition]);

  const handlePointerUp = useCallback(() => {
    setActive(false);
  }, []);

  const handleZoomChange = useCallback((val: number) => {
    if (onZoomChange) {
      onZoomChange(val);
    } else {
      setInternalZoom(val);
    }
  }, [onZoomChange]);

  return (
    <div>
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-xl cursor-crosshair select-none ${className}`}
        style={style}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            objectPosition: `${position.x}% ${position.y}%`,
            objectFit: 'cover',
            transform: `scale(${zoom})`,
            transformOrigin: `${position.x}% ${position.y}%`,
          }}
          draggable={false}
        />
        <div className="absolute inset-0 border-2 border-dashed border-white/20 pointer-events-none" />
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <ZoomOut className="w-3 h-3 text-neutral-400" />
        <input
          type="range"
          min="1"
          max="2"
          step="0.05"
          value={zoom}
          onChange={(e) => handleZoomChange(Number(e.target.value))}
          className="flex-1 h-1 accent-primary-500"
        />
        <ZoomIn className="w-3 h-3 text-neutral-400" />
      </div>
    </div>
  );
}
