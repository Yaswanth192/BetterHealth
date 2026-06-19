import { Star, BadgeCheck } from 'lucide-react';
import { Testimonial } from '../../types';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const fallbackTestimonials = [
  {
    id: '1',
    patient_name: 'Rajesh Kumar',
    designation: 'Dental Implant',
    rating: 5,
    message: 'Excellent experience! The doctors are highly professional and the dental implant procedure was painless. Highly recommend.',
    patient_avatar_url: '',
  },
  {
    id: '2',
    patient_name: 'Sunita Patel',
    designation: 'Skin Treatment',
    rating: 5,
    message: 'Dr. Karthik resolved my chronic skin condition that I\'d been struggling with for years. The staff is incredibly warm and welcoming.',
    patient_avatar_url: '',
  },
  {
    id: '3',
    patient_name: 'Amit Deshmukh',
    designation: 'Knee Surgery',
    rating: 5,
    message: 'After my knee surgery, the recovery program was outstanding. The physiotherapy team helped me walk again in just 3 weeks.',
    patient_avatar_url: '',
  },
];

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials as unknown as Testimonial[];

  return (
    <section id="testimonials" className="section-padding bg-neutral-50 dark:bg-neutral-900">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100">
            What Our Patients Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayTestimonials.map((testimonial, i) => (
            <div
              key={testimonial.id || i}
              className={`card p-6 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating || 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>

              <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-6 italic">
                "{testimonial.message}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm flex-shrink-0">
                  {testimonial.patient_avatar_url ? (
                    <img src={testimonial.patient_avatar_url} alt={testimonial.patient_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    testimonial.patient_name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{testimonial.patient_name}</p>
                  {testimonial.designation && (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">{testimonial.designation}</p>
                  )}
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
