import { useState } from 'react';
import { Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Clinic, ClinicDoctor, ClinicService } from '../../types';
import { supabase } from '../../lib/supabase';

interface HeroProps {
  clinic: Clinic | null;
  servicesPath?: string;
  appointmentPath: string;
  doctors?: ClinicDoctor[];
  services?: ClinicService[];
}

export function HeroSection({ clinic, appointmentPath }: HeroProps) {
  const [quickForm, setQuickForm] = useState({ name: '', phone: '' });
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickSubmitted, setQuickSubmitted] = useState(false);

  const stats = [
    { value: '15+', label: 'Years' },
    { value: '4.8★', label: 'Rating' },
    { value: '50,000+', label: 'Patients' },
  ];

  async function handleQuickBook(e: React.FormEvent) {
    e.preventDefault();
    if (!clinic) return;
    setQuickLoading(true);
    await supabase.from('appointments').insert({
      clinic_id: clinic.id,
      patient_name: quickForm.name,
      patient_phone: quickForm.phone,
      preferred_date: new Date().toISOString().split('T')[0],
      preferred_time: '10:00 AM',
      status: 'pending',
    });
    setQuickLoading(false);
    setQuickSubmitted(true);
    setQuickForm({ name: '', phone: '' });
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Clinic"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-900/40" />
      </div>

      {/* Decorative orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow animate-delay-300" />

      <div className="relative container-max px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 animate-slide-up">
              Caring for You &{' '}
              <span className="bg-gradient-to-r from-primary-300 to-teal-300 bg-clip-text text-transparent">
                Your Family
              </span>
            </h1>

            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-xl animate-slide-up animate-delay-100">
              Multi-specialty healthcare with a personal touch. 15+ years of trusted medical care in the heart of the community.
            </p>

            {/* Stats badges */}
            <div className="flex flex-wrap gap-3 mb-8 animate-slide-up animate-delay-200">
              {stats.map(({ value, label }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm">
                  <span className="font-bold">{value}</span>
                  <span className="text-white/60">{label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-slide-up animate-delay-300">
              <Link to={appointmentPath} className="btn-primary text-base px-8 py-4 bg-amber-600 hover:bg-amber-700 shadow-glow">
                <Calendar className="w-5 h-5" />
                Book Appointment
              </Link>
              {clinic?.phone && (
                <a href={`tel:${clinic.phone}`} className="btn-outline text-base px-8 py-4">
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              )}
            </div>
          </div>

          {/* Right - Quick Appointment Form */}
          <div className="animate-slide-up animate-delay-400">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md ml-auto">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-neutral-900">Quick Appointment</h3>
              </div>

              {quickSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-neutral-900">Request Submitted!</p>
                  <p className="text-sm text-neutral-500 mt-1">We'll call you shortly to confirm.</p>
                  <button onClick={() => setQuickSubmitted(false)} className="mt-4 text-sm text-primary-600 font-medium hover:underline">
                    Book Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuickBook} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={quickForm.name}
                    onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={quickForm.phone}
                    onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                    className="input-field"
                  />
                  <button
                    type="submit"
                    disabled={quickLoading}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {quickLoading ? 'Booking...' : 'Book Now'}
                  </button>
                </form>
              )}

              <div className="mt-4 pt-4 border-t border-neutral-100">
                <img
                  src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Clinic"
                  className="w-full h-32 object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full animate-float" />
        </div>
      </div>
    </section>
  );
}
