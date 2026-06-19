import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, Calendar, X } from 'lucide-react';
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
  const [cardState, setCardState] = useState<'attached' | 'falling' | 'detached' | 'fading'>('attached');
  const [fallOrigin, setFallOrigin] = useState({ top: 0, right: 0, width: 0 });
  const [fallDistance, setFallDistance] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasFallen = useRef(false);

  const stats = [
    { value: '15+', label: 'Years' },
    { value: '4.8★', label: 'Rating' },
    { value: '50,000+', label: 'Patients' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (hasFallen.current || cardState !== 'attached') return;
      if (window.scrollY > 80 && cardRef.current) {
        hasFallen.current = true;
        const rect = cardRef.current.getBoundingClientRect();
        const originTop = rect.top;
        const originRight = window.innerWidth - rect.right;
        const cardWidth = rect.width;
        const distance = window.innerHeight - originTop - rect.height - 24;
        setFallOrigin({ top: originTop, right: originRight, width: cardWidth });
        setFallDistance(distance);
        setCardState('falling');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [cardState]);

  const handleFallEnd = useCallback(() => {
    setCardState('detached');
  }, []);

  const handleDismiss = useCallback(() => {
    setCardState('fading');
    setTimeout(() => {
      setCardState('attached');
      setQuickSubmitted(false);
      setQuickForm({ name: '', phone: '' });
    }, 380);
  }, []);

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

  const formProps = {
    quickForm,
    setQuickForm,
    quickLoading,
    quickSubmitted,
    setQuickSubmitted,
    handleQuickBook,
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16">
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
            <h1 className="text-5xl sm:text-5xl lg:text-6xl font-bold font-heading text-white leading-[1.1] mb-6 animate-slide-up">
              Caring for You &{' '}
              <span className="bg-gradient-to-r from-primary-300 to-teal-300 bg-clip-text text-transparent">
                Your Family
              </span>
            </h1>

            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-xl animate-slide-up animate-delay-100 font-light">
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
              <Link to={appointmentPath} className="btn-book text-base px-8 py-4 shadow-glow">
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

          {/* Right - Feature Image + Attached Card */}
          <div className="animate-slide-up animate-delay-400">
            <div className="relative max-w-lg ml-auto">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Clinic Building"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 via-transparent to-transparent" />
              </div>

              {/* Card - attached to image (visible when attached OR fading back) */}
              {(cardState === 'attached' || cardState === 'fading') && (
                <div
                  ref={cardRef}
                  className={`absolute -bottom-5 -right-3 left-6 sm:left-10 bg-white rounded-2xl shadow-2xl p-4 dark:bg-neutral-900 dark:shadow-neutral-950/50 ${
                    cardState === 'fading' ? 'animate-fade-out-card' : ''
                  }`}
                >
                  <QuickAppointmentForm {...formProps} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card - falling from origin straight down */}
      {cardState === 'falling' && (
        <div
          className="fixed z-50 animate-pluck-fall"
          style={{
            top: `${fallOrigin.top}px`,
            right: `${fallOrigin.right}px`,
            width: `${fallOrigin.width}px`,
            '--fall-distance': `${fallDistance}px`,
          } as React.CSSProperties}
          onAnimationEnd={handleFallEnd}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-4 dark:bg-neutral-900 dark:shadow-neutral-950/50">
            <QuickAppointmentForm {...formProps} />
          </div>
        </div>
      )}

      {/* Card - detached, fixed at bottom of screen (same X axis) */}
      {cardState === 'detached' && (
        <div
          className="fixed bottom-6 z-50"
          style={{ right: `${fallOrigin.right}px`, width: `${fallOrigin.width}px` }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-4 dark:bg-neutral-900 dark:shadow-neutral-950/50">
            <QuickAppointmentForm {...formProps} showDismiss onDismiss={handleDismiss} />
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full animate-float" />
        </div>
      </div>
    </section>
  );
}

/* ---------- Compact Quick Appointment Form ---------- */

function QuickAppointmentForm({
  quickForm,
  setQuickForm,
  quickLoading,
  quickSubmitted,
  setQuickSubmitted,
  handleQuickBook,
  showDismiss,
  onDismiss,
}: {
  quickForm: { name: string; phone: string };
  setQuickForm: (f: { name: string; phone: string }) => void;
  quickLoading: boolean;
  quickSubmitted: boolean;
  setQuickSubmitted: (v: boolean) => void;
  handleQuickBook: (e: React.FormEvent) => void;
  showDismiss?: boolean;
  onDismiss?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2 relative">
        <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">Quick Appointment</h3>
        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute -top-1 -right-1 w-6 h-6 bg-neutral-200 dark:bg-neutral-700 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {quickSubmitted ? (
        <div className="text-center py-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 dark:bg-emerald-900/30">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Request Submitted!</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">We'll call you shortly.</p>
          <button onClick={() => setQuickSubmitted(false)} className="mt-3 text-xs text-primary-600 font-medium hover:underline dark:text-primary-400">
            Book Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleQuickBook}>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              required
              placeholder="Your Name"
              value={quickForm.name}
              onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
              className="input-field flex-1 py-2 px-3 text-sm"
            />
            <input
              type="tel"
              required
              placeholder="Phone"
              value={quickForm.phone}
              onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
              className="input-field flex-1 py-2 px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={quickLoading}
            className="btn-book w-full py-2 text-sm disabled:opacity-50"
          >
            {quickLoading ? 'Booking...' : 'Book Now'}
          </button>
        </form>
      )}
    </>
  );
}
