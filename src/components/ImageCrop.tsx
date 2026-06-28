import { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Check } from 'lucide-react';
import { Modal } from './ui/Modal';

interface ImageCropProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  onCrop: (blob: Blob) => void;
  aspect?: number;
  label?: string;
}

export function ImageCrop({ isOpen, onClose, file, onCrop, aspect = 1, label = 'Crop Image' }: ImageCropProps) {
  const [imgSrc, setImgSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [, setImgNatural] = useState({ w: 0, h: 0 });
  const previewRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!imgSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = imgSrc;
  }, [imgSrc]);

  const drawPreview = useCallback(() => {
    const canvas = previewRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW: number, drawH: number;
    if (imgAspect > aspect) {
      drawH = H * zoom;
      drawW = drawH * imgAspect;
    } else {
      drawW = W * zoom;
      drawH = drawW / imgAspect;
    }

    const cx = W / 2 + offsetX;
    const cy = H / 2 + offsetY;

    ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
  }, [imgSrc, zoom, offsetX, offsetY, aspect]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  }, [offsetX, offsetY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleCrop = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const outW = 800;
    const outH = Math.round(outW / aspect);

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW: number, drawH: number;
    if (imgAspect > aspect) {
      drawH = outH * zoom;
      drawW = drawH * imgAspect;
    } else {
      drawW = outW * zoom;
      drawH = drawW / imgAspect;
    }

    const cx = outW / 2 + offsetX;
    const cy = outH / 2 + offsetY;

    ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);

    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  }, [zoom, offsetX, offsetY, aspect, onCrop, onClose]);

  if (!file) return null;

  const canvasH = 300;
  const canvasW = Math.round(canvasH * aspect);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={label} size="md">
      <div className="p-4">
        <div
          className="relative mx-auto overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={previewRef}
            width={canvasW}
            height={canvasH}
            className="block mx-auto"
            style={{ width: canvasW, height: canvasH }}
          />
          <div className="absolute inset-0 border-2 border-dashed border-white/40 pointer-events-none" />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <ZoomOut className="w-4 h-4 text-neutral-500 flex-shrink-0" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary-600"
          />
          <ZoomIn className="w-4 h-4 text-neutral-500 flex-shrink-0" />
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 px-4 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleCrop} className="flex-1 py-2.5 px-4 text-sm font-medium rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Apply Crop
          </button>
        </div>
      </div>
    </Modal>
  );
}
