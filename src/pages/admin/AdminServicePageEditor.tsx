import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, Type, AlignLeft, ListChecks, ImageIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadPublicFile, deletePublicFile } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { ClinicService, ServiceContentSection, ContentSectionType } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ImageCrop } from '../../components/ImageCrop';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

const SECTION_TYPES: { type: ContentSectionType; label: string; icon: React.ElementType }[] = [
  { type: 'heading', label: 'Heading', icon: Type },
  { type: 'paragraph', label: 'Paragraph', icon: AlignLeft },
  { type: 'bullets', label: 'Bullet List', icon: ListChecks },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'callout', label: 'Callout Box', icon: AlertCircle },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminServicePageEditor() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [service, setService] = useState<ClinicService | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [sections, setSections] = useState<ServiceContentSection[]>([]);

  const [cropOpen, setCropOpen] = useState(false);
  const [cropSectionId, setCropSectionId] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  useEffect(() => {
    if (serviceId && clinicId) fetchService();
  }, [serviceId, clinicId]);

  async function fetchService() {
    setLoading(true);
    const { data } = await supabase
      .from('clinic_services')
      .select('*')
      .eq('id', serviceId!)
      .eq('clinic_id', clinicId!)
      .single();

    if (data) {
      setService(data);
      setSlug(data.slug || generateSlug(data.title));
      setMetaTitle(data.meta_title || data.title);
      setMetaDescription(data.meta_description || data.description || '');
      setSections(data.content_sections || []);
    }
    setLoading(false);
  }

  function addSection(type: ContentSectionType) {
    const newSection: ServiceContentSection = {
      id: crypto.randomUUID(),
      type,
      content: '',
      ...(type === 'heading' ? { level: 2 } : {}),
      ...(type === 'bullets' ? { items: [''] } : {}),
      ...(type === 'image' ? { alt: '' } : {}),
    };
    setSections([...sections, newSection]);
  }

  function updateSection(id: string, updates: Partial<ServiceContentSection>) {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  function removeSection(id: string) {
    setSections(sections.filter(s => s.id !== id));
  }

  function moveSection(id: string, direction: 'up' | 'down') {
    const idx = sections.findIndex(s => s.id === id);
    if (idx === -1) return;
    const newSections = [...sections];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newSections.length) return;
    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];
    setSections(newSections);
  }

  function handleImagePick(sectionId: string) {
    setCropSectionId(sectionId);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setCropFile(file);
        setCropOpen(true);
      }
    };
    input.click();
  }

  async function handleImageCrop(blob: Blob) {
    if (!cropSectionId || !clinicId || !serviceId) return;
    const file = new File([blob], 'section.jpg', { type: 'image/jpeg' });
    const section = sections.find(s => s.id === cropSectionId);
    if (section?.content && section.content.startsWith('http')) {
      await deletePublicFile(section.content);
    }
    const url = (await uploadPublicFile(file, {
      bucket: 'SellHealthStorage',
      path: `clinics/${clinicId}/services/${serviceId}/sections/${cropSectionId}`,
      fileName: 'image',
    })) + `?v=${Date.now()}`;
    updateSection(cropSectionId, { content: url });
    setCropOpen(false);
    setCropSectionId(null);
    setCropFile(null);
  }

  function addBulletItem(sectionId: string) {
    const section = sections.find(s => s.id === sectionId);
    if (section && section.items) {
      updateSection(sectionId, { items: [...section.items, ''] });
    }
  }

  function updateBulletItem(sectionId: string, itemIndex: number, value: string) {
    const section = sections.find(s => s.id === sectionId);
    if (section && section.items) {
      const newItems = [...section.items];
      newItems[itemIndex] = value;
      updateSection(sectionId, { items: newItems });
    }
  }

  function removeBulletItem(sectionId: string, itemIndex: number) {
    const section = sections.find(s => s.id === sectionId);
    if (section && section.items) {
      updateSection(sectionId, { items: section.items.filter((_, i) => i !== itemIndex) });
    }
  }

  async function handleSave() {
    if (!slug.trim()) {
      addToast('error', 'Slug is required');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clinic_services')
        .update({
          slug: slug.trim(),
          meta_title: metaTitle.trim(),
          meta_description: metaDescription.trim(),
          content_sections: sections,
        })
        .eq('id', serviceId!);

      if (error) throw error;
      addToast('success', 'Service page saved');
      navigate('/admin/services');
    } catch {
      addToast('error', 'Failed to save');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-neutral-400">Service not found</p>
        <button onClick={() => navigate('/admin/services')} className="btn-primary mt-4">
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/services')}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Manage Page: {service.title}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Build the detailed "Learn More" page for this service
            </p>
          </div>
          <a
            href={`/${clinicId ? '' : ''}services/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            Preview →
          </a>
        </div>

        {/* SEO & Slug */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Page Settings</h2>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">URL Slug *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">/services/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="input-field flex-1"
                placeholder="service-url-slug"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Meta Title</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="input-field"
              placeholder="Page title for SEO"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Meta Description</label>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="input-field resize-none"
              placeholder="Brief description for search engines"
            />
          </div>
        </div>

        {/* Content Sections */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Page Content</h2>

          {sections.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl mb-4">
              <AlignLeft className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 dark:text-neutral-500 text-sm mb-4">No content sections yet</p>
              <p className="text-neutral-400 dark:text-neutral-500 text-xs">Click the buttons below to add content</p>
            </div>
          )}

          <div className="space-y-3 mb-4">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 bg-neutral-50 dark:bg-neutral-800/50"
              >
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-3">
                  <GripVertical className="w-4 h-4 text-neutral-300 dark:text-neutral-600 cursor-grab" />
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                    {SECTION_TYPES.find(t => t.type === section.type)?.label}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={idx === sections.length - 1}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section Content by Type */}
                {section.type === 'heading' && (
                  <div className="flex gap-3">
                    <select
                      value={section.level || 2}
                      onChange={(e) => updateSection(section.id, { level: parseInt(e.target.value) })}
                      className="input-field w-24"
                    >
                      <option value={2}>H2</option>
                      <option value={3}>H3</option>
                      <option value={4}>H4</option>
                    </select>
                    <input
                      type="text"
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      className="input-field flex-1"
                      placeholder="Heading text"
                    />
                  </div>
                )}

                {section.type === 'paragraph' && (
                  <textarea
                    rows={3}
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    className="input-field resize-none w-full"
                    placeholder="Paragraph text"
                  />
                )}

                {section.type === 'bullets' && (
                  <div className="space-y-2">
                    {section.items?.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-2">
                        <span className="text-primary-500">✓</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateBulletItem(section.id, itemIdx, e.target.value)}
                          className="input-field flex-1"
                          placeholder="Bullet point"
                        />
                        <button
                          onClick={() => removeBulletItem(section.id, itemIdx)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addBulletItem(section.id)}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                      + Add Item
                    </button>
                  </div>
                )}

                {section.type === 'image' && (
                  <div className="space-y-3">
                    {section.content && (
                      <img
                        src={section.content}
                        alt={section.alt || ''}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleImagePick(section.id)}
                        className="btn-secondary text-sm"
                      >
                        {section.content ? 'Change Image' : 'Upload Image'}
                      </button>
                      {section.content && (
                        <button
                          onClick={() => updateSection(section.id, { content: '' })}
                          className="text-sm text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={section.alt || ''}
                      onChange={(e) => updateSection(section.id, { alt: e.target.value })}
                      className="input-field w-full"
                      placeholder="Image alt text (for accessibility)"
                    />
                  </div>
                )}

                {section.type === 'callout' && (
                  <textarea
                    rows={2}
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    className="input-field resize-none w-full"
                    placeholder="Callout text (highlighted info box)"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Add Section Buttons */}
          <div className="flex flex-wrap gap-2">
            {SECTION_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => addSection(type)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !slug.trim()}
            className="btn-primary flex-1 justify-center disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Page'}
          </button>
          <button
            onClick={() => navigate('/admin/services')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>

      <ImageCrop
        isOpen={cropOpen}
        onClose={() => { setCropOpen(false); setCropSectionId(null); setCropFile(null); }}
        file={cropFile}
        onCrop={handleImageCrop}
        aspect={16 / 9}
        label="Crop Section Image"
      />
    </>
  );
}
