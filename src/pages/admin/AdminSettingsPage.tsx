import { useEffect, useState } from 'react';
import { Save, Building2, Phone, Mail, MapPin, Globe, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadPublicFile } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { Clinic, ClinicTiming } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function AdminSettingsPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [timings, setTimings] = useState<ClinicTiming[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clinicId) fetchData();
  }, [clinicId]);

  async function fetchData() {
    setLoading(true);
    const [clinicRes, timingsRes] = await Promise.all([
      supabase.from('clinics').select('*').eq('id', clinicId!).maybeSingle(),
      supabase.from('clinic_timings').select('*').eq('clinic_id', clinicId!),
    ]);
    setClinic(clinicRes.data);
    const existingTimings = timingsRes.data ?? [];
    const allTimings = DAYS.map((day) => {
      const existing = existingTimings.find((t) => t.day_of_week === day);
      return existing || { id: '', clinic_id: clinicId!, day_of_week: day, open_time: '09:00', close_time: '17:00', is_closed: day === 'sunday', created_at: '' };
    });
    setTimings(allTimings);
    setLoading(false);
  }

  async function handleSaveClinic(e: React.FormEvent) {
    e.preventDefault();
    if (!clinic) return;
    setSaving(true);
    try {
      let logoUrl = clinic.logo_url;
      if (logoFile) {
        logoUrl = await uploadPublicFile(logoFile, {
          bucket: 'SellHealthStorage',
          path: `clinics/${clinicId}/logo`,
          fileName: 'logo',
        });
      }

      const { error } = await supabase.from('clinics').update({
        name: clinic.name, tagline: clinic.tagline, description: clinic.description,
        logo_url: logoUrl, phone: clinic.phone, email: clinic.email,
        address: clinic.address, city: clinic.city, state: clinic.state,
        zip: clinic.zip, website: clinic.website,
        updated_at: new Date().toISOString(),
      }).eq('id', clinicId!);

      if (error) throw error;

      setClinic({ ...clinic, logo_url: logoUrl });
      setLogoFile(null);
      // notify other parts of the app (admin layout, other tabs) that clinic changed
      try { window.dispatchEvent(new CustomEvent('clinic-updated', { detail: { id: clinicId } })); } catch {}
      addToast('success', 'Clinic information saved');
    } catch {
      addToast('error', 'Failed to save clinic info');
    }
    setSaving(false);
  }

  useEffect(() => {
    if (!logoFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  async function handleSaveTimings() {
    setSaving(true);
    for (const timing of timings) {
      if (timing.id) {
        await supabase.from('clinic_timings').update({
          open_time: timing.open_time, close_time: timing.close_time, is_closed: timing.is_closed,
        }).eq('id', timing.id);
      } else {
        await supabase.from('clinic_timings').upsert({
          clinic_id: clinicId!, day_of_week: timing.day_of_week,
          open_time: timing.open_time, close_time: timing.close_time, is_closed: timing.is_closed,
        }, { onConflict: 'clinic_id,day_of_week' });
      }
    }
    addToast('success', 'Timings saved');
    setSaving(false);
    fetchData();
  }

  function updateTiming(day: string, field: string, value: string | boolean) {
    setTimings((prev) => prev.map((t) => t.day_of_week === day ? { ...t, [field]: value } : t));
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  if (!clinic) return <div className="text-center py-12 text-neutral-400">Clinic data not found</div>;

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Clinic Settings</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage your clinic's public information</p>
        </div>

        {/* Clinic Info */}
        <form onSubmit={handleSaveClinic} className="card p-6 space-y-5">
          <h2 className="font-bold text-neutral-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Clinic Name *</label>
              <input type="text" required value={clinic.name} onChange={(e) => setClinic({ ...clinic, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tagline</label>
              <input type="text" value={clinic.tagline} onChange={(e) => setClinic({ ...clinic, tagline: e.target.value })} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea rows={3} value={clinic.description} onChange={(e) => setClinic({ ...clinic, description: e.target.value })} className="input-field resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Upload Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-neutral-100 rounded-md overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
                ) : clinic.logo_url ? (
                  <img src={clinic.logo_url} alt="logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-neutral-400 text-xs">No logo</div>
                )}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} className="input-field" />
                <p className="mt-1 text-xs text-neutral-500">Uploads to SellHealthStorage/clinics/{clinicId}/logo and saves the public URL into logo_url.</p>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-neutral-800 flex items-center gap-2 pt-2">
            <Phone className="w-4 h-4 text-primary-600" /> Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
              <input type="tel" value={clinic.phone} onChange={(e) => setClinic({ ...clinic, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input type="email" value={clinic.email} onChange={(e) => setClinic({ ...clinic, email: e.target.value })} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
            <input type="text" value={clinic.address} onChange={(e) => setClinic({ ...clinic, address: e.target.value })} className="input-field" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
              <input type="text" value={clinic.city} onChange={(e) => setClinic({ ...clinic, city: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">State</label>
              <input type="text" value={clinic.state} onChange={(e) => setClinic({ ...clinic, state: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">ZIP</label>
              <input type="text" value={clinic.zip} onChange={(e) => setClinic({ ...clinic, zip: e.target.value })} className="input-field" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Timings */}
        <div className="card p-6">
          <h2 className="font-bold text-neutral-900 flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-primary-600" />
            Opening Hours
          </h2>

          <div className="space-y-3">
            {timings.map((t) => (
              <div key={t.day_of_week} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${t.is_closed ? 'bg-neutral-50' : 'bg-primary-50/30'}`}>
                <div className="w-24 flex-shrink-0">
                  <span className="text-sm font-medium text-neutral-700 capitalize">{t.day_of_week}</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    id={`closed-${t.day_of_week}`}
                    checked={t.is_closed}
                    onChange={(e) => updateTiming(t.day_of_week, 'is_closed', e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <label htmlFor={`closed-${t.day_of_week}`} className="text-xs text-neutral-500">Closed</label>
                </div>
                {!t.is_closed && (
                  <div className="flex items-center gap-2">
                    <input type="time" value={t.open_time} onChange={(e) => updateTiming(t.day_of_week, 'open_time', e.target.value)} className="input-field py-1.5 text-sm w-32" />
                    <span className="text-neutral-400 text-sm">to</span>
                    <input type="time" value={t.close_time} onChange={(e) => updateTiming(t.day_of_week, 'close_time', e.target.value)} className="input-field py-1.5 text-sm w-32" />
                  </div>
                )}
                {t.is_closed && <span className="text-sm text-neutral-400 italic">Closed all day</span>}
              </div>
            ))}
          </div>

          <button onClick={handleSaveTimings} disabled={saving} className="btn-primary mt-5 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Timings'}
          </button>
        </div>
      </div>
    </>
  );
}
