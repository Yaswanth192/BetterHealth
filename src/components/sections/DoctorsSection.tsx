import { Star, Award, Clock, Users } from 'lucide-react';
import { ClinicDoctor } from '../../types';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface DoctorsSectionProps {
  doctors: ClinicDoctor[];
}

const fallbackDoctors = [
  {
    name: 'Dr. Sarah Johnson',
    specialization: 'Chief Cardiologist',
    image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=600',
    experience_years: 15,
    qualifications: ['MD, Cardiology', 'FACC', 'Harvard Medical School'],
    available_times: 'Mon-Fri 9AM-5PM',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    bio: 'Dr. Johnson is a board-certified cardiologist with over 15 years of experience in treating complex cardiovascular diseases.',
  },
  {
    name: 'Dr. Michael Chen',
    specialization: 'Neurologist',
    image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=600',
    experience_years: 12,
    qualifications: ['MD, Neurology', 'PhD', 'Johns Hopkins University'],
    available_times: 'Mon-Thu 10AM-6PM',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    bio: 'Specializing in neurological disorders, Dr. Chen brings cutting-edge research and clinical expertise to every patient.',
  },
  {
    name: 'Dr. Emily Patel',
    specialization: 'Pediatrician',
    image: 'https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=600',
    experience_years: 10,
    qualifications: ['MD, Pediatrics', 'FAAP', 'Stanford University'],
    available_times: 'Tue-Sat 8AM-4PM',
    available_days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    bio: 'Dr. Patel is passionate about children\'s health and development, providing gentle and comprehensive pediatric care.',
  },
  {
    name: 'Dr. James Wilson',
    specialization: 'Orthopedic Surgeon',
    image: 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=600',
    experience_years: 18,
    qualifications: ['MD', 'FAAOS', 'Mayo Clinic Fellowship'],
    available_times: 'Mon, Wed, Fri 9AM-3PM',
    available_days: ['Monday', 'Wednesday', 'Friday'],
    bio: 'With two decades of surgical experience, Dr. Wilson specializes in minimally invasive joint replacement surgeries.',
  },
];

export function DoctorsSection({ doctors }: DoctorsSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const displayDoctors = doctors.length > 0 ? doctors : fallbackDoctors;

  return (
    <section id="doctors" className="section-padding bg-white">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-4">
            Our Doctors
          </span>
          <h2 className="section-title">
            Meet Our{' '}
            <span className="gradient-text">Expert Team</span>
          </h2>
          <p className="section-subtitle">
            Our team of highly qualified specialists is committed to providing the highest quality medical care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayDoctors.map((doctor, i) => (
            <DoctorCard
              key={'id' in doctor ? doctor.id : i}
              doctor={doctor as ClinicDoctor}
              index={i}
              isIntersecting={isIntersecting}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DoctorCard({ doctor, index, isIntersecting }: { doctor: ClinicDoctor; index: number; isIntersecting: boolean }) {
  return (
    <div
      className={`card group overflow-hidden transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden h-64">
        <img
          src={doctor.image_url || `https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=600`}
          alt={doctor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight">{doctor.name}</h3>
          <p className="text-primary-300 text-sm font-medium">{doctor.specialization}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4 mb-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-primary-500" />
            {doctor.experience_years}yr exp
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            5.0
          </span>
        </div>

        {doctor.qualifications && doctor.qualifications.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {doctor.qualifications.slice(0, 2).map((q, i) => (
              <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                {q}
              </span>
            ))}
          </div>
        )}

        {doctor.available_times && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
            <Clock className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
            {doctor.available_times}
          </div>
        )}

        <button
          onClick={() => document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full py-2.5 bg-primary-50 hover:bg-primary-600 text-primary-700 hover:text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          Book Appointment
        </button>
      </div>
    </div>
  );
}
