import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Users, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ClinicDoctor } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

interface DoctorForm {
  name: string;
  specialization: string;
  bio: string;
  image_url: string;
  qualifications: string;
  experience_years: number;
  available_days: string;
  available_times: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: DoctorForm = {
  name: '', specialization: '', bio: '', image_url: '',
  qualifications: '', experience_years: 0,
  available_days: '', available_times: '',
  sort_order: 0, is_active: true,
};

export function AdminDoctorsPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicDoctor | null>(null);
  const [form, setForm] = useState<DoctorForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clinicId) fetchDoctors();
  }, [clinicId]);

  async function fetchDoctors() {
    setLoading(true);
    const { data } = await supabase.from('clinic_doctors').select('*').eq('clinic_id', clinicId!).order('sort_order');
    setDoctors(data ?? []);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(doctor: ClinicDoctor) {
    setEditing(doctor);
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      bio: doctor.bio,
      image_url: doctor.image_url,
      qualifications: doctor.qualifications?.join(', ') ?? '',
      experience_years: doctor.experience_years,
      available_days: doctor.available_days?.join(', ') ?? '',
      available_times: doctor.available_times,
      sort_order: doctor.sort_order,
      is_active: doctor.is_active,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const imageUrl = photoFile
        ? await uploadPublicFile(photoFile, {
            bucket: 'SellHealthStorage',
            path: `doctors/${clinicId}`,
            fileName: form.name || 'doctor-photo',
          })
        : form.image_url;

      const payload = {
        clinic_id: clinicId!,
        name: form.name,
        specialization: form.specialization,
        bio: form.bio,
        image_url: imageUrl,
        qualifications: form.qualifications.split(',').map((q) => q.trim()).filter(Boolean),
        experience_years: form.experience_years,
        available_days: form.available_days.split(',').map((d) => d.trim()).filter(Boolean),
        available_times: form.available_times,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };

      const { error } = editing
        ? await supabase.from('clinic_doctors').update(payload).eq('id', editing.id)
        : await supabase.from('clinic_doctors').insert(payload);

      if (error) throw error;

      addToast('success', editing ? 'Doctor updated' : 'Doctor added');
      setModalOpen(false);
      setPhotoFile(null);
      fetchDoctors();
    } catch {
      addToast('error', 'Failed to save doctor');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this doctor?')) return;
    const { error } = await supabase.from('clinic_doctors').delete().eq('id', id);
    if (error) {
      addToast('error', 'Failed to delete');
    } else {
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      addToast('success', 'Doctor deleted');
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Doctors</h1>
            <p className="text-neutral-500 text-sm mt-1">{doctors.length} doctors</p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.length === 0 ? (
            <div className="col-span-3 card text-center py-14">
              <Users className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-400 mb-4">No doctors added yet</p>
              <button onClick={openCreate} className="btn-primary">Add First Doctor</button>
            </div>
          ) : (
            doctors.map((doctor) => (
              <div key={doctor.id} className={`card overflow-hidden ${!doctor.is_active ? 'opacity-60' : ''}`}>
                <div className="h-40 bg-neutral-100 overflow-hidden">
                  {doctor.image_url ? (
                    <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-50">
                      <Users className="w-12 h-12 text-primary-200" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-neutral-900 text-sm">{doctor.name}</h3>
                    {!doctor.is_active && <span className="badge bg-neutral-100 text-neutral-500">Inactive</span>}
                  </div>
                  <p className="text-xs text-primary-600 font-medium mb-2">{doctor.specialization}</p>
                  <p className="text-xs text-neutral-400">{doctor.experience_years} years experience</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(doctor)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDelete(doctor.id)} className="py-2 px-3 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Doctor' : 'Add Doctor'} size="lg">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Dr. Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Specialization *</label>
              <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="input-field" placeholder="Cardiologist" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Upload Doctor Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="input-field" />
            <p className="mt-1 text-xs text-neutral-500">Uploads to SellHealthStorage/doctors/{clinicId} and saves the public URL into image_url.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Bio</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field resize-none" placeholder="Brief professional biography..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Qualifications (comma-separated)</label>
              <input type="text" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} className="input-field" placeholder="MD, FACC, PhD" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Years of Experience</label>
              <input type="number" min="0" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Available Days (comma-separated)</label>
              <input type="text" value={form.available_days} onChange={(e) => setForm({ ...form, available_days: e.target.value })} className="input-field" placeholder="Monday, Tuesday, Wednesday" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Available Times</label>
              <input type="text" value={form.available_times} onChange={(e) => setForm({ ...form, available_times: e.target.value })} className="input-field" placeholder="Mon-Fri 9AM-5PM" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="doctor-active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="doctor-active" className="text-sm font-medium text-neutral-700">Active (visible on website)</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update Doctor' : 'Add Doctor'}
            </button>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
