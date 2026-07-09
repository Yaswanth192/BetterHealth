import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Shield, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { InsuranceProvider, Certification } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

interface SectionSettings {
  show: boolean;
  useDummies: boolean;
}

interface ProviderForm {
  name: string;
  logo_url: string;
  sort_order: number;
  is_active: boolean;
}

interface CertForm {
  name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_PROVIDER_FORM: ProviderForm = { name: '', logo_url: '', sort_order: 0, is_active: true };
const EMPTY_CERT_FORM: CertForm = { name: '', icon: 'shield', sort_order: 0, is_active: true };

export function AdminInsurancePage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<SectionSettings>({ show: true, useDummies: true });
  const [savingSettings, setSavingSettings] = useState(false);

  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<InsuranceProvider | null>(null);
  const [providerForm, setProviderForm] = useState<ProviderForm>(EMPTY_PROVIDER_FORM);
  const [savingProvider, setSavingProvider] = useState(false);

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [certForm, setCertForm] = useState<CertForm>(EMPTY_CERT_FORM);
  const [savingCert, setSavingCert] = useState(false);

  useEffect(() => {
    if (clinicId) {
      fetchSettings();
      fetchData();
    }
  }, [clinicId]);

  async function fetchSettings() {
    const { data } = await supabase.from('clinics').select('section_settings').eq('id', clinicId!).maybeSingle();
    if (data?.section_settings?.insurance) {
      setSettings(data.section_settings.insurance);
    }
  }

  async function getFullSettings() {
    const { data } = await supabase.from('clinics').select('section_settings').eq('id', clinicId!).maybeSingle();
    return data?.section_settings ?? {};
  }

  async function updateSettings(patch: Partial<SectionSettings>) {
    const next = { ...settings, ...patch };
    setSavingSettings(true);
    const { error } = await supabase.from('clinics').update({ section_settings: { ...await getFullSettings(), insurance: next } }).eq('id', clinicId!);
    if (error) {
      addToast('error', 'Failed to update settings');
    } else {
      setSettings(next);
      addToast('success', 'Settings updated');
    }
    setSavingSettings(false);
  }

  async function fetchData() {
    setLoading(true);
    const [providersRes, certsRes] = await Promise.all([
      supabase.from('insurance_providers').select('*').eq('clinic_id', clinicId!).order('sort_order'),
      supabase.from('certifications').select('*').eq('clinic_id', clinicId!).order('sort_order'),
    ]);
    setProviders(providersRes.data ?? []);
    setCerts(certsRes.data ?? []);
    setLoading(false);
  }

  // --- Providers ---
  function openCreateProvider() { setEditingProvider(null); setProviderForm(EMPTY_PROVIDER_FORM); setProviderModalOpen(true); }
  function openEditProvider(p: InsuranceProvider) { setEditingProvider(p); setProviderForm({ name: p.name, logo_url: p.logo_url ?? '', sort_order: p.sort_order, is_active: p.is_active }); setProviderModalOpen(true); }

  async function handleSaveProvider() {
    setSavingProvider(true);
    try {
      const payload = { clinic_id: clinicId!, name: providerForm.name, logo_url: providerForm.logo_url, sort_order: providerForm.sort_order, is_active: providerForm.is_active };
      const { error } = editingProvider
        ? await supabase.from('insurance_providers').update(payload).eq('id', editingProvider.id)
        : await supabase.from('insurance_providers').insert(payload);
      if (error) throw error;
      addToast('success', editingProvider ? 'Provider updated' : 'Provider added');
      setProviderModalOpen(false);
      fetchData();
    } catch { addToast('error', 'Failed to save provider'); }
    setSavingProvider(false);
  }

  async function handleDeleteProvider(id: string) {
    if (!confirm('Delete this provider?')) return;
    const { error } = await supabase.from('insurance_providers').delete().eq('id', id);
    if (error) { addToast('error', 'Failed to delete'); }
    else { setProviders(prev => prev.filter(p => p.id !== id)); addToast('success', 'Provider deleted'); }
  }

  // --- Certifications ---
  function openCreateCert() { setEditingCert(null); setCertForm(EMPTY_CERT_FORM); setCertModalOpen(true); }
  function openEditCert(c: Certification) { setEditingCert(c); setCertForm({ name: c.name, icon: c.icon ?? 'shield', sort_order: c.sort_order, is_active: c.is_active }); setCertModalOpen(true); }

  async function handleSaveCert() {
    setSavingCert(true);
    try {
      const payload = { clinic_id: clinicId!, name: certForm.name, icon: certForm.icon, sort_order: certForm.sort_order, is_active: certForm.is_active };
      const { error } = editingCert
        ? await supabase.from('certifications').update(payload).eq('id', editingCert.id)
        : await supabase.from('certifications').insert(payload);
      if (error) throw error;
      addToast('success', editingCert ? 'Certification updated' : 'Certification added');
      setCertModalOpen(false);
      fetchData();
    } catch { addToast('error', 'Failed to save certification'); }
    setSavingCert(false);
  }

  async function handleDeleteCert(id: string) {
    if (!confirm('Delete this certification?')) return;
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (error) { addToast('error', 'Failed to delete'); }
    else { setCerts(prev => prev.filter(c => c.id !== id)); addToast('success', 'Certification deleted'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Insurance & Certifications</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{providers.length} providers, {certs.length} certifications</p>
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
          </div>
        </div>

        {/* Insurance Providers */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Insurance Providers
            </h2>
            <button onClick={openCreateProvider} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add Provider</button>
          </div>
          {providers.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-8">No insurance providers added yet.</p>
          ) : (
            <div className="space-y-2">
              {providers.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => openEditProvider(p)} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteProvider(p.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Certifications & Accreditations
            </h2>
            <button onClick={openCreateCert} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add Certification</button>
          </div>
          {certs.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-8">No certifications added yet.</p>
          ) : (
            <div className="space-y-2">
              {certs.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">{c.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => openEditCert(c)} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteCert(c.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Provider Modal */}
      <Modal isOpen={providerModalOpen} onClose={() => setProviderModalOpen(false)} title={editingProvider ? 'Edit Provider' : 'Add Provider'}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Provider Name *</label>
            <input type="text" required value={providerForm.name} onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })} className="input-field" placeholder="e.g. Star Health" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Logo URL (optional)</label>
            <input type="url" value={providerForm.logo_url} onChange={(e) => setProviderForm({ ...providerForm, logo_url: e.target.value })} className="input-field" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Sort Order</label>
              <input type="number" value={providerForm.sort_order} onChange={(e) => setProviderForm({ ...providerForm, sort_order: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="provider-active" checked={providerForm.is_active} onChange={(e) => setProviderForm({ ...providerForm, is_active: e.target.checked })} className="w-4 h-4 accent-primary-600" />
              <label htmlFor="provider-active" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Active</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveProvider} disabled={savingProvider || !providerForm.name} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {savingProvider ? 'Saving...' : editingProvider ? 'Update' : 'Add Provider'}
            </button>
            <button onClick={() => setProviderModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Certification Modal */}
      <Modal isOpen={certModalOpen} onClose={() => setCertModalOpen(false)} title={editingCert ? 'Edit Certification' : 'Add Certification'}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Certification Name *</label>
            <input type="text" required value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} className="input-field" placeholder="e.g. NABH Accredited" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Icon</label>
            <input type="text" value={certForm.icon} onChange={(e) => setCertForm({ ...certForm, icon: e.target.value })} className="input-field" placeholder="shield" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Sort Order</label>
              <input type="number" value={certForm.sort_order} onChange={(e) => setCertForm({ ...certForm, sort_order: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="cert-active" checked={certForm.is_active} onChange={(e) => setCertForm({ ...certForm, is_active: e.target.checked })} className="w-4 h-4 accent-primary-600" />
              <label htmlFor="cert-active" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Active</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveCert} disabled={savingCert || !certForm.name} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {savingCert ? 'Saving...' : editingCert ? 'Update' : 'Add Certification'}
            </button>
            <button onClick={() => setCertModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
