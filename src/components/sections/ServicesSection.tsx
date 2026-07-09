import { useState } from 'react';
import { Stethoscope, Heart, Brain, Bone, Eye, Baby, Microscope, Pill, Check, ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClinicService, HealthPackage } from '../../types';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ServicesSectionProps {
  services: ClinicService[];
  appointmentPath: string;
  healthPackages?: HealthPackage[];
  showHealthPackages?: boolean;
  showFees?: boolean;
  clinic?: import('../../types').Clinic | null;
  clinicSlug?: string;
}

const iconMap: Record<string, React.ElementType> = {
  stethoscope: Stethoscope,
  heart: Heart,
  brain: Brain,
  bone: Bone,
  eye: Eye,
  baby: Baby,
  microscope: Microscope,
  pill: Pill,
};

const fallbackServices = [
  { title: 'General Medicine', description: 'Comprehensive primary care for all ages — fever, infections, chronic disease management, and preventive health.', features: ['Fever & Infections', 'Diabetes Management', 'Hypertension Care', 'Preventive Health'], consultation_fee: 500, follow_up_fee: 300 },
  { title: 'Dental Care', description: 'Complete dental solutions from routine cleanings to advanced cosmetic dentistry and orthodontics.', features: ['Teeth Cleaning & Polishing', 'Root Canal Treatment', 'Dental Implants', 'Orthodontics'], consultation_fee: 600, follow_up_fee: 400 },
  { title: 'Dermatology', description: 'Expert skin, hair, and nail treatments including acne, eczema, laser therapy, and cosmetic procedures.', features: ['Acne & Scar Treatment', 'Laser Hair Removal', 'Chemical Peels', 'Skin Allergies'], consultation_fee: 800, follow_up_fee: 500 },
  { title: 'Ophthalmology', description: 'Advanced eye care with LASIK, cataract surgery, glaucoma management, and routine vision checks.', features: ['LASIK Surgery', 'Cataract Surgery', 'Glaucoma Treatment', 'Vision Testing'], consultation_fee: 600, follow_up_fee: 400 },
  { title: 'Orthopedics', description: 'Joint, bone, and spine care — from sports injuries to joint replacements and physiotherapy.', features: ['Joint Replacement', 'Sports Injury', 'Fracture Treatment', 'Physiotherapy'], consultation_fee: 700, follow_up_fee: 400 },
  { title: 'Pediatrics', description: 'Gentle, specialized care for infants, children, and adolescents including vaccinations and development monitoring.', features: ['Vaccinations', 'Growth Monitoring', 'Child Nutrition', 'Development Assessment'], consultation_fee: 500, follow_up_fee: 300 },
];

const processSteps = [
  { num: 1, title: 'Book Online or Call', description: 'Schedule at your convenience via phone, WhatsApp, or our online portal.' },
  { num: 2, title: 'Visit the Clinic', description: 'Arrive 10 minutes early for registration. No long waits guaranteed.' },
  { num: 3, title: 'Diagnosis & Treatment', description: 'Expert consultation, diagnostics, and personalized treatment plan.' },
  { num: 4, title: 'Follow-Up Care', description: 'Ongoing monitoring, medication management, and recovery support.' },
];

const healthPackages = [
  {
    name: 'Basic Health Check-up',
    price: '1,999',
    features: ['Complete Blood Count (CBC)', 'Blood Sugar (Fasting & PP)', 'Lipid Profile', 'Thyroid Profile', 'Urine Routine', 'BP & BMI Check'],
    popular: false,
  },
  {
    name: 'Comprehensive Health Check-up',
    price: '4,999',
    features: ['All Basic Tests +', 'Liver Function Test', 'Kidney Function Test', 'Vitamin D & B12', 'ECG', 'Chest X-Ray', 'Doctor Consultation'],
    popular: true,
  },
  {
    name: 'Executive Health Check-up',
    price: '9,999',
    features: ['All Comprehensive Tests +', 'Cardiac Stress Test (TMT)', 'Abdominal Ultrasound', 'PSA / Pap Smear', 'Dental Check-up', 'Eye Check-up', 'Dietitian Consultation'],
    popular: false,
  },
];

export function ServicesSection({ services, appointmentPath, healthPackages: dbPackages = [], showHealthPackages = true, showFees = true, clinic, clinicSlug }: ServicesSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const [activeFilter, setActiveFilter] = useState('All');
  const displayServices = services.length > 0
    ? services.map(s => ({ ...s, features: s.features ?? [] as string[] }))
    : fallbackServices as unknown as (ClinicService & { features: string[] })[];

  const feeServices = services.length > 0
    ? services.filter(s => s.consultation_fee > 0)
    : fallbackServices;

  const displayPackages = !showHealthPackages
    ? []
    : dbPackages.length > 0
      ? dbPackages.map(p => ({
          name: p.name,
          price: p.price.toLocaleString(),
          features: p.features ?? [],
          popular: p.is_popular,
        }))
      : healthPackages;

  const filters = ['All', ...new Set(displayServices.map(s => {
    const words = s.title.split(' ');
    return words[words.length - 1];
  }))];

  const filtered = activeFilter === 'All'
    ? displayServices
    : displayServices.filter(s => s.title.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <section id="services" className="section-padding bg-neutral-50 dark:bg-neutral-900">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100">
            Our Services & Specialties
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-4 max-w-2xl mx-auto">
            Comprehensive healthcare under one roof
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-primary-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filtered.map((service, i) => {
            const Icon = iconMap[service.icon] || Stethoscope;
            const features = 'features' in service ? service.features : [];
            return (
              <div
                key={service.id || i}
                className={`card p-6 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{service.title}</h3>
                  {service.consultation_fee > 0 && (
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full whitespace-nowrap">From ₹{service.consultation_fee}</span>
                  )}
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-4">{service.description}</p>
                {features.length > 0 && (
                  <ul className="space-y-1.5 mb-4">
                    {features.slice(0, 4).map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                        <Check className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to={service.slug && clinicSlug ? `/${clinicSlug}/services/${service.slug}` : appointmentPath}
                  className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 group/btn"
                >
                  Learn More <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Consultation Fees Table */}
        {showFees && (
        <div className={`mb-16 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-8">Consultation Fees</h3>
          <div className="max-w-3xl mx-auto overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-600 text-white">
                  <th className="text-left px-6 py-3 font-semibold">Specialty</th>
                  <th className="text-left px-6 py-3 font-semibold">Consultation</th>
                  <th className="text-left px-6 py-3 font-semibold">Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {feeServices.map((fee, i) => (
                  <tr key={`${fee.title}-${i}`} className={i % 2 === 0 ? 'bg-white dark:bg-neutral-800' : 'bg-neutral-50 dark:bg-neutral-900'}>
                    <td className="px-6 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">{fee.title}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-primary-600 dark:text-primary-400">₹{fee.consultation_fee}</td>
                    <td className="px-6 py-3 text-sm text-neutral-500 dark:text-neutral-400">₹{fee.follow_up_fee}</td>
                  </tr>
                ))}
                {feeServices.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
                      No services with consultation fees added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* How It Works */}
        <div className={`mb-16 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">Process</span>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">How It Works</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(clinic?.process_steps?.length ? clinic.process_steps : processSteps).map((step, i) => (
              <div key={i} className="text-center relative">
                {i < (clinic?.process_steps?.length || processSteps.length) - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] border-t-2 border-dashed border-primary-300" />
                )}
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 relative z-10">
                  {'num' in step ? (step as { num: number }).num : i + 1}
                </div>
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">{step.title}</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Health Packages */}
        {displayPackages.length > 0 && (
        <div className={`transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-semibold mb-4">Health Packages</span>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Preventive Health Check-ups</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayPackages.map((pkg) => (
              <div key={pkg.name} className={`card p-6 relative ${pkg.popular ? 'ring-2 ring-primary-500 shadow-lg' : ''}`}>
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                )}
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">{pkg.name}</h4>
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 my-3">₹{pkg.price}</div>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`${appointmentPath.replace('/appointment', '/package-booking')}?package=${encodeURIComponent(pkg.name)}`}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center ${
                    pkg.popular
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-white dark:bg-neutral-800 border-2 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }`}
                >
                  Book This Package
                </Link>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-neutral-600 dark:text-neutral-300 mb-4">Not sure which specialty? Call us for guidance.</p>
          <div className="flex justify-center gap-3">
            <a href={`tel:${(clinic?.emergency_phone || clinic?.phone || '+919876500999').replace(/\s/g, '')}`} className="btn-primary bg-primary-600 hover:bg-primary-700">
              <Phone className="w-4 h-4" /> Call Us
            </a>
            {clinic?.whatsapp_number && (
              <a href={`https://wa.me/${clinic.whatsapp_number.replace(/\s/g, '')}?text=Hi%2C%20I'd%20like%20to%20know%20more%20about%20your%20clinic`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
