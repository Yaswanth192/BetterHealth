import { useState } from 'react';
import { Phone, MapPin, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { Clinic, ClinicTiming } from '../../types';
import { supabase } from '../../lib/supabase';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { PhoneInput } from '../ui/PhoneInput';

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

        {/* Info Cards - Horizontal */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '100ms' }}>
          {/* Phone & Email */}
          <div className="glass rounded-2xl p-6 text-center hover-lift">
            <div className="w-14 h-14 bg-teal-100/80 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wider text-sm">Phone & Email</h3>
            <div className="space-y-2">
              {clinic?.phone && (
                <a href={`tel:${clinic.phone}`} className="block text-neutral-600 dark:text-neutral-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-sm">
                  {clinic.phone}
                </a>
              )}
              {clinic?.email && (
                <a href={`mailto:${clinic.email}`} className="block text-neutral-600 dark:text-neutral-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-sm break-all">
                  {clinic.email}
                </a>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="glass rounded-2xl p-6 text-center hover-lift">
            <div className="w-14 h-14 bg-teal-100/80 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wider text-sm">Address</h3>
            {clinic?.address && (
              <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                {clinic.address}<br />
                {clinic.city}, {clinic.state} {clinic.zip}
              </p>
            )}
          </div>

          {/* Emergency */}
          <div className="glass rounded-2xl p-6 text-center hover-lift">
            <div className="w-14 h-14 bg-red-100/80 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wider text-sm">Emergency</h3>
            {clinic?.whatsapp_number && (
              <a
                href={`https://wa.me/${clinic.whatsapp_number.replace(/\s/g, '')}?text=Hi%2C%20I'd%20like%20to%20know%20more%20about%20your%20clinic`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Opening Hours */}
          <div className={`transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`} style={{ transitionDelay: '200ms' }}>
            {sortedTimings.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-teal-600" />
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
                      <PhoneInput
                        value={form.phone}
                        onChange={(phone) => setForm({ ...form, phone })}
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

        {/* Map Embed */}
        {clinic?.address && (
          <div className={`mt-12 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
            <div className="card overflow-hidden">
              <iframe
                title="Clinic Location"
                width="100%"
                height="350"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${clinic.address}, ${clinic.city}, ${clinic.state} ${clinic.zip}`)}&zoom=15`}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
