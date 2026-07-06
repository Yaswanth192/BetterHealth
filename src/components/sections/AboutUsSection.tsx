import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { Clinic } from '../../types';

interface AboutUsSectionProps {
  clinic: Clinic | null;
  doctorsPath: string;
  doctorsCount?: number;
}

export function AboutUsSection({ clinic, doctorsPath, doctorsCount }: AboutUsSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section className="section-padding bg-neutral-50 dark:bg-neutral-900">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={clinic?.about_image_url || "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800"}
                alt="Clinic"
                className="w-full h-[400px] object-cover"
                style={{ objectPosition: clinic?.about_image_position ? `${clinic.about_image_position.x}% ${clinic.about_image_position.y}%` : undefined, transform: clinic?.about_image_zoom && clinic.about_image_zoom > 1 ? `scale(${clinic.about_image_zoom})` : undefined, transformOrigin: clinic?.about_image_position ? `${clinic.about_image_position.x}% ${clinic.about_image_position.y}%` : undefined }}
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg">
              {clinic?.founded_year ? `Since ${clinic.founded_year}` : 'Since 2015'}
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-6">
              Trusted Healthcare{clinic?.founded_year ? ` Since ${clinic.founded_year}` : ''}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8">
              {clinic?.description || 'Our clinic was founded with a simple mission — to make quality healthcare accessible and affordable for every family. Our team of specialists across multiple departments delivers compassionate, evidence-based care using state-of-the-art equipment.'}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{clinic?.years_of_service ? `${clinic.years_of_service}+` : '15+'}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Years of Service</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{doctorsCount || '12'}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Expert Doctors</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{clinic?.google_rating || '4.8'}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Google Rating</div>
              </div>
            </div>

            <Link
              to={doctorsPath}
              className="btn-primary"
            >
              Meet Our Doctors →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
