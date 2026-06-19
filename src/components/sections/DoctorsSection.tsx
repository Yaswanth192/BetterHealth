import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClinicDoctor } from '../../types';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface DoctorsSectionProps {
  doctors: ClinicDoctor[];
  appointmentPath: string;
}

const fallbackDoctors = [
  {
    name: 'Dr. Arun Mehta',
    specialization: 'Internal Medicine',
    image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=600',
    experience_years: 20,
    qualifications: ['MBBS', 'MD (Internal Medicine)'],
    languages: ['English', 'Hindi', 'Marathi'],
    open_time: '09:00',
    close_time: '14:00',
    available_days: ['Monday', 'Wednesday', 'Friday'],
    bio: 'Medical Director with expertise in chronic disease management and preventive care. Published researcher in diabetes treatment protocols.',
  },
  {
    name: 'Dr. Priya Sharma',
    specialization: 'Orthodontics',
    image: 'https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=600',
    experience_years: 12,
    qualifications: ['BDS', 'MDS (Orthodontics)'],
    languages: ['English', 'Hindi', 'Gujarati'],
    open_time: '10:00',
    close_time: '18:00',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    bio: 'Head of Dental Department specializing in invisible braces and complex orthodontic cases. Over 3,000 smile transformations.',
  },
  {
    name: 'Dr. Karthik Iyer',
    specialization: 'Dermatology',
    image: 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=600',
    experience_years: 8,
    qualifications: ['MBBS', 'MD (Dermatology)'],
    languages: ['English', 'Hindi', 'Tamil'],
    open_time: '10:00',
    close_time: '17:00',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    bio: 'Expert in cosmetic dermatology, laser treatments, and skin allergy management. Trained at AIIMS.',
  },
  {
    name: 'Dr. Neha Gupta',
    specialization: 'Ophthalmology',
    image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=600',
    experience_years: 15,
    qualifications: ['MBBS', 'MS (Ophthalmology)', 'AIIMS Fellow'],
    languages: ['English', 'Hindi'],
    open_time: '09:00',
    close_time: '16:00',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    bio: 'Leading ophthalmologist with expertise in LASIK, cataract surgery, and glaucoma management.',
  },
];

export function DoctorsSection({ doctors, appointmentPath }: DoctorsSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const displayDoctors = doctors.length > 0 ? doctors : fallbackDoctors as unknown as ClinicDoctor[];
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

  return (
    <section id="doctors" className="section-padding bg-white dark:bg-neutral-900">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        {/* Header */}
        <div className={`mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
            Our Team
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100">
              Meet Our Doctors
            </h2>
            <Link to={`${appointmentPath}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 mt-3 max-w-xl">
            Experienced specialists dedicated to your well-being
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
        {activeFilter === 'All' && director && (
          <div className={`card overflow-hidden mb-12 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              <div className="h-56 sm:h-auto">
                <img
                  src={director.image_url || 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={director.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-semibold mb-2 w-fit">
                  Meet Our Director
                </span>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">{director.name}</h3>
                <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mb-3">{director.specialization}</p>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-3">
                  {director.bio || `${director.name} founded our clinic with a vision to bring world-class healthcare to every family. With over ${director.experience_years} years of experience, he has treated thousands of patients.`}
                </p>
                {director.qualifications && director.qualifications.length > 0 && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">{director.qualifications.join(', ')}</p>
                )}
                <blockquote className="border-l-3 border-primary-400 pl-3 italic text-neutral-600 dark:text-neutral-300 text-xs">
                  "Every patient deserves to be treated like family. We don't just treat symptoms — we build lasting health."
                </blockquote>
              </div>
            </div>
          </div>
        )}

        {/* Doctor cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doctor, i) => (
            <div
              key={doctor.id || i}
              className={`card overflow-hidden transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={doctor.image_url || 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={doctor.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-xl">{doctor.name}</h3>
                <span className="inline-block px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium mt-1">
                  {doctor.specialization}
                </span>
                {doctor.qualifications && doctor.qualifications.length > 0 && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">{doctor.qualifications.join(', ')}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 font-medium">Experience</span>
                    <p className="text-neutral-700 dark:text-neutral-200 font-semibold">{doctor.experience_years} Years</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 font-medium">Languages</span>
                    <p className="text-neutral-700 dark:text-neutral-200 font-semibold">
                      {doctor.languages?.length ? doctor.languages.join(', ') : 'English, Hindi'}
                    </p>
                  </div>
                </div>

                {doctor.open_time && doctor.close_time && (
                  <div className="mt-3 text-xs">
                    <span className="text-neutral-400 dark:text-neutral-500 font-medium">Schedule</span>
                    <p className="text-neutral-700 dark:text-neutral-200 font-semibold">
                      {doctor.available_days?.slice(0, 2).join('/') || 'Mon-Fri'} {doctor.open_time} - {doctor.close_time}
                    </p>
                  </div>
                )}

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 line-clamp-2">{doctor.bio}</p>

                <Link
                  to={appointmentPath}
                  className="btn-book mt-4 w-full py-2.5 text-sm justify-center"
                >
                  Book with {doctor.name.split(' ').pop()}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Collective Achievements */}
        <div className={`mt-16 bg-[#080f24] bg-gradient-to-br from-primary-900 via-primary-800 to-teal-900 rounded-2xl p-10 text-white transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-2xl font-bold font-heading text-center mb-8">Our Collective Achievements</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: '45+', label: 'Research Papers' },
              { value: '8,000+', label: 'Successful Surgeries' },
              { value: '12', label: 'Awards Won' },
              { value: '55+ Years', label: 'Combined Experience' },
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
