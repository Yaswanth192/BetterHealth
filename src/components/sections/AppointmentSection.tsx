import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, CheckCircle, Stethoscope, AlertTriangle } from 'lucide-react';
import { Clinic, ClinicDoctor, ClinicService } from '../../types';
import { supabase } from '../../lib/supabase';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface AppointmentSectionProps {
  clinic: Clinic | null;
  doctors: ClinicDoctor[];
  services: ClinicService[];
}

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM',
];

export function AppointmentSection({ clinic, doctors, services }: AppointmentSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const [form, setForm] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    doctor_id: '',
    service_id: '',
    preferred_date: '',
    preferred_time: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictCount, setConflictCount] = useState(0);
  const [selectedDoctorName, setSelectedDoctorName] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const checkSlotConflict = useCallback(async () => {
    if (!form.doctor_id || !form.preferred_date || !form.preferred_time) return;

    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', form.doctor_id)
      .eq('preferred_date', form.preferred_date)
      .eq('preferred_time', form.preferred_time)
      .in('status', ['pending', 'confirmed']);

    if (count && count >= 5) {
      const doctor = doctors.find(d => d.id === form.doctor_id);
      setSelectedDoctorName(doctor?.name || 'the selected doctor');
      setConflictCount(count);
      setShowConflictDialog(true);
    }
  }, [form.doctor_id, form.preferred_date, form.preferred_time, doctors]);

  useEffect(() => {
    if (form.doctor_id && form.preferred_date && form.preferred_time) {
      checkSlotConflict();
    }
  }, [form.doctor_id, form.preferred_date, form.preferred_time, checkSlotConflict]);

  async function sendDoctorNotification(appointmentData: {
    patient_name: string;
    patient_phone: string;
    preferred_date: string;
    preferred_time: string;
    message: string;
    doctor_id: string;
    service_id: string | null;
  }) {
    try {
      const doctor = appointmentData.doctor_id ? doctors.find(d => d.id === appointmentData.doctor_id) : null;
      const recipientNumber = doctor?.whatsapp_number || clinic?.whatsapp_number;

      if (!recipientNumber) {
        console.warn('No WhatsApp number available (doctor or clinic)');
        return;
      }

      const service = services.find(s => s.id === appointmentData.service_id);
      const serviceTitle = service?.title || 'Not specified';
      const doctorLabel = doctor ? `Dr. ${doctor.name}` : 'Any available doctor';

      const whatsappMessage = `New Appointment Booked!\n\nPatient: ${appointmentData.patient_name}\nPhone: ${appointmentData.patient_phone}\nDoctor: ${doctorLabel}\nDate: ${appointmentData.preferred_date}\nTime: ${appointmentData.preferred_time}\nService: ${serviceTitle}\nMessage: ${appointmentData.message || 'None'}\n\n---\npls confirm appointment in admin`;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: recipientNumber,
          message: whatsappMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('WhatsApp send failed:', data);
      } else {
        console.log('WhatsApp sent:', data);
      }
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clinic) return;
    setLoading(true);
    setError('');

    const payload: Record<string, string | null> = {
      clinic_id: clinic.id,
      patient_name: form.patient_name,
      patient_email: form.patient_email,
      patient_phone: form.patient_phone,
      preferred_date: form.preferred_date,
      preferred_time: form.preferred_time,
      message: form.message,
      status: 'pending',
      doctor_id: form.doctor_id || null,
      service_id: form.service_id || null,
    };

    const { error: err } = await supabase.from('appointments').insert(payload);

    if (err) {
      setError('Failed to book appointment. Please try again or call us directly.');
    } else {
      sendDoctorNotification({
        patient_name: form.patient_name,
        patient_phone: form.patient_phone,
        preferred_date: form.preferred_date,
        preferred_time: form.preferred_time,
        message: form.message,
        doctor_id: form.doctor_id,
        service_id: form.service_id || null,
      });
      setSubmitted(true);
      setForm({ patient_name: '', patient_email: '', patient_phone: '', doctor_id: '', service_id: '', preferred_date: '', preferred_time: '', message: '' });
    }
    setLoading(false);
  }

  return (
    <section id="appointment" className="section-padding bg-gradient-to-br from-primary-50 via-white to-teal-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
            Book Appointment
          </span>
          <h2 className="section-title">
            Schedule Your{' '}
            <span className="gradient-text">Visit</span>
          </h2>
          <p className="section-subtitle">
            Fill out the form below and our team will confirm your appointment within 24 hours.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className={`card p-8 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
            {submitted ? (
              <div className="text-center py-12">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
                  <div className="relative w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-3">Appointment Requested!</h3>
                <p className="text-neutral-500 max-w-md mx-auto mb-8">
                  Thank you! Your appointment request has been submitted. We'll contact you within 24 hours to confirm your booking.
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary-50 border border-primary-200 rounded-xl text-primary-700 text-sm font-medium mb-6">
                  <Clock className="w-4 h-4" />
                  Confirmation within 24 hours
                </div>
                <div className="mt-2">
                   <button onClick={() => setSubmitted(false)} className="btn-book">Book Another Appointment</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-5">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 text-xl">
                      <User className="w-5 h-5 text-primary-600" />
                      Personal Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
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
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                        <input
                          type="email"
                          required
                          value={form.patient_email}
                          onChange={(e) => setForm({ ...form, patient_email: e.target.value })}
                          placeholder="your@email.com"
                          className="input-field pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                        <input
                          type="tel"
                          required
                          value={form.patient_phone}
                          onChange={(e) => setForm({ ...form, patient_phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="input-field pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Message / Symptoms</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                        <textarea
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder="Briefly describe your symptoms or reason for visit..."
                          className="input-field pl-10 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="space-y-5">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 text-xl">
                      <Calendar className="w-5 h-5 text-primary-600" />
                      Appointment Details
                    </h3>

                    {doctors.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Preferred Doctor</label>
                        <div className="relative">
                          <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                          <select
                            value={form.doctor_id}
                            onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                            className="input-field pl-10 appearance-none"
                          >
                            <option value="">Any available doctor</option>
                            {doctors.map((d) => (
                              <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {services.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Service / Department</label>
                        <select
                          value={form.service_id}
                          onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                          className="input-field appearance-none"
                        >
                          <option value="">Select a service</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Preferred Date *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
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
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Preferred Time *</label>
                      <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setForm({ ...form, preferred_time: slot })}
                            className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                              form.preferred_time === slot
                                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-primary-400 hover:text-primary-700'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      {!form.preferred_time && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Select a time slot</p>}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !clinic || !form.preferred_time}
                  className="btn-book w-full justify-center mt-8 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Request Appointment
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-3">
                  By submitting, you agree to be contacted by our team to confirm your appointment.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Conflict Dialog */}
      {showConflictDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Busy Time Slot</h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 mb-1">
              This time slot might take some time.
            </p>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
              {conflictCount}+ patients already booked for <strong>Dr. {selectedDoctorName}</strong> at <strong>{form.preferred_time}</strong> on <strong>{form.preferred_date}</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConflictDialog(false)}
                className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-medium rounded-xl transition-colors text-sm"
              >
                Choose Another Slot
              </button>
              <button
                onClick={() => {
                  setShowConflictDialog(false);
                  const formEl = document.querySelector('#appointment form') as HTMLFormElement;
                  if (formEl) formEl.requestSubmit();
                }}
                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors text-sm"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
