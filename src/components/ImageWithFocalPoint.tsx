import { useState, useEffect } from 'react';
import { Upload, Crosshair } from 'lucide-react';
import { FocalPointPicker } from './FocalPointPicker';

interface ImageWithFocalPointProps {
  currentUrl: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  ratio?: string;
  previewAspect?: string;
  previewMaxWidth?: string;
}

export function ImageWithFocalPoint({
  currentUrl,
  file,
  onFileChange,
  onRemove,
  position,
  onPositionChange,
  zoom,
  onZoomChange,
  ratio,
  previewAspect = '16/9',
  previewMaxWidth,
}: ImageWithFocalPointProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const displayUrl = preview || currentUrl || null;
  const style = { aspectRatio: previewAspect, maxWidth: previewMaxWidth };

  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          {displayUrl ? (
            <FocalPointPicker
              imageUrl={displayUrl}
              position={position}
              onChange={onPositionChange}
              zoom={zoom}
              onZoomChange={onZoomChange}
              className="w-full rounded-xl overflow-hidden"
              style={style}
            />
          ) : (
            <label className="cursor-pointer block">
              <div
                className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl hover:border-primary-400 transition-colors text-center flex items-center justify-center"
                style={style}
              >
                <div>
                  <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-500">Click to upload image</p>
                  <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WebP</p>
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
            </label>
          )}
        </div>
        {displayUrl && (
          <div className="flex flex-col gap-2 flex-shrink-0">
            <label className="cursor-pointer text-xs text-primary-600 dark:text-primary-400 hover:underline text-center">
              Change
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
            </label>
            <button type="button" onClick={onRemove} className="text-xs text-red-500 hover:text-red-700">
              Remove
            </button>
          </div>
        )}
      </div>
      {ratio && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Recommended ratio: {ratio}</p>}
      {displayUrl && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 flex items-center gap-1">
          <Crosshair className="w-3 h-3" /> Drag on image to choose which part appears on website
        </p>
      )}
    </div>
  );
}
