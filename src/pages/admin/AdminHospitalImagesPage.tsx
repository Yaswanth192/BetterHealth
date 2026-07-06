import { useEffect, useState } from 'react';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArchitectureImage } from '../../types';
import { uploadPublicFile, deletePublicFile } from '../../lib/storage';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ImageCrop } from '../../components/ImageCrop';
import { ImageWithFocalPoint } from '../../components/ImageWithFocalPoint';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

interface SectionSettings {
  show: boolean;
  useDummies: boolean;
}

interface ImageForm {
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: ImageForm = { title: '', description: '', image_url: '', sort_order: 0, is_active: true };

export function AdminHospitalImagesPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [images, setImages] = useState<ArchitectureImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SectionSettings>({ show: true, useDummies: true });
  const [savingSettings, setSavingSettings] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ArchitectureImage | null>(null);
  const [form, setForm] = useState<ImageForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [inlineForm, setInlineForm] = useState<ImageForm>(EMPTY_FORM);
  const [inlineImageFile, setInlineImageFile] = useState<File | null>(null);
  const [inlineSaving, setInlineSaving] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<'modal' | 'inline'>('modal');
  const [modalPosition, setModalPosition] = useState({ x: 50, y: 50 });
  const [modalZoom, setModalZoom] = useState(1);
  const [inlinePosition, setInlinePosition] = useState({ x: 50, y: 50 });
  const [inlineZoom, setInlineZoom] = useState(1);

  useEffect(() => {
    if (clinicId) {
      fetchSettings();
      fetchImages();
    }
  }, [clinicId]);

  async function fetchSettings() {
    const { data } = await supabase.from('clinics').select('section_settings').eq('id', clinicId!).maybeSingle();
    if (data?.section_settings?.architecture) {
      setSettings(data.section_settings.architecture);
    }
  }

  async function getFullSettings() {
    const { data } = await supabase.from('clinics').select('section_settings').eq('id', clinicId!).maybeSingle();
    return data?.section_settings ?? {};
  }

  async function updateSettings(patch: Partial<SectionSettings>) {
    const next = { ...settings, ...patch };
    setSavingSettings(true);
    const full = await getFullSettings();
    const { error } = await supabase.from('clinics').update({ section_settings: { ...full, architecture: next } }).eq('id', clinicId!);
    if (error) {
      addToast('error', 'Failed to update settings');
    } else {
      setSettings(next);
      addToast('success', 'Settings updated');
    }
    setSavingSettings(false);
  }

  async function fetchImages() {
    setLoading(true);
    const { data } = await supabase.from('architecture_images').select('*').eq('clinic_id', clinicId!).order('sort_order');
    setImages(data ?? []);
    setLoading(false);
  }

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setModalPosition({ x: 50, y: 50 }); setModalZoom(1); setModalOpen(true); }
  function openEdit(img: ArchitectureImage) {
    setEditing(img);
    setForm({ title: img.title, description: img.description, image_url: img.image_url, sort_order: img.sort_order, is_active: img.is_active });
    setModalPosition(img.image_position ?? { x: 50, y: 50 });
    setModalZoom(img.image_zoom ?? 1);
    setImageFile(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const imageId = editing?.id ?? crypto.randomUUID();
      let imageUrl = form.image_url;
      if (imageFile) {
        if (form.image_url) await deletePublicFile(form.image_url);
        imageUrl = (await uploadPublicFile(imageFile, {
          path: `clinics/${clinicId}/architecture/${imageId}`,
          fileName: 'image',
        })) + `?v=${Date.now()}`;
      }

      if (!imageUrl) {
        addToast('error', 'Please upload an image');
        setSaving(false);
        return;
      }

      const payload = {
        clinic_id: clinicId!,
        title: form.title,
        description: form.description,
        image_url: imageUrl,
        image_position: modalPosition,
        image_zoom: modalZoom,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };
      const { error } = editing
        ? await supabase.from('architecture_images').update(payload).eq('id', editing.id)
        : await supabase.from('architecture_images').insert({ ...payload, id: imageId });
      if (error) throw error;
      addToast('success', editing ? 'Image updated' : 'Image added');
      setModalOpen(false);
      fetchImages();
    } catch {
      addToast('error', 'Failed to save image');
    }
    setSaving(false);
  }

  async function handleInlineSave() {
    if (!inlineImageFile) {
      addToast('error', 'Please upload an image');
      return;
    }
    setInlineSaving(true);
    try {
      const imageId = crypto.randomUUID();
      const imageUrl = (await uploadPublicFile(inlineImageFile, {
        path: `clinics/${clinicId}/architecture/${imageId}`,
        fileName: 'image',
      })) + `?v=${Date.now()}`;
      const { error } = await supabase.from('architecture_images').insert({
        id: imageId,
        clinic_id: clinicId!,
        title: inlineForm.title || 'Hospital Image',
        description: inlineForm.description,
        image_url: imageUrl,
        image_position: inlinePosition,
        image_zoom: inlineZoom,
        sort_order: 0,
        is_active: true,
      });
      if (error) throw error;
      addToast('success', 'Image added — switched to real data');
      setInlineForm(EMPTY_FORM);
      setInlineImageFile(null);
      await updateSettings({ useDummies: false });
      fetchImages();
    } catch {
      addToast('error', 'Failed to add image');
    }
    setInlineSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this image?')) return;
    const img = images.find(i => i.id === id);
    const { error } = await supabase.from('architecture_images').delete().eq('id', id);
    if (error) {
      addToast('error', 'Failed to delete');
    } else {
      if (img?.image_url) await deletePublicFile(img.image_url);
      setImages(prev => prev.filter(i => i.id !== id));
      addToast('success', 'Image deleted');
    }
  }

  async function moveImage(id: string, direction: 'up' | 'down') {
    const idx = images.findIndex(i => i.id === id);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;

    const newImages = [...images];
    [newImages[idx], newImages[swapIdx]] = [newImages[swapIdx], newImages[idx]];
    const updated = newImages.map((img, i) => ({ ...img, sort_order: i }));
    setImages(updated);

    await Promise.all(
      updated.map(img =>
        supabase.from('architecture_images').update({ sort_order: img.sort_order }).eq('id', img.id)
      )
    );
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Hospital Images</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{images.length} images</p>
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Image</button>
        </div>

        {/* Toggle Controls */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Show Section</label>
              <button
                onClick={() => updateSettings({ show: !settings.show })}
                disabled={savingSettings}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.show ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.show ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Use Dummy Data</label>
              <button
                onClick={() => updateSettings({ useDummies: !settings.useDummies })}
                disabled={savingSettings}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.useDummies ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.useDummies ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {!settings.useDummies && images.length === 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                Upload your first image below
              </span>
            )}
          </div>
        </div>

        {/* Inline Quick-Add */}
        {settings.show && !settings.useDummies && images.length === 0 && (
          <div className="card p-6 border-2 border-dashed border-primary-300 dark:border-primary-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Upload Your First Image</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Title</label>
                <input type="text" value={inlineForm.title} onChange={(e) => setInlineForm({ ...inlineForm, title: e.target.value })} className="input-field" placeholder="e.g. Modern Reception" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Description</label>
                <input type="text" value={inlineForm.description} onChange={(e) => setInlineForm({ ...inlineForm, description: e.target.value })} className="input-field" placeholder="Short description" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Image *</label>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCropFile(f); setCropTarget('inline'); setCropOpen(true); } }} className="input-field" />
                {(inlineImageFile || inlineForm.image_url) && (
                  <div className="mt-2">
                    <ImageWithFocalPoint
                      currentUrl={inlineForm.image_url}
                      file={inlineImageFile}
                      onFileChange={setInlineImageFile}
                      onRemove={() => setInlineImageFile(null)}
                      position={inlinePosition}
                      onPositionChange={setInlinePosition}
                      zoom={inlineZoom}
                      onZoomChange={setInlineZoom}
                      ratio="16:9"
                      previewAspect="16/9"
                      previewMaxWidth="400px"
                    />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleInlineSave}
              disabled={inlineSaving || !inlineImageFile}
              className="btn-primary mt-4 disabled:opacity-50"
            >
              {inlineSaving ? 'Uploading...' : 'Upload Image & Switch to Real Data'}
            </button>
          </div>
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <div key={img.id} className="card overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img src={img.image_url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{
                    objectPosition: img.image_position ? `${img.image_position.x}% ${img.image_position.y}%` : undefined,
                    transform: img.image_zoom && img.image_zoom > 1 ? `scale(${img.image_zoom})` : undefined,
                    transformOrigin: img.image_position ? `${img.image_position.x}% ${img.image_position.y}%` : undefined,
                  }} />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveImage(img.id, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveImage(img.id, 'down')}
                      disabled={idx === images.length - 1}
                      className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">{img.title}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">{img.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(img)} className="flex-1 py-1.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-200 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(img.id)} className="py-1.5 px-3 text-xs bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-lg transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Image' : 'Add Image'}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Modern Reception" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Upload Image</label>
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCropFile(f); setCropTarget('modal'); setCropOpen(true); } }} className="input-field" />
            {(imageFile || form.image_url) && (
              <div className="mt-2">
                <ImageWithFocalPoint
                  currentUrl={form.image_url}
                  file={imageFile}
                  onFileChange={setImageFile}
                  onRemove={() => setImageFile(null)}
                  position={modalPosition}
                  onPositionChange={setModalPosition}
                  zoom={modalZoom}
                  onZoomChange={setModalZoom}
                  ratio="16:9"
                  previewAspect="16/9"
                  previewMaxWidth="400px"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="img-active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-primary-600" />
              <label htmlFor="img-active" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Active</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update' : 'Add Image'}
            </button>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
      <ImageCrop
        isOpen={cropOpen}
        onClose={() => { setCropOpen(false); setCropFile(null); }}
        file={cropFile}
        onCrop={(blob) => {
          const cropped = new File([blob], 'image.jpg', { type: 'image/jpeg' });
          if (cropTarget === 'inline') setInlineImageFile(cropped);
          else setImageFile(cropped);
        }}
        aspect={16 / 9}
        label="Crop Hospital Image"
      />
    </>
  );
}
