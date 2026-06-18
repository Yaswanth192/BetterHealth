import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { Clinic, ClinicTiming } from '../../types';
import { supabase } from '../../lib/supabase';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ContactSectionProps {
  clinic: Clinic | null;
  timings: ClinicTiming[];
}

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function ContactSection({ clinic, timings }: ContactSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const sortedTimings = [...timings].sort((a, b) => DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clinic) return;
    setLoading(true);
    setError('');

    const { error: err } = await supabase.from('contact_messages').insert({
      clinic_id: clinic.id,
      ...form,
    });

    if (err) {
      setError('Failed to send message. Please try again.');
    } else {
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }
    setLoading(false);
  }

  return (
    <section id="contact" className="section-padding bg-white dark:bg-neutral-900">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-4">
            Contact Us
          </span>
          <h2 className="section-title">
            Get In{' '}
            <span className="gradient-text">Touch</span>
          </h2>
          <p className="section-subtitle">
            Have questions? We're here to help. Reach out to us anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Info Column */}
          <div className={`space-y-6 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`} style={{ transitionDelay: '200ms' }}>
            <div className="card p-6">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">Contact Information</h3>
              <div className="space-y-4">
                {clinic?.phone && (
                  <a href={`tel:${clinic.phone}`} className="flex items-start gap-3 hover:text-primary-600 transition-colors">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Phone</p>
                      <p className="text-neutral-700 dark:text-neutral-200 font-medium">{clinic.phone}</p>
                    </div>
                  </a>
                )}
                {clinic?.email && (
                  <a href={`mailto:${clinic.email}`} className="flex items-start gap-3 hover:text-primary-600 transition-colors">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Email</p>
                      <p className="text-neutral-700 dark:text-neutral-200 font-medium">{clinic.email}</p>
                    </div>
                  </a>
                )}
                {clinic?.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Address</p>
                      <p className="text-neutral-700 dark:text-neutral-200 font-medium">{clinic.address}<br />{clinic.city}, {clinic.state} {clinic.zip}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {sortedTimings.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Opening Hours</h3>
                </div>
                <div className="space-y-2">
                  {sortedTimings.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-neutral-600 dark:text-neutral-300 font-medium">{t.day_of_week}</span>
                      <span className={t.is_closed ? 'text-red-500' : 'text-neutral-700 dark:text-neutral-200'}>
                        {t.is_closed ? 'Closed' : `${formatTime(t.open_time)} – ${formatTime(t.close_time)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className={`lg:col-span-2 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ transitionDelay: '300ms' }}>
            <div className="card p-8">
              {sent ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Message Sent!</h3>
                  <p className="text-neutral-500 dark:text-neutral-400">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="mt-6 btn-primary">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1.5">Email *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@example.com"
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1.5">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="How can we help?"
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Write your message here..."
                      className="input-field resize-none"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

                  <button type="submit" disabled={loading || !clinic} className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
