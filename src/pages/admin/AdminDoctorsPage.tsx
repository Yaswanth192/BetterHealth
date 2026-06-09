import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadPublicFile } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { ClinicDoctor, ClinicService } from '../../types';
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
  experience_years: string;
  available_days: string;
  open_time: string;
  close_time: string;
  sort_order: number;
  is_active: boolean;
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_FORM: DoctorForm = {
  name: '', specialization: '', bio: '', image_url: '',
  qualifications: '', experience_years: '',
  available_days: '', open_time: '09:00', close_time: '17:00',
  sort_order: 0, is_active: true,
};

export function AdminDoctorsPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicDoctor | null>(null);
  const [form, setForm] = useState<DoctorForm>(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clinicId) fetchDoctors();
  }, [clinicId]);

  function toggleAvailableDay(day: string) {
    const days = form.available_days.split(',').map((d) => d.trim()).filter(Boolean);
    const nextDays = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day];

    setForm({ ...form, available_days: nextDays.join(', ') });
  }

  async function fetchDoctors() {
    setLoading(true);
    const [doctorsRes, servicesRes] = await Promise.all([
      supabase.from('clinic_doctors').select('*').eq('clinic_id', clinicId!).order('sort_order'),
      supabase.from('clinic_services').select('*').eq('clinic_id', clinicId!).eq('is_active', true).order('sort_order'),
    ]);

    if (doctorsRes.error) {
      addToast('error', doctorsRes.error.message);
    }
    if (servicesRes.error) {
      addToast('error', servicesRes.error.message);
    }

    setDoctors(doctorsRes.data ?? []);
    setServices(servicesRes.data ?? []);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
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
      experience_years: doctor.experience_years ? String(doctor.experience_years) : '',
      available_days: doctor.available_days?.join(', ') ?? '',
      open_time: doctor.open_time || '09:00',
      close_time: doctor.close_time || '17:00',
      sort_order: doctor.sort_order,
      is_active: doctor.is_active,
    });
    setPhotoFile(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const doctorId = editing?.id ?? crypto.randomUUID();
      const imageUrl = photoFile
        ? await uploadPublicFile(photoFile, {
            bucket: 'SellHealthStorage',
            path: `doctors/${doctorId}`,
            fileName: 'photo',
          })
        : form.image_url;

      const payload = {
        ...(!editing ? { id: doctorId } : {}),
        clinic_id: clinicId!,
        name: form.name,
        specialization: form.specialization,
        bio: form.bio,
        image_url: imageUrl,
        qualifications: form.qualifications.split(',').map((q) => q.trim()).filter(Boolean),
        experience_years: parseInt(form.experience_years, 10) || 0,
        available_days: form.available_days.split(',').map((d) => d.trim()).filter(Boolean),
        open_time: form.open_time,
        close_time: form.close_time,
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
    } catch (error: any) {
      addToast('error', error?.message || 'Failed to save doctor');
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
          <button onClick={openCreate} disabled={services.length === 0} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
        </div>

        {services.length === 0 && (
          <div className="card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-neutral-900">Add services first</h2>
              <p className="text-sm text-neutral-500 mt-1">Doctor specialization is selected from your active services.</p>
            </div>
            <Link to="/admin/services" className="btn-primary justify-center">
              <Plus className="w-4 h-4" /> Add Services
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.length === 0 ? (
            <div className="col-span-3 card text-center py-14">
              <Users className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-400 mb-4">No doctors added yet</p>
              {services.length > 0 ? (
                <button onClick={openCreate} className="btn-primary">Add First Doctor</button>
              ) : (
                <Link to="/admin/services" className="btn-primary">Add Services First</Link>
              )}
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
                  <p className="text-xs text-neutral-400 mt-1">{doctor.open_time} - {doctor.close_time}</p>
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
              {services.length > 0 ? (
                <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="input-field appearance-none">
                  <option value="">Select a service</option>
                  {form.specialization && !services.some((service) => service.title === form.specialization) && (
                    <option value={form.specialization}>{form.specialization}</option>
                  )}
                  {services.map((service) => (
                    <option key={service.id} value={service.title}>{service.title}</option>
                  ))}
                </select>
              ) : (
                <Link to="/admin/services" className="btn-primary w-full justify-center">
                  <Plus className="w-4 h-4" /> Add Services First
                </Link>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Upload Doctor Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="input-field" />
            <p className="mt-1 text-xs text-neutral-500">Uploads to SellHealthStorage/doctors/[doctorId]/photo and saves the public URL into image_url.</p>
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
              <input type="number" min="0" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} className="input-field" placeholder="19" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Available Days</label>
              <details className="relative">
                <summary className="input-field cursor-pointer list-none">
                  {form.available_days || 'Select available days'}
                </summary>
                <div className="absolute z-20 mt-2 w-full rounded-lg border border-neutral-200 bg-white p-3 shadow-lg">
                  <div className="space-y-2">
                    {WEEK_DAYS.map((day) => {
                      const selectedDays = form.available_days.split(',').map((d) => d.trim()).filter(Boolean);
                      return (
                        <label key={day} className="flex items-center gap-2 text-sm text-neutral-700">
                          <input
                            type="checkbox"
                            checked={selectedDays.includes(day)}
                            onChange={() => toggleAvailableDay(day)}
                            className="w-4 h-4 accent-primary-600"
                          />
                          {day}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </details>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Open Time</label>
              <input type="time" value={form.open_time} onChange={(e) => setForm({ ...form, open_time: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Close Time</label>
              <input type="time" value={form.close_time} onChange={(e) => setForm({ ...form, close_time: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="doctor-active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="doctor-active" className="text-sm font-medium text-neutral-700">Active (visible on website)</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.name || !form.specialization || services.length === 0} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update Doctor' : 'Add Doctor'}
            </button>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
