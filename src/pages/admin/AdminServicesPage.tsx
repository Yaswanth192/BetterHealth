import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadPublicFile } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { ClinicService } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

const ICON_OPTIONS = ['stethoscope', 'heart', 'brain', 'bone', 'eye', 'baby', 'microscope', 'pill'];

interface ServiceForm {
  title: string;
  description: string;
  icon: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: ServiceForm = { title: '', description: '', icon: 'stethoscope', image_url: '', sort_order: 0, is_active: true };

export function AdminServicesPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [services, setServices] = useState<ClinicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicService | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clinicId) fetchServices();
  }, [clinicId]);

  async function fetchServices() {
    setLoading(true);
    const { data } = await supabase.from('clinic_services').select('*').eq('clinic_id', clinicId!).order('sort_order');
    setServices(data ?? []);
    setLoading(false);
  }

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setModalOpen(true); }
  function openEdit(s: ClinicService) {
    setEditing(s);
    setForm({ title: s.title, description: s.description, icon: s.icon, image_url: s.image_url, sort_order: s.sort_order, is_active: s.is_active });
    setImageFile(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const serviceId = editing?.id ?? crypto.randomUUID();
      const imageUrl = imageFile
        ? await uploadPublicFile(imageFile, {
            bucket: 'SellHealthStorage',
            path: `services/${serviceId}`,
            fileName: 'image',
          })
        : form.image_url;

      const payload = { ...(!editing ? { id: serviceId } : {}), clinic_id: clinicId!, ...form, image_url: imageUrl };
      const { error } = editing
        ? await supabase.from('clinic_services').update(payload).eq('id', editing.id)
        : await supabase.from('clinic_services').insert(payload);

      if (error) throw error;

      addToast('success', editing ? 'Service updated' : 'Service added');
      setModalOpen(false);
      setImageFile(null);
      fetchServices();
    } catch {
      addToast('error', 'Failed to save service');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this service?')) return;
    const { error } = await supabase.from('clinic_services').delete().eq('id', id);
    if (error) {
      addToast('error', 'Failed to delete');
    } else {
      setServices((prev) => prev.filter((s) => s.id !== id));
      addToast('success', 'Service deleted');
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Services</h1>
            <p className="text-neutral-500 text-sm mt-1">{services.length} services</p>
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Service</button>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase px-6 py-3">Service</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase px-6 py-3 hidden sm:table-cell">Description</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase px-6 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-neutral-500 uppercase px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <Activity className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                    <p className="text-neutral-400 mb-4">No services added yet</p>
                    <button onClick={openCreate} className="btn-primary">Add First Service</button>
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-neutral-900 text-sm">{s.title}</p>
                      <p className="text-xs text-neutral-400">{s.icon}</p>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <p className="text-sm text-neutral-600 truncate max-w-xs">{s.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={s.is_active ? 'badge bg-emerald-100 text-emerald-700' : 'badge bg-neutral-100 text-neutral-500'}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Service' : 'Add Service'}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Cardiology" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Upload Service Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="input-field" />
              <p className="mt-1 text-xs text-neutral-500">Uploads to SellHealthStorage/services/[serviceId]/image and saves the public URL into image_url.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Icon</label>
              <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field appearance-none">
                {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="service-active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="service-active" className="text-sm font-medium text-neutral-700">Active</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.title} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update' : 'Add Service'}
            </button>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
