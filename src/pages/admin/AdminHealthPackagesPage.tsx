import { useEffect, useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { HealthPackage } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

interface SectionSettings {
  show: boolean;
  useDummies: boolean;
}

interface PackageForm {
  name: string;
  price: string;
  features: string;
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: PackageForm = { name: '', price: '', features: '', is_popular: false, sort_order: 0, is_active: true };

export function AdminHealthPackagesPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SectionSettings>({ show: true, useDummies: true });
  const [savingSettings, setSavingSettings] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HealthPackage | null>(null);
  const [form, setForm] = useState<PackageForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [inlineForm, setInlineForm] = useState<PackageForm>(EMPTY_FORM);
  const [inlineSaving, setInlineSaving] = useState(false);

  useEffect(() => {
    if (clinicId) {
      fetchSettings();
      fetchPackages();
    }
  }, [clinicId]);

  async function fetchSettings() {
    const { data } = await supabase.from('clinics').select('section_settings').eq('id', clinicId!).maybeSingle();
    if (data?.section_settings?.healthPackages) {
      setSettings(data.section_settings.healthPackages);
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
    const { error } = await supabase.from('clinics').update({ section_settings: { ...full, healthPackages: next } }).eq('id', clinicId!);
    if (error) {
      addToast('error', 'Failed to update settings');
    } else {
      setSettings(next);
      addToast('success', 'Settings updated');
    }
    setSavingSettings(false);
  }

  async function fetchPackages() {
    setLoading(true);
    const { data } = await supabase.from('health_packages').select('*').eq('clinic_id', clinicId!).order('sort_order');
    setPackages(data ?? []);
    setLoading(false);
  }

  function parseFeatures(text: string): string[] {
    return text.split('\n').map(f => f.trim()).filter(Boolean);
  }

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(p: HealthPackage) {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(p.price),
      features: (p.features ?? []).join('\n'),
      is_popular: p.is_popular,
      sort_order: p.sort_order,
      is_active: p.is_active,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        clinic_id: clinicId!,
        name: form.name,
        price: parseInt(form.price, 10) || 0,
        features: parseFeatures(form.features),
        is_popular: form.is_popular,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };
      const { error } = editing
        ? await supabase.from('health_packages').update(payload).eq('id', editing.id)
        : await supabase.from('health_packages').insert(payload);
      if (error) throw error;
      addToast('success', editing ? 'Package updated' : 'Package added');
      setModalOpen(false);
      fetchPackages();
    } catch {
      addToast('error', 'Failed to save package');
    }
    setSaving(false);
  }

  async function handleInlineSave() {
    if (!inlineForm.name || !inlineForm.price) return;
    setInlineSaving(true);
    try {
      const { error } = await supabase.from('health_packages').insert({
        clinic_id: clinicId!,
        name: inlineForm.name,
        price: parseInt(inlineForm.price, 10) || 0,
        features: parseFeatures(inlineForm.features),
        is_popular: inlineForm.is_popular,
        sort_order: 0,
        is_active: true,
      });
      if (error) throw error;
      addToast('success', 'Package added — switched to real data');
      setInlineForm(EMPTY_FORM);
      await updateSettings({ useDummies: false });
      fetchPackages();
    } catch {
      addToast('error', 'Failed to add package');
    }
    setInlineSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this package?')) return;
    const { error } = await supabase.from('health_packages').delete().eq('id', id);
    if (error) {
      addToast('error', 'Failed to delete');
    } else {
      setPackages(prev => prev.filter(p => p.id !== id));
      addToast('success', 'Package deleted');
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
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Health Packages</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{packages.length} packages</p>
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Package</button>
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
            {!settings.useDummies && packages.length === 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                Add your first package below
              </span>
            )}
          </div>
        </div>

        {/* Inline Quick-Add Form */}
        {settings.show && !settings.useDummies && packages.length === 0 && (
          <div className="card p-6 border-2 border-dashed border-primary-300 dark:border-primary-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Add Your First Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Package Name *</label>
                <input type="text" value={inlineForm.name} onChange={(e) => setInlineForm({ ...inlineForm, name: e.target.value })} className="input-field" placeholder="e.g. Basic Health Check-up" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Price (₹) *</label>
                <input type="number" min="0" value={inlineForm.price} onChange={(e) => setInlineForm({ ...inlineForm, price: e.target.value })} className="input-field" placeholder="1999" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Features (one per line)</label>
                <textarea
                  rows={4}
                  value={inlineForm.features}
                  onChange={(e) => setInlineForm({ ...inlineForm, features: e.target.value })}
                  className="input-field resize-none font-mono text-sm"
                  placeholder={"Complete Blood Count (CBC)\nBlood Sugar (Fasting & PP)\nLipid Profile"}
                />
                {inlineForm.features && (
                  <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Preview:</p>
                    <ul className="space-y-1">
                      {parseFeatures(inlineForm.features).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                          <Check className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="inline-popular" checked={inlineForm.is_popular} onChange={(e) => setInlineForm({ ...inlineForm, is_popular: e.target.checked })} className="w-4 h-4 accent-primary-600" />
                <label htmlFor="inline-popular" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Most Popular</label>
              </div>
            </div>
            <button
              onClick={handleInlineSave}
              disabled={inlineSaving || !inlineForm.name || !inlineForm.price}
              className="btn-primary mt-4 disabled:opacity-50"
            >
              {inlineSaving ? 'Saving...' : 'Add Package & Switch to Real Data'}
            </button>
          </div>
        )}

        {/* Packages Grid */}
        {packages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`card p-5 relative ${pkg.is_popular ? 'ring-2 ring-primary-500' : ''}`}>
                {pkg.is_popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full">Most Popular</span>
                )}
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{pkg.name}</h3>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 my-2">₹{pkg.price.toLocaleString()}</div>
                <ul className="space-y-1.5 mb-4">
                  {(pkg.features ?? []).slice(0, 5).map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {(pkg.features ?? []).length > 5 && (
                    <li className="text-xs text-neutral-400">+{(pkg.features ?? []).length - 5} more features</li>
                  )}
                </ul>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(pkg)} className="flex-1 py-2 text-sm font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-200 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(pkg.id)} className="py-2 px-3 text-sm bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Package' : 'Add Package'}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Package Name *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Price (₹) *</label>
              <input type="number" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Features (one per line)</label>
            <textarea
              rows={5}
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              className="input-field resize-none font-mono text-sm"
              placeholder={"Complete Blood Count (CBC)\nBlood Sugar (Fasting & PP)\nLipid Profile"}
            />
            {form.features && (
              <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Live Preview:</p>
                <ul className="space-y-1">
                  {parseFeatures(form.features).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="pkg-popular" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="pkg-popular" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Mark as Most Popular</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="pkg-active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="pkg-active" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Active</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.name || !form.price} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update' : 'Add Package'}
            </button>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
