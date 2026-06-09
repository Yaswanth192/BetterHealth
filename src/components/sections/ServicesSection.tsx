import { Stethoscope, Heart, Brain, Bone, Eye, Baby, Microscope, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClinicService } from '../../types';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ServicesSectionProps {
  services: ClinicService[];
  appointmentPath: string;
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

const fallbackImages = [
  'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/8376201/pexels-photo-8376201.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const gradients = [
  'from-primary-500 to-primary-700',
  'from-teal-500 to-teal-700',
  'from-sky-500 to-sky-700',
  'from-cyan-500 to-cyan-700',
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-emerald-700',
];

export function ServicesSection({ services, appointmentPath }: ServicesSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section id="services" className="section-padding bg-neutral-50">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
            Our Services
          </span>
          <h2 className="section-title">
            Comprehensive{' '}
            <span className="gradient-text">Medical Care</span>
          </h2>
          <p className="section-subtitle">
            We offer a wide range of medical services with state-of-the-art facilities and expert professionals.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {['General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Ophthalmology', 'Pediatrics'].map((name, i) => (
              <ServiceCard
                key={i}
                title={name}
                description="Expert medical care delivered with compassion and the latest medical technology."
                icon={iconMap[Object.keys(iconMap)[i % Object.keys(iconMap).length]]}
                image={fallbackImages[i % fallbackImages.length]}
                gradient={gradients[i % gradients.length]}
                index={i}
                isIntersecting={isIntersecting}
                appointmentPath={appointmentPath}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || Stethoscope;
              return (
                <ServiceCard
                  key={service.id}
                  title={service.title}
                  description={service.description}
                  icon={Icon}
                  image={service.image_url || fallbackImages[i % fallbackImages.length]}
                  gradient={gradients[i % gradients.length]}
                  index={i}
                  isIntersecting={isIntersecting}
                  appointmentPath={appointmentPath}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
  gradient: string;
  index: number;
  isIntersecting: boolean;
  appointmentPath: string;
}

function ServiceCard({ title, description, icon: Icon, image, gradient, index, isIntersecting, appointmentPath }: ServiceCardProps) {
  return (
    <div
      className={`card overflow-hidden group transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-60`} />
        <div className="absolute bottom-4 left-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2">{description}</p>
        <Link
          to={appointmentPath}
          className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group/btn"
        >
          Book Now
          <span className="transition-transform group-hover/btn:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}
