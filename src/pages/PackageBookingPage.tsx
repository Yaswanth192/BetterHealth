import { useState } from 'react';
import { Calendar, Clock, User, Phone, MessageSquare, Package, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Clinic, ClinicDoctor, HealthPackage } from '../types';
import { supabase } from '../lib/supabase';
import { PhoneInput } from '../components/ui/PhoneInput';

interface PackageBookingPageProps {
  clinic: Clinic | null;
  doctors: ClinicDoctor[];
  healthPackages: HealthPackage[];
}

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM',
];

export function PackageBookingPage({ clinic, doctors, healthPackages }: PackageBookingPageProps) {
  const [searchParams] = useSearchParams();
  const preselectedPackage = searchParams.get('package') || '';

  const [form, setForm] = useState({
    patient_name: '',
    patient_phone: '',
    package_name: preselectedPackage,
    preferred_date: '',
    preferred_time: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  async function sendWhatsAppNotification() {
    try {
      const recipientNumber = clinic?.whatsapp_number?.replace(/\s/g, '');
      if (!recipientNumber) {
        console.warn('No WhatsApp number configured for clinic');
        return;
      }

      const whatsappMessage = `New Package Booking!\n\nPatient: ${form.patient_name}\nPhone: ${form.patient_phone}\nPackage: ${form.package_name}\nDate: ${form.preferred_date}\nTime: ${form.preferred_time}\nMessage: ${form.message || 'None'}\n\n---\npls confirm in admin`;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ to: recipientNumber, message: whatsappMessage }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('WhatsApp send failed:', data);
      } else {
        console.log('WhatsApp sent:', data);
      }
    } catch (err) {
      console.error('WhatsApp send failed:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clinic) return;
    setLoading(true);

    const { error } = await supabase.from('appointments').insert({
      clinic_id: clinic.id,
      patient_name: form.patient_name,
      patient_phone: form.patient_phone,
      preferred_date: form.preferred_date,
      preferred_time: form.preferred_time,
      message: `Package: ${form.package_name}${form.message ? ` — ${form.message}` : ''}`,
      status: 'pending',
    });

    if (!error) {
      await sendWhatsAppNotification();
      setSubmitted(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
      <div className="container-max px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
            Health Package
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-3">
            Book Your <span className="gradient-text">Health Package</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
            Select your preferred package and schedule your visit at a convenient time.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="card p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
                  <div className="relative w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-3">Package Booked!</h3>
                <p className="text-neutral-500 max-w-md mx-auto mb-6">
                  Your health package booking has been submitted. We'll contact you shortly to confirm.
                </p>
                <button onClick={() => {
                  setSubmitted(false);
                  setForm({ patient_name: '', patient_phone: '', package_name: preselectedPackage, preferred_date: '', preferred_time: '', message: '' });
                }} className="btn-book">
                  Book Another Package
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Patient Info */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={form.patient_name}
                      onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                      placeholder="Your full name"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Phone Number *</label>
                  <PhoneInput
                    value={form.patient_phone}
                    onChange={(phone) => setForm({ ...form, patient_phone: phone })}
                    required
                  />
                </div>

                {/* Package Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Health Package *</label>
                  <div className="relative">
                    <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <select
                      required
                      value={form.package_name}
                      onChange={(e) => setForm({ ...form, package_name: e.target.value })}
                      className="input-field pl-10 appearance-none"
                    >
                      <option value="">Select a package</option>
                      {healthPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.name}>{pkg.name} — ₹{pkg.price.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Preferred Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="date"
                        required
                        min={today}
                        value={form.preferred_date}
                        onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Preferred Time *</label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <select
                        required
                        value={form.preferred_time}
                        onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                        className="input-field pl-10 appearance-none"
                      >
                        <option value="">Select time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Message (optional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Any special requirements or notes..."
                      className="input-field pl-10 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !clinic}
                  className="btn-book w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Booking...
                    </span>
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      Book Package
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
