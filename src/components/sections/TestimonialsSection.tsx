import { Star, Quote } from 'lucide-react';
import { Testimonial } from '../../types';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const fallbackTestimonials = [
  {
    id: '1',
    patient_name: 'Robert Anderson',
    designation: 'Business Executive',
    rating: 5,
    message: 'The care I received at this clinic was exceptional. The doctors were thorough, compassionate, and took the time to explain everything. I felt truly cared for throughout my treatment.',
    patient_avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: '2',
    patient_name: 'Maria Gonzalez',
    designation: 'Teacher',
    rating: 5,
    message: 'From the moment I walked in, the staff made me feel welcome. The appointment booking was easy, and the doctors were professional and knowledgeable. Highly recommend!',
    patient_avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: '3',
    patient_name: 'David Kim',
    designation: 'Software Engineer',
    rating: 5,
    message: 'Outstanding medical facility with state-of-the-art equipment. The team is highly skilled and the treatment outcomes exceeded my expectations. Will definitely return.',
    patient_avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: '4',
    patient_name: 'Jennifer Lee',
    designation: 'Nurse',
    rating: 5,
    message: 'As a healthcare professional myself, I have high standards. This clinic surpassed all of them. The attention to detail and patient-centered care is truly remarkable.',
    patient_avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
];

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials as unknown as Testimonial[];

  return (
    <section id="testimonials" className="section-padding bg-gradient-to-br from-primary-900 via-primary-800 to-teal-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container-max relative" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-white/10 text-white/80 border border-white/20 rounded-full text-sm font-semibold mb-4">
            Patient Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            What Our Patients Say
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Real experiences from real patients who trusted us with their health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayTestimonials.map((testimonial, i) => (
            <div
              key={testimonial.id || i}
              className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <Quote className="w-8 h-8 text-primary-300/60 mb-4" />

              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating || 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>

              <p className="text-white/80 text-sm leading-relaxed mb-6 line-clamp-4">
                "{testimonial.message}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                  {testimonial.patient_avatar_url ? (
                    <img src={testimonial.patient_avatar_url} alt={testimonial.patient_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.patient_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{testimonial.patient_name}</p>
                  {testimonial.designation && (
                    <p className="text-white/50 text-xs">{testimonial.designation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
