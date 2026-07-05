import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClinicDoctor, Clinic } from '../../types';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface DoctorsSectionProps {
  doctors: ClinicDoctor[];
  appointmentPath: string;
  clinic?: Clinic | null;
  showDirector?: boolean;
  showViewAll?: boolean;
}

export function DoctorsSection({ doctors, appointmentPath, clinic, showDirector = true, showViewAll = true }: DoctorsSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const hasDoctors = doctors.length > 0;
  const displayDoctors = doctors;
  const [activeFilter, setActiveFilter] = useState('All');

  const specializations = [...new Set(displayDoctors.map(d => {
    const parts = d.specialization.split(' ');
    return parts[parts.length - 1];
  }))];
  const filters = ['All', ...specializations];

  const filtered = activeFilter === 'All'
    ? displayDoctors
    : displayDoctors.filter(d => d.specialization.toLowerCase().includes(activeFilter.toLowerCase()));

  const director = displayDoctors[0];

  if (!hasDoctors) {
    return (
      <section id="doctors" className="section-padding bg-white dark:bg-neutral-900">
        <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
          <div className={`mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${!showViewAll ? 'text-center' : ''}`}>
            <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
              Our Team
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100">
              Meet Our Doctors
            </h2>
            <p className={`text-neutral-500 dark:text-neutral-400 mt-3 max-w-xl ${!showViewAll ? 'mx-auto' : ''}`}>
              {clinic?.doctors_section_subtitle || 'Experienced specialists dedicated to your well-being'}
            </p>
          </div>
          <div className="text-center py-16">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">No doctors added yet.</p>
            <Link to={appointmentPath} className="btn-primary">Book an Appointment</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="doctors" className="section-padding bg-white dark:bg-neutral-900">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        {/* Header */}
        <div className={`mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${!showViewAll ? 'text-center' : ''}`}>
          <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
            Our Team
          </span>
          <div className={`flex flex-col ${showViewAll ? 'sm:flex-row sm:items-end sm:justify-between' : 'items-center text-center'} gap-4`}>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100">
              Meet Our Doctors
            </h2>
            {showViewAll && (
              <Link to={`${appointmentPath}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          <p className={`text-neutral-500 dark:text-neutral-400 mt-3 max-w-xl ${!showViewAll ? 'mx-auto' : ''}`}>
            {clinic?.doctors_section_subtitle || 'Experienced specialists dedicated to your well-being'}
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

        {/* Director spotlight */}
        {showDirector && activeFilter === 'All' && director && (
          <div className={`card overflow-hidden mb-12 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
              <div className="grid grid-cols-1 sm:grid-cols-[380px_1fr] gap-0">
              <div className="min-h-[420px] bg-neutral-100 dark:bg-neutral-700">
                <img
                  src={director.image_url || 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={director.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 sm:p-6 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 w-fit">
                  Meet Our Director
                </span>
                <h3 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-100 mb-0.5">{director.name}</h3>
                <p className="text-teal-600 dark:text-teal-400 font-semibold text-sm mb-3">{director.specialization || 'Founder & Medical Director'}</p>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-3">
                  {director.director_bio || director.bio || `${director.name} founded our clinic with a vision to bring world-class healthcare to every family. With over ${director.experience_years} years of experience, he has treated thousands of patients.`}
                </p>
                {director.qualifications && director.qualifications.length > 0 && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">{director.qualifications.join(', ')}</p>
                )}
                <blockquote className="border-l-[3px] border-teal-500 pl-3 italic text-neutral-700 dark:text-neutral-200 text-sm leading-relaxed">
                  "{director.director_quote || 'Every patient deserves to be treated like family. We don\'t just treat symptoms — we build lasting health.'}"
                </blockquote>
              </div>
            </div>
          </div>
        )}

        {/* Doctor cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((doctor, i) => (
            <div
              key={doctor.id || i}
              className={`card overflow-hidden transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-48 min-h-[260px] flex-shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                  <img
                    src={doctor.image_url || 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-5">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">{doctor.name}</h3>
                  <span className="inline-block px-2.5 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-xs font-semibold mt-1">
                    {doctor.specialization}
                  </span>
                  {doctor.qualifications && doctor.qualifications.length > 0 && (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">{doctor.qualifications.join(', ')}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                    <div>
                      <span className="text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider text-[10px]">Experience</span>
                      <p className="text-neutral-700 dark:text-neutral-200 font-semibold">{doctor.experience_years} Years</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider text-[10px]">Languages</span>
                      <p className="text-neutral-700 dark:text-neutral-200 font-semibold">
                        {doctor.languages?.length ? doctor.languages.join(', ') : 'English, Hindi'}
                      </p>
                    </div>
                  </div>

                  {doctor.open_time && doctor.close_time && (
                    <div className="mt-2.5 text-xs">
                      <span className="text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider text-[10px]">Schedule</span>
                      <p className="text-neutral-700 dark:text-neutral-200 font-semibold">
                        {doctor.available_days?.slice(0, 3).join('/') || 'Mon-Fri'} {doctor.open_time} - {doctor.close_time}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2.5 line-clamp-2">{doctor.bio}</p>

                  <Link
                    to={`${appointmentPath}?doctor=${encodeURIComponent(doctor.name)}`}
                    className="inline-block mt-4 px-6 py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-full transition-colors"
                  >
                    Book with {doctor.name.split(' ').pop()}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Collective Achievements */}
        <div className={`mt-16 bg-primary-950 bg-gradient-to-br from-primary-900 via-primary-800 to-teal-900 rounded-2xl p-10 text-white transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-2xl font-bold font-heading text-center mb-8">Our Collective Achievements</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: clinic?.research_papers || '45+', label: 'Research Papers' },
              { value: clinic?.successful_surgeries || '8,000+', label: 'Successful Surgeries' },
              { value: clinic?.awards_won ? String(clinic.awards_won) : '12', label: 'Awards Won' },
              { value: clinic?.combined_experience || '55+ Years', label: 'Combined Experience' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/60 text-xs uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Book Consultation CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-2">Book a Consultation</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">Choose your preferred doctor and book an appointment at your convenience.</p>
          <Link to={appointmentPath} className="btn-book">
            Book Appointment
          </Link>
        </div>
      </div>
    </section>
  );
}
