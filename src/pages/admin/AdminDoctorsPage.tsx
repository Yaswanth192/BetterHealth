import { useEffect, useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadPublicFile, deletePublicFile } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { ClinicDoctor, ClinicService } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ImageWithFocalPoint } from '../../components/ImageWithFocalPoint';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

interface DoctorForm {
  name: string;
  specialization: string;
  bio: string;
  image_url: string;
  qualifications: string;
  experience_years: string;
  languages: string;
  is_director: boolean;
  director_bio: string;
  director_quote: string;
  available_days: string;
  open_time: string;
  close_time: string;
  whatsapp_number: string;
  sort_order: number;
  is_active: boolean;
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_FORM: DoctorForm = {
  name: '', specialization: '', bio: '', image_url: '',
  qualifications: '', experience_years: '', languages: 'English, Hindi',
  is_director: false, director_bio: '', director_quote: '',
  available_days: '', open_time: '09:00', close_time: '17:00',
  whatsapp_number: '', sort_order: 0, is_active: true,
};

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: ClinicDoctor | null;
  services: ClinicService[];
  clinicId: string;
  onSave: (form: DoctorForm, photoFile: File | null, editing: ClinicDoctor | null, position: { x: number; y: number }, zoom: number) => Promise<void>;
}

const DoctorFormModal = memo(function DoctorFormModal({ isOpen, onClose, editing, services, clinicId, onSave }: DoctorFormModalProps) {
  const [form, setForm] = useState<DoctorForm>(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(1);

  const setField = useCallback(<K extends keyof DoctorForm>(key: K, value: DoctorForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        setForm({
          name: editing.name,
          specialization: editing.specialization,
          bio: editing.bio,
          image_url: editing.image_url,
          qualifications: editing.qualifications?.join(', ') ?? '',
          experience_years: editing.experience_years ? String(editing.experience_years) : '',
          languages: editing.languages?.join(', ') ?? 'English, Hindi',
          is_director: editing.is_director ?? false,
          director_bio: editing.director_bio ?? '',
          director_quote: editing.director_quote ?? '',
          available_days: editing.available_days?.join(', ') ?? '',
          open_time: editing.open_time || '09:00',
          close_time: editing.close_time || '17:00',
          whatsapp_number: editing.whatsapp_number ?? '',
          sort_order: editing.sort_order,
          is_active: editing.is_active,
        });
        setPosition(editing.image_position ?? { x: 50, y: 50 });
        setZoom(editing.image_zoom ?? 1);
      } else {
        setForm(EMPTY_FORM);
        setPosition({ x: 50, y: 50 });
        setZoom(1);
      }
      setPhotoFile(null);
    }
  }, [isOpen, editing]);

  function toggleAvailableDay(day: string) {
    const days = form.available_days.split(',').map((d) => d.trim()).filter(Boolean);
    const nextDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    setField('available_days', nextDays.join(', '));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(form, photoFile, editing, position, zoom);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Doctor' : 'Add Doctor'} size="lg">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Name *</label>
            <input type="text" required value={form.name} onChange={(e) => setField('name', e.target.value)} className="input-field" placeholder="Dr. Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Specialization *</label>
            {services.length > 0 ? (
              <select value={form.specialization} onChange={(e) => setField('specialization', e.target.value)} className="input-field appearance-none">
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
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Upload Doctor Photo</label>
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhotoFile(f); }} className="input-field" />
          {(photoFile || form.image_url) && (
            <div className="mt-2">
              <ImageWithFocalPoint
                currentUrl={form.image_url}
                file={photoFile}
                onFileChange={setPhotoFile}
                onRemove={() => { setPhotoFile(null); setField('image_url', ''); }}
                position={position}
                onPositionChange={setPosition}
                zoom={zoom}
                onZoomChange={setZoom}
                ratio="3:4 (portrait)"
                previewAspect="3/4"
                previewMaxWidth="200px"
              />
            </div>
          )}
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Uploads to SellHealthStorage/clinics/{clinicId}/doctors/[doctorId]/photo and saves the public URL into image_url.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Bio</label>
          <textarea rows={3} value={form.bio} onChange={(e) => setField('bio', e.target.value)} className="input-field resize-none" placeholder="Brief professional biography..." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Qualifications (comma-separated)</label>
            <input type="text" value={form.qualifications} onChange={(e) => setField('qualifications', e.target.value)} className="input-field" placeholder="MD, FACC, PhD" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Years of Experience</label>
            <input type="number" min="0" value={form.experience_years} onChange={(e) => setField('experience_years', e.target.value)} className="input-field" placeholder="19" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Languages (comma-separated)</label>
          <input type="text" value={form.languages} onChange={(e) => setField('languages', e.target.value)} className="input-field" placeholder="English, Hindi, Marathi" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="doctor-director" checked={form.is_director} onChange={(e) => setField('is_director', e.target.checked)} className="w-4 h-4 accent-primary-600" />
          <label htmlFor="doctor-director" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Founder / Director (show in director spotlight)</label>
        </div>
        {form.is_director && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Director Bio</label>
              <textarea rows={3} value={form.director_bio} onChange={(e) => setField('director_bio', e.target.value)} className="input-field resize-none" placeholder="Detailed biography for director spotlight section..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Director Quote</label>
              <input type="text" value={form.director_quote} onChange={(e) => setField('director_quote', e.target.value)} className="input-field" placeholder="Vision statement or motto..." />
            </div>
          </>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Available Days</label>
            <details className="relative">
              <summary className="input-field cursor-pointer list-none">
                {form.available_days || 'Select available days'}
              </summary>
              <div className="absolute z-20 mt-2 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 shadow-lg">
                <div className="space-y-2">
                  {(() => {
                    const selectedDays = form.available_days.split(',').map((d) => d.trim()).filter(Boolean);
                    return WEEK_DAYS.map((day) => (
                      <label key={day} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                        <input
                          type="checkbox"
                          checked={selectedDays.includes(day)}
                          onChange={() => toggleAvailableDay(day)}
                          className="w-4 h-4 accent-primary-600"
                        />
                        {day}
                      </label>
                    ));
                  })()}
                </div>
              </div>
            </details>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Open Time</label>
            <input type="time" value={form.open_time} onChange={(e) => setField('open_time', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Close Time</label>
            <input type="time" value={form.close_time} onChange={(e) => setField('close_time', e.target.value)} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">WhatsApp Number</label>
          <div className="flex gap-2">
            <select
              value={form.whatsapp_number ? (form.whatsapp_number.match(/^\+\d{1,4}/)?.[0] || '+91') : '+91'}
              onChange={(e) => {
                const digits = form.whatsapp_number.replace(/^\+\d{1,4}\s*/, '');
                setField('whatsapp_number', `${e.target.value} ${digits}`.trim());
              }}
              className="input-field w-24 appearance-none"
            >
              <option value="+91">+91 🇮🇳</option>
              <option value="+1">+1 🇺🇸</option>
              <option value="+44">+44 🇬🇧</option>
              <option value="+61">+61 🇦🇺</option>
              <option value="+971">+971 🇦🇪</option>
            </select>
            <input
              type="tel"
              value={form.whatsapp_number.replace(/^\+\d{1,4}\s*/, '')}
              onChange={(e) => {
                const country = form.whatsapp_number.match(/^\+\d{1,4}/)?.[0] || '+91';
                const digits = e.target.value.replace(/[^0-9]/g, '');
                setField('whatsapp_number', `${country} ${digits}`.trim());
              }}
              className="input-field flex-1"
              placeholder="98765 43210"
            />
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Include country code. Used for automated WhatsApp notifications.</p>
          {form.whatsapp_number && (
            <p className="mt-1 text-xs text-primary-600 dark:text-primary-400">Preview: {form.whatsapp_number}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="doctor-active" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} className="w-4 h-4 accent-primary-600" />
          <label htmlFor="doctor-active" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Active (visible on website)</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving || !form.name || !form.specialization || services.length === 0} className="btn-primary flex-1 justify-center disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Update Doctor' : 'Add Doctor'}
          </button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </Modal>
  );
});

export function AdminDoctorsPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicDoctor | null>(null);

  useEffect(() => {
    if (clinicId) fetchDoctors();
  }, [clinicId]);

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
    setModalOpen(true);
  }

  function openEdit(doctor: ClinicDoctor) {
    setEditing(doctor);
    setModalOpen(true);
  }

  async function handleSave(form: DoctorForm, photoFile: File | null, editingDoctor: ClinicDoctor | null, position: { x: number; y: number }, zoom: number) {
    const doctorId = editingDoctor?.id ?? crypto.randomUUID();
    
    // Delete old image if uploading a new one
    if (photoFile && editingDoctor?.image_url) {
      await deletePublicFile(editingDoctor.image_url);
    }
    
    const imageUrl = photoFile
      ? (await uploadPublicFile(photoFile, {
          bucket: 'SellHealthStorage',
          path: `clinics/${clinicId}/doctors/${doctorId}`,
          fileName: 'photo',
        })) + `?v=${Date.now()}`
      : form.image_url;

    const payload = {
      ...(!editingDoctor ? { id: doctorId } : {}),
      clinic_id: clinicId!,
      name: form.name,
      specialization: form.specialization,
      bio: form.bio,
      image_url: imageUrl,
      image_position: position,
      image_zoom: zoom,
      qualifications: form.qualifications.split(',').map((q) => q.trim()).filter(Boolean),
      experience_years: parseInt(form.experience_years, 10) || 0,
      languages: form.languages.split(',').map((l) => l.trim()).filter(Boolean),
      is_director: form.is_director,
      director_bio: form.director_bio,
      director_quote: form.director_quote,
      available_days: form.available_days.split(',').map((d) => d.trim()).filter(Boolean),
      open_time: form.open_time,
      close_time: form.close_time,
      whatsapp_number: form.whatsapp_number,
      sort_order: form.sort_order,
      is_active: form.is_active,
    };

    const { error } = editingDoctor
      ? await supabase.from('clinic_doctors').update(payload).eq('id', editingDoctor.id)
      : await supabase.from('clinic_doctors').insert(payload);

    if (error) throw error;

    addToast('success', editingDoctor ? 'Doctor updated' : 'Doctor added');
    setModalOpen(false);
    fetchDoctors();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this doctor?')) return;
    
    // Find the doctor to get their image URL
    const doctor = doctors.find(d => d.id === id);
    
    const { error } = await supabase.from('clinic_doctors').delete().eq('id', id);
    if (error) {
      addToast('error', 'Failed to delete');
    } else {
      // Delete image from storage
      if (doctor?.image_url) {
        await deletePublicFile(doctor.image_url);
      }
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
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Doctors</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{doctors.length} doctors</p>
          </div>
          <button onClick={openCreate} disabled={services.length === 0} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
        </div>

        {services.length === 0 && (
          <div className="card dark:bg-neutral-800 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Add services first</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Doctor specialization is selected from your active services.</p>
            </div>
            <Link to="/admin/services" className="btn-primary justify-center">
              <Plus className="w-4 h-4" /> Add Services
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {doctors.length === 0 ? (
            <div className="col-span-2 card dark:bg-neutral-800 text-center py-14">
              <Users className="w-12 h-12 text-neutral-200 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 dark:text-neutral-500 mb-4">No doctors added yet</p>
              {services.length > 0 ? (
                <button onClick={openCreate} className="btn-primary">Add First Doctor</button>
              ) : (
                <Link to="/admin/services" className="btn-primary">Add Services First</Link>
              )}
            </div>
          ) : (
            doctors.map((doctor) => (
              <div key={doctor.id} className={`card dark:bg-neutral-800 overflow-hidden ${!doctor.is_active ? 'opacity-60' : ''}`}>
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-40 h-48 sm:h-[180px] flex-shrink-0 bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
                    {doctor.image_url ? (
                      <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover object-top" style={{
                        objectPosition: doctor.image_position ? `${doctor.image_position.x}% ${doctor.image_position.y}%` : undefined,
                        transform: doctor.image_zoom && doctor.image_zoom > 1 ? `scale(${doctor.image_zoom})` : undefined,
                        transformOrigin: doctor.image_position ? `${doctor.image_position.x}% ${doctor.image_position.y}%` : undefined,
                      }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-50 dark:bg-primary-900/20">
                        <Users className="w-10 h-10 text-primary-200 dark:text-primary-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">{doctor.name}</h3>
                      {!doctor.is_active && <span className="badge bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">Inactive</span>}
                    </div>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{doctor.specialization}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{doctor.experience_years} years experience</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{doctor.open_time} - {doctor.close_time}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openEdit(doctor)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(doctor.id)} className="py-2 px-3 text-xs font-medium bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <DoctorFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        services={services}
        clinicId={clinicId!}
        onSave={handleSave}
      />
    </>
  );
}
