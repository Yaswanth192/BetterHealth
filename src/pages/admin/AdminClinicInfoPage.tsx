import { useEffect, useState } from 'react';
import { Save, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

interface ClinicInfoForm {
  years_of_service: string;
  patients_treated: string;
  google_rating: string;
  research_papers: string;
  successful_surgeries: string;
  awards_won: string;
  combined_experience: string;
  hero_headline: string;
  hero_subtitle: string;
  cta_headline: string;
  cta_description: string;
  emergency_title: string;
  footer_description: string;
  footer_tagline: string;
  opening_hours_display: string;
  process_steps: Array<{ title: string; description: string }>;
}

export function AdminClinicInfoPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ClinicInfoForm>({
    years_of_service: '0',
    patients_treated: '0',
    google_rating: '0',
    research_papers: '0',
    successful_surgeries: '0',
    awards_won: '0',
    combined_experience: '',
    hero_headline: '',
    hero_subtitle: '',
    cta_headline: '',
    cta_description: '',
    emergency_title: '',
    footer_description: '',
    footer_tagline: '',
    opening_hours_display: '',
    process_steps: [],
  });

  useEffect(() => {
    if (clinicId) fetchClinic();
  }, [clinicId]);

  async function fetchClinic() {
    setLoading(true);
    const { data } = await supabase.from('clinics').select('*').eq('id', clinicId!).maybeSingle();
    if (data) {
      setForm({
        years_of_service: String(data.years_of_service ?? 0),
        patients_treated: data.patients_treated ?? '0',
        google_rating: String(data.google_rating ?? 0),
        research_papers: data.research_papers ?? '0',
        successful_surgeries: data.successful_surgeries ?? '0',
        awards_won: String(data.awards_won ?? 0),
        combined_experience: data.combined_experience ?? '',
        hero_headline: data.hero_headline ?? 'Caring for You & Your Family',
        hero_subtitle: data.hero_subtitle ?? 'Multi-specialty healthcare with a personal touch.',
        cta_headline: data.cta_headline ?? 'Ready to Take the First Step?',
        cta_description: data.cta_description ?? 'Book a consultation with our expert doctors today. Walk-ins welcome.',
        emergency_title: data.emergency_title ?? '24/7 Emergency Services Available',
        footer_description: data.footer_description ?? data.description ?? '',
        footer_tagline: data.footer_tagline ?? 'Designed for better healthcare delivery',
        opening_hours_display: data.opening_hours_display ?? '9 AM - 10 PM',
        process_steps: data.process_steps ?? [
          { title: 'Book Online or Call', description: 'Schedule at your convenience via phone, WhatsApp, or our online portal.' },
          { title: 'Visit the Clinic', description: 'Arrive 10 minutes early for registration. No long waits guaranteed.' },
          { title: 'Diagnosis & Treatment', description: 'Expert consultation, diagnostics, and personalized treatment plan.' },
          { title: 'Follow-Up Care', description: 'Ongoing monitoring, medication management, and recovery support.' },
        ],
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase.from('clinics').update({
        years_of_service: parseInt(form.years_of_service) || 0,
        patients_treated: form.patients_treated,
        google_rating: parseFloat(form.google_rating) || 0,
        research_papers: form.research_papers,
        successful_surgeries: form.successful_surgeries,
        awards_won: parseInt(form.awards_won) || 0,
        combined_experience: form.combined_experience,
        hero_headline: form.hero_headline,
        hero_subtitle: form.hero_subtitle,
        cta_headline: form.cta_headline,
        cta_description: form.cta_description,
        emergency_title: form.emergency_title,
        footer_description: form.footer_description,
        footer_tagline: form.footer_tagline,
        opening_hours_display: form.opening_hours_display,
        process_steps: form.process_steps,
      }).eq('id', clinicId!);
      if (error) throw error;
      addToast('success', 'Clinic info updated');
      window.dispatchEvent(new Event('clinic-updated'));
    } catch {
      addToast('error', 'Failed to update clinic info');
    }
    setSaving(false);
  }

  function updateProcessStep(index: number, field: 'title' | 'description', value: string) {
    const steps = [...form.process_steps];
    steps[index] = { ...steps[index], [field]: value };
    setForm({ ...form, process_steps: steps });
  }

  function addProcessStep() {
    setForm({ ...form, process_steps: [...form.process_steps, { title: '', description: '' }] });
  }

  function removeProcessStep(index: number) {
    setForm({ ...form, process_steps: form.process_steps.filter((_, i) => i !== index) });
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Clinic Info</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Manage stats, content, and site-wide text</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Hero Section */}
        <Section title="Hero Section" description="Headline and subtitle shown on the homepage hero">
          <Field label="Hero Headline" value={form.hero_headline} onChange={(v) => setForm({ ...form, hero_headline: v })} placeholder="Caring for You & Your Family" />
          <Field label="Hero Subtitle" value={form.hero_subtitle} onChange={(v) => setForm({ ...form, hero_subtitle: v })} textarea placeholder="Multi-specialty healthcare with a personal touch." />
        </Section>

        {/* Stats */}
        <Section title="Stats & Numbers" description="Numbers shown across the site (hero, about, doctors)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Years of Service" value={form.years_of_service} onChange={(v) => setForm({ ...form, years_of_service: v })} type="number" />
            <Field label="Patients Treated" value={form.patients_treated} onChange={(v) => setForm({ ...form, patients_treated: v })} placeholder="50,000+" />
            <Field label="Google Rating" value={form.google_rating} onChange={(v) => setForm({ ...form, google_rating: v })} type="number" step="0.1" />
            <Field label="Research Papers" value={form.research_papers} onChange={(v) => setForm({ ...form, research_papers: v })} placeholder="45+" />
            <Field label="Successful Surgeries" value={form.successful_surgeries} onChange={(v) => setForm({ ...form, successful_surgeries: v })} placeholder="8,000+" />
            <Field label="Awards Won" value={form.awards_won} onChange={(v) => setForm({ ...form, awards_won: v })} type="number" />
          </div>
          <Field label="Combined Experience" value={form.combined_experience} onChange={(v) => setForm({ ...form, combined_experience: v })} placeholder="55+ Years" />
        </Section>

        {/* CTA Section */}
        <Section title="Call to Action" description="CTA section at the bottom of the homepage">
          <Field label="CTA Headline" value={form.cta_headline} onChange={(v) => setForm({ ...form, cta_headline: v })} placeholder="Ready to Take the First Step?" />
          <Field label="CTA Description" value={form.cta_description} onChange={(v) => setForm({ ...form, cta_description: v })} textarea placeholder="Book a consultation with our expert doctors today." />
        </Section>

        {/* Emergency Banner */}
        <Section title="Emergency Banner" description="Text shown in the emergency call banner">
          <Field label="Emergency Title" value={form.emergency_title} onChange={(v) => setForm({ ...form, emergency_title: v })} placeholder="24/7 Emergency Services Available" />
        </Section>

        {/* Footer */}
        <Section title="Footer" description="Footer description, tagline, and hours">
          <Field label="Footer Description" value={form.footer_description} onChange={(v) => setForm({ ...form, footer_description: v })} textarea placeholder="Serving families since 2015. Providing compassionate, evidence-based care." />
          <Field label="Footer Tagline" value={form.footer_tagline} onChange={(v) => setForm({ ...form, footer_tagline: v })} placeholder="Designed for better healthcare delivery" />
          <Field label="Opening Hours Display" value={form.opening_hours_display} onChange={(v) => setForm({ ...form, opening_hours_display: v })} placeholder="9 AM - 10 PM" />
        </Section>

        {/* Process Steps */}
        <Section title="How It Works" description="Process steps shown in the services section">
          <div className="space-y-3">
            {form.process_steps.map((step, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm flex-shrink-0 mt-1">
                  {i + 1}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input type="text" value={step.title} onChange={(e) => updateProcessStep(i, 'title', e.target.value)} className="input-field text-sm" placeholder="Step title" />
                  <input type="text" value={step.description} onChange={(e) => updateProcessStep(i, 'description', e.target.value)} className="input-field text-sm" placeholder="Step description" />
                </div>
                <button onClick={() => removeProcessStep(i)} className="p-1.5 text-red-400 hover:text-red-600 mt-1">✕</button>
              </div>
            ))}
          </div>
          <button onClick={addProcessStep} className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2">+ Add Step</button>
        </Section>

        {/* Info Box */}
        <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Phone & Social Links</p>
              <p>Phone, WhatsApp, and social media links are managed in the <strong>Settings</strong> page under Contact Information and Social Links.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">{description}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, textarea, step }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">{label}</label>
      {textarea ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className="input-field resize-none" placeholder={placeholder} />
      ) : (
        <input type={type} step={step} value={value} onChange={(e) => onChange(e.target.value)} className="input-field" placeholder={placeholder} />
      )}
    </div>
  );
}
