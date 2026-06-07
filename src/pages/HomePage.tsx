import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/sections/HeroSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { DoctorsSection } from '../components/sections/DoctorsSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { FAQSection } from '../components/sections/FAQSection';
import { ContactSection } from '../components/sections/ContactSection';
import { AppointmentSection } from '../components/sections/AppointmentSection';
import { useClinicData } from '../hooks/useClinicData';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Activity } from 'lucide-react';
import { useParams } from 'react-router-dom';

export function HomePage() {
  const { slug } = useParams<{ slug?: string }>();
  const { clinic, services, doctors, timings, testimonials, faqs, loading, error } = useClinicData(slug);

  if (loading) return <PageLoader />;

  if (error || !clinic) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Clinic Not Found</h2>
          <p className="text-neutral-500 text-sm">This clinic is not yet configured. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar clinic={clinic} />
      <main className="flex-1">
        <HeroSection clinic={clinic} />
        <ServicesSection services={services} />
        <DoctorsSection doctors={doctors} />
        <AppointmentSection clinic={clinic} doctors={doctors} services={services} />
        <TestimonialsSection testimonials={testimonials} />
        <FAQSection faqs={faqs} />
        <ContactSection clinic={clinic} timings={timings} />
      </main>
      <Footer clinic={clinic} />
    </div>
  );
}
