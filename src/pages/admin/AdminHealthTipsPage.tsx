import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BlogPost } from '../../types';
import { uploadPublicFile } from '../../lib/storage';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ImageCrop } from '../../components/ImageCrop';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

interface SectionSettings {
  show: boolean;
  useDummies: boolean;
}

interface BlogPostForm {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  read_time: string;
  author: string;
  publish_date: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: BlogPostForm = {
  title: '', excerpt: '', content: '', category: '', image_url: '',
  read_time: '5 min read', author: '', publish_date: new Date().toISOString().split('T')[0],
  sort_order: 0, is_active: true,
};

export function AdminHealthTipsPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SectionSettings>({ show: true, useDummies: true });
  const [savingSettings, setSavingSettings] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogPostForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [inlineForm, setInlineForm] = useState<BlogPostForm>(EMPTY_FORM);
  const [inlineImageFile, setInlineImageFile] = useState<File | null>(null);
  const [inlineSaving, setInlineSaving] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<'modal' | 'inline'>('modal');

  useEffect(() => {
    if (clinicId) {
      fetchSettings();
      fetchPosts();
      fetchCategories();
    }
  }, [clinicId]);

  async function fetchSettings() {
    const { data } = await supabase.from('clinics').select('section_settings').eq('id', clinicId!).maybeSingle();
    if (data?.section_settings?.healthTips) {
      setSettings(data.section_settings.healthTips);
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
    const { error } = await supabase.from('clinics').update({ section_settings: { ...full, healthTips: next } }).eq('id', clinicId!);
    if (error) {
      addToast('error', 'Failed to update settings');
    } else {
      setSettings(next);
      addToast('success', 'Settings updated');
    }
    setSavingSettings(false);
  }

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').eq('clinic_id', clinicId!).order('sort_order');
    setPosts(data ?? []);
    setLoading(false);
  }

  async function fetchCategories() {
    const { data } = await supabase.from('blog_posts').select('category').eq('clinic_id', clinicId!);
    const cats = new Set((data ?? []).map((d: { category: string }) => d.category).filter(Boolean));
    setCategories(Array.from(cats).sort());
  }

  async function addCategory() {
    const cat = newCategory.trim();
    if (!cat || categories.includes(cat)) return;
    setCategories(prev => [...prev, cat].sort());
    setNewCategory('');
    setShowCategoryManager(false);
    addToast('success', `Category "${cat}" added`);
  }

  async function removeCategory(cat: string) {
    if (!confirm(`Delete category "${cat}"? Posts with this category will keep their category.`)) return;
    setCategories(prev => prev.filter(c => c !== cat));
    addToast('success', `Category "${cat}" removed from list`);
  }

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setModalOpen(true); }
  function openEdit(p: BlogPost) {
    setEditing(p);
    setForm({
      title: p.title, excerpt: p.excerpt, content: p.content, category: p.category,
      image_url: p.image_url, read_time: p.read_time, author: p.author,
      publish_date: p.publish_date, sort_order: p.sort_order, is_active: p.is_active,
    });
    setImageFile(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const postId = editing?.id ?? crypto.randomUUID();
      const imageUrl = imageFile
        ? await uploadPublicFile(imageFile, {
            path: `clinics/${clinicId}/blog/${postId}`,
            fileName: 'image',
          })
        : form.image_url;

      const payload = {
        clinic_id: clinicId!,
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        image_url: imageUrl,
        read_time: form.read_time,
        author: form.author,
        publish_date: form.publish_date,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };
      const { error } = editing
        ? await supabase.from('blog_posts').update(payload).eq('id', editing.id)
        : await supabase.from('blog_posts').insert({ ...payload, id: postId });
      if (error) throw error;
      if (form.category && !categories.includes(form.category)) {
        setCategories(prev => [...prev, form.category].sort());
      }
      addToast('success', editing ? 'Health tip updated' : 'Health tip added');
      setModalOpen(false);
      fetchPosts();
    } catch {
      addToast('error', 'Failed to save health tip');
    }
    setSaving(false);
  }

  async function handleInlineSave() {
    if (!inlineForm.title) return;
    setInlineSaving(true);
    try {
      const postId = crypto.randomUUID();
      const imageUrl = inlineImageFile
        ? await uploadPublicFile(inlineImageFile, {
            path: `clinics/${clinicId}/blog/${postId}`,
            fileName: 'image',
          })
        : '';

      const { error } = await supabase.from('blog_posts').insert({
        id: postId,
        clinic_id: clinicId!,
        title: inlineForm.title,
        excerpt: inlineForm.excerpt,
        content: inlineForm.content,
        category: inlineForm.category,
        image_url: imageUrl,
        read_time: inlineForm.read_time || '5 min read',
        author: inlineForm.author,
        publish_date: inlineForm.publish_date || new Date().toISOString().split('T')[0],
        sort_order: 0,
        is_active: true,
      });
      if (error) throw error;
      addToast('success', 'Health tip added — switched to real data');
      setInlineForm(EMPTY_FORM);
      setInlineImageFile(null);
      await updateSettings({ useDummies: false });
      fetchPosts();
      fetchCategories();
    } catch {
      addToast('error', 'Failed to add health tip');
    }
    setInlineSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this health tip?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      addToast('error', 'Failed to delete');
    } else {
      setPosts(prev => prev.filter(p => p.id !== id));
      addToast('success', 'Health tip deleted');
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Health Tips</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{posts.length} articles</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCategoryManager(true)} className="btn-secondary text-sm">Manage Categories</button>
            <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Health Tip</button>
          </div>
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
            {!settings.useDummies && posts.length === 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                Add your first health tip below
              </span>
            )}
          </div>
        </div>

        {/* Inline Quick-Add Form */}
        {settings.show && !settings.useDummies && posts.length === 0 && (
          <div className="card p-6 border-2 border-dashed border-primary-300 dark:border-primary-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Add Your First Health Tip</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Title *</label>
                <input type="text" value={inlineForm.title} onChange={(e) => setInlineForm({ ...inlineForm, title: e.target.value })} className="input-field" placeholder="e.g. 5 Tips for a Healthy Heart" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Category</label>
                <input type="text" value={inlineForm.category} onChange={(e) => setInlineForm({ ...inlineForm, category: e.target.value })} className="input-field" placeholder="e.g. Health Tips" list="inline-categories" />
                <datalist id="inline-categories">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Excerpt</label>
                <input type="text" value={inlineForm.excerpt} onChange={(e) => setInlineForm({ ...inlineForm, excerpt: e.target.value })} className="input-field" placeholder="Short description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Author</label>
                <input type="text" value={inlineForm.author} onChange={(e) => setInlineForm({ ...inlineForm, author: e.target.value })} className="input-field" placeholder="e.g. Dr. Sharma" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Cover Image</label>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCropFile(f); setCropTarget('inline'); setCropOpen(true); } }} className="input-field" />
                {inlineImageFile && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={URL.createObjectURL(inlineImageFile)} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                    <button type="button" onClick={() => setInlineImageFile(null)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleInlineSave}
              disabled={inlineSaving || !inlineForm.title}
              className="btn-primary mt-4 disabled:opacity-50"
            >
              {inlineSaving ? 'Saving...' : 'Add Health Tip & Switch to Real Data'}
            </button>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="card overflow-hidden group">
                {post.image_url && (
                  <div className="relative h-40 overflow-hidden">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full">{post.category}</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm mb-1 line-clamp-1">{post.title}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">{post.author} · {post.read_time}</span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Manager Modal */}
      <Modal isOpen={showCategoryManager} onClose={() => setShowCategoryManager(false)} title="Manage Categories">
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input-field flex-1" placeholder="New category name" onKeyDown={(e) => e.key === 'Enter' && addCategory()} />
            <button onClick={addCategory} disabled={!newCategory.trim()} className="btn-primary disabled:opacity-50">Add</button>
          </div>
          <div className="space-y-2">
            {categories.length === 0 && <p className="text-sm text-neutral-400">No categories yet. Add one above.</p>}
            {categories.map(cat => (
              <div key={cat} className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <span className="text-sm text-neutral-700 dark:text-neutral-200">{cat}</span>
                <button onClick={() => removeCategory(cat)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Health Tip' : 'Add Health Tip'}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" list="modal-categories" />
              <datalist id="modal-categories">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Author</label>
              <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Excerpt</label>
            <input type="text" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Content</label>
            <textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Read Time</label>
              <input type="text" value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} className="input-field" placeholder="5 min read" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Publish Date</label>
              <input type="date" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Cover Image</label>
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCropFile(f); setCropTarget('modal'); setCropOpen(true); } }} className="input-field" />
            {imageFile && (
              <div className="mt-2 flex items-center gap-3">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                <button type="button" onClick={() => setImageFile(null)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="post-active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="post-active" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Active</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.title} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update' : 'Add Health Tip'}
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
          const cropped = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
          if (cropTarget === 'inline') setInlineImageFile(cropped);
          else setImageFile(cropped);
        }}
        aspect={16 / 9}
        label="Crop Cover Image"
      />
    </>
  );
}
