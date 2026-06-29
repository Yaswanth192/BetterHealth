import { useEffect, useState } from 'react';
import { Save, Building2, Phone, Clock, Palette } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadPublicFile } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { Clinic, ClinicTiming } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import { applyClinicColors } from '../../hooks/useClinicData';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const COLOR_PRESETS = [
  { name: 'Sky Blue', primary: '#0ea5e9', secondary: '#0284c7' },
  { name: 'Emerald', primary: '#10b981', secondary: '#059669' },
  { name: 'Violet', primary: '#8b5cf6', secondary: '#7c3aed' },
  { name: 'Rose', primary: '#f43f5e', secondary: '#e11d48' },
  { name: 'Amber', primary: '#f59e0b', secondary: '#d97706' },
  { name: 'Indigo', primary: '#6366f1', secondary: '#4f46e5' },
  { name: 'Teal', primary: '#14b8a6', secondary: '#0d9488' },
  { name: 'Orange', primary: '#f97316', secondary: '#ea580c' },
];

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

  useEffect(() => {
    if (clinic?.primary_color) {
      applyClinicColors(clinic.primary_color, clinic.secondary_color, clinic.book_button_color);
    }
  }, [clinic?.primary_color, clinic?.secondary_color, clinic?.book_button_color]);

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

      const { data: updatedRows, error } = await supabase.from('clinics').update({
        name: clinic.name, tagline: clinic.tagline, description: clinic.description,
        logo_url: logoUrl, phone: clinic.phone, email: clinic.email,
        address: clinic.address, city: clinic.city, state: clinic.state,
        zip: clinic.zip, website: clinic.website,
        emergency_phone: clinic.emergency_phone, whatsapp_number: clinic.whatsapp_number,
        founded_year: clinic.founded_year, google_maps_url: clinic.google_maps_url,
        facebook_url: clinic.facebook_url, instagram_url: clinic.instagram_url,
        youtube_url: clinic.youtube_url, twitter_url: clinic.twitter_url,
        primary_color: clinic.primary_color, secondary_color: clinic.secondary_color,
        book_button_color: clinic.book_button_color,
        updated_at: new Date().toISOString(),
      }).eq('id', clinicId!).select();

      if (error) throw error;
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error('Update blocked by RLS — check Supabase policies for the clinics table. Your admin role may not have UPDATE permission.');
      }

      setClinic(updatedRows[0]);
      addToast('success', 'Clinic information saved');
      setLogoFile(null);
      try { window.dispatchEvent(new CustomEvent('clinic-updated', { detail: { id: clinicId } })); } catch {}
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
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Clinic Settings</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Manage your clinic's public information</p>
        </div>

        {/* Clinic Info */}
        <form onSubmit={handleSaveClinic} className="card dark:bg-neutral-800 p-6 space-y-5">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Clinic Name *</label>
              <input type="text" required value={clinic.name} onChange={(e) => setClinic({ ...clinic, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Tagline</label>
              <input type="text" value={clinic.tagline} onChange={(e) => setClinic({ ...clinic, tagline: e.target.value })} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Description</label>
            <textarea rows={3} value={clinic.description} onChange={(e) => setClinic({ ...clinic, description: e.target.value })} className="input-field resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Upload Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-700 rounded-md overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
                ) : clinic.logo_url ? (
                  <img src={clinic.logo_url} alt="logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-neutral-400 dark:text-neutral-500 text-xs">No logo</div>
                )}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} className="input-field" />
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Uploads to SellHealthStorage/clinics/{clinicId}/logo and saves the public URL into logo_url.</p>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2 pt-2">
            <Phone className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Phone</label>
              <PhoneInput value={clinic.phone ?? ''} onChange={(phone) => setClinic({ ...clinic, phone })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Email</label>
              <input type="email" value={clinic.email} onChange={(e) => setClinic({ ...clinic, email: e.target.value })} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Emergency Phone</label>
              <PhoneInput value={clinic.emergency_phone ?? ''} onChange={(phone) => setClinic({ ...clinic, emergency_phone: phone })} placeholder="24/7 emergency line" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">WhatsApp Number</label>
              <PhoneInput value={clinic.whatsapp_number ?? ''} onChange={(phone) => setClinic({ ...clinic, whatsapp_number: phone })} />
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Founded Year</label>
            <input type="number" min="1900" max={new Date().getFullYear()} value={clinic.founded_year ?? new Date().getFullYear()} onChange={(e) => setClinic({ ...clinic, founded_year: parseInt(e.target.value) || new Date().getFullYear() })} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Address</label>
            <input type="text" value={clinic.address} onChange={(e) => setClinic({ ...clinic, address: e.target.value })} className="input-field" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">City</label>
              <input type="text" value={clinic.city} onChange={(e) => setClinic({ ...clinic, city: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">State</label>
              <input type="text" value={clinic.state} onChange={(e) => setClinic({ ...clinic, state: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">ZIP</label>
              <input type="text" value={clinic.zip} onChange={(e) => setClinic({ ...clinic, zip: e.target.value })} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Google Maps URL</label>
            <input type="url" value={clinic.google_maps_url ?? ''} onChange={(e) => setClinic({ ...clinic, google_maps_url: e.target.value })} className="input-field" placeholder="https://maps.google.com/..." />
          </div>

          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2 pt-2">
            Social Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Facebook URL</label>
              <input type="url" value={clinic.facebook_url ?? ''} onChange={(e) => setClinic({ ...clinic, facebook_url: e.target.value })} className="input-field" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Instagram URL</label>
              <input type="url" value={clinic.instagram_url ?? ''} onChange={(e) => setClinic({ ...clinic, instagram_url: e.target.value })} className="input-field" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">YouTube URL</label>
              <input type="url" value={clinic.youtube_url ?? ''} onChange={(e) => setClinic({ ...clinic, youtube_url: e.target.value })} className="input-field" placeholder="https://youtube.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Twitter/X URL</label>
              <input type="url" value={clinic.twitter_url ?? ''} onChange={(e) => setClinic({ ...clinic, twitter_url: e.target.value })} className="input-field" placeholder="https://x.com/..." />
            </div>
          </div>

          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2 pt-2">
            <Palette className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Website Theme Colors
          </h3>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-3">Preset Palettes</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setClinic({ ...clinic, primary_color: preset.primary, secondary_color: preset.secondary });
                    applyClinicColors(preset.primary, preset.secondary, clinic.book_button_color);
                  }}
                  className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                    clinic.primary_color === preset.primary
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex gap-0.5">
                    <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: preset.primary }} />
                    <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: preset.secondary }} />
                  </div>
                  <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 leading-tight text-center">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={clinic.primary_color ?? '#0ea5e9'}
                  onChange={(e) => {
                    setClinic({ ...clinic, primary_color: e.target.value });
                    applyClinicColors(e.target.value, clinic.secondary_color, clinic.book_button_color);
                  }}
                  className="w-12 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={clinic.primary_color ?? '#0ea5e9'}
                  onChange={(e) => {
                    setClinic({ ...clinic, primary_color: e.target.value });
                    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) applyClinicColors(e.target.value, clinic.secondary_color, clinic.book_button_color);
                  }}
                  className="input-field flex-1"
                  placeholder="#0ea5e9"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={clinic.secondary_color ?? '#0284c7'}
                  onChange={(e) => {
                    setClinic({ ...clinic, secondary_color: e.target.value });
                    applyClinicColors(clinic.primary_color, e.target.value, clinic.book_button_color);
                  }}
                  className="w-12 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={clinic.secondary_color ?? '#0284c7'}
                  onChange={(e) => {
                    setClinic({ ...clinic, secondary_color: e.target.value });
                    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) applyClinicColors(clinic.primary_color, e.target.value, clinic.book_button_color);
                  }}
                  className="input-field flex-1"
                  placeholder="#0284c7"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Changes preview live on the website. Click Save to persist.</p>

          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2 pt-2">
            Book Appointment Button
          </h3>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Button Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={clinic.book_button_color ?? '#f97316'}
                onChange={(e) => setClinic({ ...clinic, book_button_color: e.target.value })}
                className="w-12 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer"
              />
              <input
                type="text"
                value={clinic.book_button_color ?? '#f97316'}
                onChange={(e) => setClinic({ ...clinic, book_button_color: e.target.value })}
                className="input-field flex-1"
                placeholder="#f97316"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Preview:</span>
                <span
                  className="px-4 py-2 rounded-xl text-white font-semibold text-sm"
                  style={{ backgroundColor: clinic.book_button_color ?? '#f97316' }}
                >
                  Book Appointment
                </span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Timings */}
        <div className="card dark:bg-neutral-800 p-6">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Opening Hours
          </h2>

          <div className="space-y-3">
            {timings.map((t) => (
              <div key={t.day_of_week} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${t.is_closed ? 'bg-neutral-50 dark:bg-neutral-700' : 'bg-primary-50/30 dark:bg-primary-900/10'}`}>
                <div className="w-24 flex-shrink-0">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 capitalize">{t.day_of_week}</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    id={`closed-${t.day_of_week}`}
                    checked={t.is_closed}
                    onChange={(e) => updateTiming(t.day_of_week, 'is_closed', e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <label htmlFor={`closed-${t.day_of_week}`} className="text-xs text-neutral-500 dark:text-neutral-400">Closed</label>
                </div>
                {!t.is_closed && (
                  <div className="flex items-center gap-2">
                    <input type="time" value={t.open_time} onChange={(e) => updateTiming(t.day_of_week, 'open_time', e.target.value)} className="input-field py-1.5 text-sm w-32" />
                    <span className="text-neutral-400 dark:text-neutral-500 text-sm">to</span>
                    <input type="time" value={t.close_time} onChange={(e) => updateTiming(t.day_of_week, 'close_time', e.target.value)} className="input-field py-1.5 text-sm w-32" />
                  </div>
                )}
                {t.is_closed && <span className="text-sm text-neutral-400 dark:text-neutral-500 italic">Closed all day</span>}
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
