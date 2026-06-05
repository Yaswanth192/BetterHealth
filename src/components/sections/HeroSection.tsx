import { ArrowRight, ShieldCheck, Award, Clock } from 'lucide-react';
import { Clinic } from '../../types';

interface HeroProps {
  clinic: Clinic | null;
}

const stats = [
  { value: '15,000+', label: 'Patients Served' },
  { value: '50+', label: 'Specialists' },
  { value: '20+', label: 'Years Experience' },
  { value: '98%', label: 'Patient Satisfaction' },
];

const badges = [
  { icon: ShieldCheck, text: 'Trusted Care' },
  { icon: Award, text: 'Award Winning' },
  { icon: Clock, text: '24/7 Support' },
];

export function HeroSection({ clinic }: HeroProps) {
  function scrollToAppointment() {
    document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' });
  }

  function scrollToServices() {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
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

      <div className="relative container-max px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {clinic?.name || 'MediCare Clinic'} — Excellence in Healthcare
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 animate-slide-up">
            Your Health,{' '}
            <span className="bg-gradient-to-r from-primary-300 to-teal-300 bg-clip-text text-transparent">
              Our Priority
            </span>
          </h1>

          <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-xl animate-slide-up animate-delay-100">
            {clinic?.tagline || 'Experience compassionate, world-class medical care with our team of expert specialists dedicated to your well-being.'}
          </p>

          {/* Badge row */}
          <div className="flex flex-wrap gap-3 mb-10 animate-slide-up animate-delay-200">
            {badges.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm">
                <Icon className="w-3.5 h-3.5 text-teal-300" />
                {text}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 animate-slide-up animate-delay-300">
            <button onClick={scrollToAppointment} className="btn-primary text-base px-8 py-4 shadow-glow">
              Book Appointment
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={scrollToServices} className="btn-outline text-base px-8 py-4">
              Our Services
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl animate-slide-up animate-delay-400">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5 text-center border-white/20">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
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
