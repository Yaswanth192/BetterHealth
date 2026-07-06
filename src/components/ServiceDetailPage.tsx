import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Stethoscope, Heart, Brain, Bone, Eye, Baby, Microscope, Pill, Check, ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ClinicService, Clinic, ServiceContentSection } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

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

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, isIntersecting } = useIntersectionObserver();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function ContentRenderer({ sections }: { sections: ServiceContentSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => {
        switch (section.type) {
          case 'heading': {
            const Tag = `h${section.level || 2}` as keyof JSX.IntrinsicElements;
            const sizeClasses: Record<number, string> = {
              2: 'text-2xl sm:text-3xl font-bold font-heading',
              3: 'text-xl sm:text-2xl font-bold',
              4: 'text-lg sm:text-xl font-semibold',
            };
            return (
              <Tag
                key={section.id}
                className={`${sizeClasses[section.level || 2]} text-neutral-900 dark:text-neutral-100 mt-8 mb-4`}
              >
                {section.content}
              </Tag>
            );
          }
          case 'paragraph':
            return (
              <p key={section.id} className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[15px]">
                {section.content}
              </p>
            );
          case 'bullets':
            return (
              <ul key={section.id} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 my-4">
                {section.items?.filter(Boolean).map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-neutral-600 dark:text-neutral-300 text-[15px]">
                    <Check className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case 'image':
            return (
              <figure key={section.id} className="my-6">
                <img
                  src={section.content}
                  alt={section.alt || ''}
                  className="w-full rounded-2xl object-cover max-h-[500px]"
                  style={{
                    objectPosition: section.position ? `${section.position.x}% ${section.position.y}%` : undefined,
                    transform: section.zoom && section.zoom > 1 ? `scale(${section.zoom})` : undefined,
                    transformOrigin: section.position ? `${section.position.x}% ${section.position.y}%` : undefined,
                  }}
                />
                {section.alt && (
                  <figcaption className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-3">
                    {section.alt}
                  </figcaption>
                )}
              </figure>
            );
          case 'callout':
            return (
              <div key={section.id} className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 rounded-r-xl p-5 my-6">
                <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed text-[15px]">
                  {section.content}
                </p>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export function ServiceDetailPage() {
  const { slug, serviceSlug } = useParams<{ slug?: string; serviceSlug?: string }>();
  const [service, setService] = useState<ClinicService | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug && serviceSlug) fetchData();
  }, [slug, serviceSlug]);

  async function fetchData() {
    setLoading(true);
    setNotFound(false);

    const { data: clinicData } = await supabase
      .from('clinics')
      .select('*')
      .eq('slug', slug!)
      .eq('is_active', true)
      .maybeSingle();

    if (!clinicData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setClinic(clinicData);

    const { data: serviceData } = await supabase
      .from('clinic_services')
      .select('*')
      .eq('clinic_id', clinicData.id)
      .eq('slug', serviceSlug!)
      .eq('is_active', true)
      .maybeSingle();

    if (!serviceData) {
      setNotFound(true);
    }

    setService(serviceData);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (notFound || !service || !clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center px-4">
          <Stethoscope className="w-16 h-16 text-neutral-200 dark:text-neutral-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Service Not Found</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">The service you're looking for doesn't exist or is no longer available.</p>
          <Link to={`/${slug}`} className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const Icon = iconMap[service.icon] || Stethoscope;
  const features = service.features ?? [];
  const sections = service.content_sections ?? [];
  const clinicBasePath = `/${clinic.slug || slug}`;
  const appointmentPath = `${clinicBasePath}/appointment`;
  const servicesPath = `${clinicBasePath}/services`;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            style={{
              objectPosition: service.image_position ? `${service.image_position.x}% ${service.image_position.y}%` : undefined,
              transform: service.image_zoom && service.image_zoom > 1 ? `scale(${service.image_zoom})` : undefined,
              transformOrigin: service.image_position ? `${service.image_position.x}% ${service.image_position.y}%` : undefined,
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-teal-50 dark:from-primary-950 dark:to-teal-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-teal-800" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hidden lg:block" />

        <div className="relative container-max px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <Link
              to={servicesPath}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> All Services
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <Icon className="w-8 h-8 text-white" />
              </div>
              {service.consultation_fee > 0 && (
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-sm font-semibold">
                  From ₹{service.consultation_fee}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-white mb-6 leading-tight">
              {service.title}
            </h1>

            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
              {service.description}
            </p>

            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {features.slice(0, 4).map((f, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-white/90 border border-white/20 rounded-full text-sm">
                    {f}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <a
                href={appointmentPath}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Book Appointment
              </a>
              {clinic.whatsapp_number && (
                <a
                  href={`https://wa.me/${clinic.whatsapp_number.replace(/\s/g, '')}?text=Hi%2C%20I'd%20like%20to%20know%20more%20about%20${encodeURIComponent(service.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {sections.length > 0 && (
        <section className="section-padding">
          <div className="container-max max-w-4xl">
            <FadeIn>
              <ContentRenderer sections={sections} />
            </FadeIn>
          </div>
        </section>
      )}

      {/* Features Grid (if no custom sections) */}
      {sections.length === 0 && features.length > 0 && (
        <section className="section-padding">
          <div className="container-max max-w-4xl">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-8">
                What's Included
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <FadeIn key={i} delay={i * 100}>
                  <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-700">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-neutral-700 dark:text-neutral-200 font-medium">{feature}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding bg-neutral-50 dark:bg-neutral-900">
        <div className="container-max max-w-4xl">
          <FadeIn>
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-teal-500 rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmgtNHY2aDJ2Mmg0di0yek0yMiAyNGgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-4">
                  Ready for {service.title}?
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                  Book your consultation today and let our experts help you.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href={appointmentPath}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg"
                  >
                    Book Appointment
                  </a>
                  <a
                    href={`tel:${(clinic.emergency_phone || clinic.phone || '').replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
                  >
                    <Phone className="w-4 h-4" /> Call Us
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
