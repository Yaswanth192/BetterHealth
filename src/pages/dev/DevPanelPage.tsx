import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Building2, Users, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Clinic } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { uploadPublicFile } from '../../lib/storage';

interface ClinicForm {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo_url: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
}

interface AdminForm {
  email: string;
  password: string;
  role: string;
  clinic_id: string;
}

const EMPTY_CLINIC: ClinicForm = {
  name: '', slug: '', tagline: '', description: '', logo_url: '',
  phone: '', email: '', website: '', address: '', city: '', state: '', zip: '',
  primary_color: '#0ea5e9', secondary_color: '#0284c7', is_active: true,
};

const EMPTY_ADMIN: AdminForm = { email: '', password: '', role: 'admin', clinic_id: '' };

export function DevPanelPage() {
  const { role, loading: authLoading } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'clinics' | 'admins'>('clinics');
  const [clinicModal, setClinicModal] = useState(false);
  const [editing, setEditing] = useState<Clinic | null>(null);
  const [clinicForm, setClinicForm] = useState<ClinicForm>(EMPTY_CLINIC);
  const [adminForm, setAdminForm] = useState<AdminForm>(EMPTY_ADMIN);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  if (!authLoading && role !== 'developer') {
    return <Navigate to="/admin" replace />;
  }

  
  return <DevPanelContent clinics={clinics} setClinics={setClinics} loading={loading} setLoading={setLoading}
    tab={tab} setTab={setTab} clinicModal={clinicModal} setClinicModal={setClinicModal}
    editing={editing} setEditing={setEditing}
    clinicForm={clinicForm} setClinicForm={setClinicForm} adminForm={adminForm} setAdminForm={setAdminForm}
    logoFile={logoFile} setLogoFile={setLogoFile} saving={saving} setSaving={setSaving} toasts={toasts} addToast={addToast} removeToast={removeToast}
  />;
}

function DevPanelContent({ clinics, setClinics, loading, setLoading, tab, setTab, clinicModal, setClinicModal,
  editing, setEditing, clinicForm, setClinicForm, adminForm, setAdminForm, logoFile, setLogoFile,
  saving, setSaving, toasts, addToast, removeToast }: any) {

  useEffect(() => { fetchClinics(); }, []);

  async function fetchClinics() {
    setLoading(true);
    const { data } = await supabase.from('clinics').select('*').order('created_at', { ascending: false });
    setClinics(data ?? []);
    setLoading(false);
  }

  function openCreate() { setEditing(null); setClinicForm(EMPTY_CLINIC); setLogoFile(null); setClinicModal(true); }
  function openEdit(c: Clinic) {
    setEditing(c);
    setClinicForm({
      name: c.name, slug: c.slug, tagline: c.tagline, description: c.description,
      logo_url: c.logo_url, phone: c.phone, email: c.email, address: c.address,
      website: c.website,
      city: c.city, state: c.state, zip: c.zip,
      primary_color: c.primary_color, secondary_color: c.secondary_color, is_active: c.is_active,
    });
    setLogoFile(null);
    setClinicModal(true);
  }

  async function handleSaveClinic() {
    setSaving(true);
    try {
      const logoName = clinicForm.slug || clinicForm.name || 'clinic-logo';

      if (editing) {
        let logoUrl = clinicForm.logo_url;
        if (logoFile) {
          logoUrl = await uploadPublicFile(logoFile, {
            bucket: 'SellHealthStorage',
            path: `clinics/${editing.id}/logo`,
            fileName: logoName,
          });
        }

        const { error } = await supabase.from('clinics').update({
          ...clinicForm,
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        }).eq('id', editing.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('clinics').insert({
          ...clinicForm,
          logo_url: clinicForm.logo_url,
          updated_at: new Date().toISOString(),
        }).select('*').single();

        if (error) throw error;

        if (data?.id && logoFile) {
          const finalLogoUrl = await uploadPublicFile(logoFile, {
            bucket: 'SellHealthStorage',
            path: `clinics/${data.id}/logo`,
            fileName: logoName,
          });
          const { error: updateError } = await supabase.from('clinics').update({ logo_url: finalLogoUrl }).eq('id', data.id);
          if (updateError) throw updateError;
        }
      }

      addToast('success', editing ? 'Clinic updated' : 'Clinic created');
      setClinicModal(false);
      setLogoFile(null);
      fetchClinics();
    } catch (error: any) {
      addToast('error', error?.message || 'Failed to save clinic');
    }
    setSaving(false);
  }

  async function handleDeleteClinic(id: string) {
    if (!confirm('Delete this clinic and ALL its data? This cannot be undone.')) return;
    const { error } = await supabase.from('clinics').delete().eq('id', id);
    if (error) addToast('error', 'Failed to delete clinic');
    else { setClinics((prev: Clinic[]) => prev.filter((c: Clinic) => c.id !== id)); addToast('success', 'Clinic deleted'); }
  }

  async function handleCreateAdmin() {
    setSaving(true);
    // Create auth user via signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminForm.email,
      password: adminForm.password,
    });

    if (authError || !authData.user) {
      addToast('error', authError?.message || 'Failed to create user');
      setSaving(false);
      return;
    }

    const { error: adminError } = await supabase.from('clinic_admins').insert({
      user_id: authData.user.id,
      clinic_id: adminForm.clinic_id || null,
      role: adminForm.role,
    });

    if (adminError) addToast('error', 'User created but failed to assign role: ' + adminError.message);
    else { addToast('success', `Admin created: ${adminForm.email}`); setAdminForm(EMPTY_ADMIN); }
    setSaving(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <LoadingSpinner size="lg" className="text-primary-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <header className="bg-neutral-800 border-b border-neutral-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Key className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Developer Panel</h1>
              <p className="text-xs text-neutral-400">Multi-Clinic Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary-900/50 border border-primary-700/50 text-primary-300 text-xs rounded-full font-medium">
              Developer Access
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-neutral-800 rounded-xl p-1 w-fit">
          {[
            { key: 'clinics', label: 'Clinics', icon: Building2 }, 
            { key: 'admins', label: 'Create Admin', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-primary-600 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Clinics Tab */}
        {tab === 'clinics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{clinics.length} Registered Clinics</h2>
              <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> New Clinic</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinics.length === 0 ? (
                <div className="col-span-3 text-center py-16 bg-neutral-800 rounded-2xl border border-neutral-700">
                  <Building2 className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400 mb-4">No clinics registered yet</p>
                  <button onClick={openCreate} className="btn-primary">Register First Clinic</button>
                </div>
              ) : (
                clinics.map((clinic: Clinic) => (
                  <div key={clinic.id} className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 hover:border-neutral-600 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-white">{clinic.name}</h3>
                        <p className="text-xs text-neutral-400 font-mono mt-0.5">/{clinic.slug}</p>
                      </div>
                      <span className={`badge ${clinic.is_active ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50' : 'bg-neutral-700 text-neutral-400'}`}>
                        {clinic.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {clinic.tagline && <p className="text-sm text-neutral-400 mb-3">{clinic.tagline}</p>}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
                      {clinic.city && <span>{clinic.city}, {clinic.state}</span>}
                      {clinic.phone && <span>• {clinic.phone}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(clinic)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-medium rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDeleteClinic(clinic.id)} className="py-2 px-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Create Admin Tab */}
        {tab === 'admins' && (
          <div className="max-w-md">
            <h2 className="text-lg font-bold mb-4">Create New Admin User</h2>
            <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Email *</label>
                <input type="email" required value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Password *</label>
                <input type="password" required value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Min 8 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Role</label>
                <select value={adminForm.role} onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })} className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="developer">Developer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Assign to Clinic (optional)</label>
                <select value={adminForm.clinic_id} onChange={(e) => setAdminForm({ ...adminForm, clinic_id: e.target.value })} className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                  <option value="">No clinic (developer access)</option>
                  {clinics.map((c: Clinic) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button
                onClick={handleCreateAdmin}
                disabled={saving || !adminForm.email || !adminForm.password}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Admin User'}
              </button>
              <p className="text-xs text-neutral-500">The user will receive a verification email. They can log in at /admin once confirmed.</p>
            </div>
          </div>
        )}


      </main>

      {/* Clinic Modal */}
      <Modal isOpen={clinicModal} onClose={() => setClinicModal(false)} title={editing ? 'Edit Clinic' : 'Register New Clinic'} size="xl">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Clinic Name *</label>
              <input type="text" required value={clinicForm.name} onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Slug (URL identifier) *</label>
              <input type="text" required value={clinicForm.slug} onChange={(e) => setClinicForm({ ...clinicForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="input-field font-mono" placeholder="my-clinic" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tagline</label>
              <input type="text" value={clinicForm.tagline} onChange={(e) => setClinicForm({ ...clinicForm, tagline: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Upload Logo</label>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} className="input-field" />
              <p className="mt-1 text-xs text-neutral-500">Uploads to SellHealthStorage/clinics/{clinicForm.slug || 'clinic'}/logo and saves the public URL into logo_url.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea rows={2} value={clinicForm.description} onChange={(e) => setClinicForm({ ...clinicForm, description: e.target.value })} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
              <input type="tel" value={clinicForm.phone} onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input type="email" value={clinicForm.email} onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Domain Name</label>
            <input
              type="text"
              value={clinicForm.website}
              onChange={(e) => setClinicForm({ ...clinicForm, website: e.target.value })}
              className="input-field"
              placeholder="example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
            <input type="text" value={clinicForm.address} onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
              <input type="text" value={clinicForm.city} onChange={(e) => setClinicForm({ ...clinicForm, city: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">State</label>
              <input type="text" value={clinicForm.state} onChange={(e) => setClinicForm({ ...clinicForm, state: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">ZIP</label>
              <input type="text" value={clinicForm.zip} onChange={(e) => setClinicForm({ ...clinicForm, zip: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="clinic-active" checked={clinicForm.is_active} onChange={(e) => setClinicForm({ ...clinicForm, is_active: e.target.checked })} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="clinic-active" className="text-sm font-medium text-neutral-700">Active (publicly visible)</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveClinic} disabled={saving || !clinicForm.name || !clinicForm.slug} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update Clinic' : 'Register Clinic'}
            </button>
            <button onClick={() => setClinicModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

