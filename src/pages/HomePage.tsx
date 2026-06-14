import type { ReactNode } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/sections/HeroSection';
import { ServicesMarquee } from '../components/sections/ServicesMarquee';
import { AboutUsSection } from '../components/sections/AboutUsSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { DoctorsSection } from '../components/sections/DoctorsSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { InsuranceSection } from '../components/sections/InsuranceSection';
import { BlogSection } from '../components/sections/BlogSection';
import { EmergencyBanner } from '../components/sections/EmergencyBanner';
import { ContactSection } from '../components/sections/ContactSection';
import { CTASection } from '../components/sections/CTASection';
import { FAQSection } from '../components/sections/FAQSection';
import { AppointmentSection } from '../components/sections/AppointmentSection';
import { BlogPage } from './BlogPage';
import { ReviewsPage } from './ReviewsPage';
import { useClinicData } from '../hooks/useClinicData';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Activity } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';

export function HomePage() {
  const { slug, page } = useParams<{ slug?: string; page?: string }>();
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

  const clinicBasePath = `/${clinic.slug || slug || 'medicare-clinic'}`;
  const appointmentPath = `${clinicBasePath}/appointment`;

  const pages: Record<string, ReactNode> = {
    services: <ServicesSection services={services} appointmentPath={appointmentPath} />,
    doctors: <DoctorsSection doctors={doctors} appointmentPath={appointmentPath} />,
    appointment: <AppointmentSection clinic={clinic} doctors={doctors} services={services} />,
    testimonials: <TestimonialsSection testimonials={testimonials} />,
    faq: <FAQSection faqs={faqs} />,
    contact: <ContactSection clinic={clinic} timings={timings} />,
    blog: <BlogPage />,
    reviews: <ReviewsPage />,
  };

  if (page && !pages[page]) {
    return <Navigate to={clinicBasePath} replace />;
  }

  const content = page ? (
    <div className="pt-24">{pages[page]}</div>
  ) : (
    <>
      <HeroSection
        clinic={clinic}
        servicesPath={`${clinicBasePath}/services`}
        appointmentPath={appointmentPath}
        doctors={doctors}
        services={services}
      />
      <ServicesMarquee services={services} />
      <AboutUsSection clinic={clinic} doctorsPath={`${clinicBasePath}/doctors`} />
      <ServicesSection services={services} appointmentPath={appointmentPath} />
      <DoctorsSection doctors={doctors} appointmentPath={appointmentPath} />
      <TestimonialsSection testimonials={testimonials} />
      <InsuranceSection />
      <BlogSection />
      <EmergencyBanner clinic={clinic} />
      <ContactSection clinic={clinic} timings={timings} />
      <FAQSection faqs={faqs} />
      <CTASection clinic={clinic} appointmentPath={appointmentPath} />
    </>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar clinic={clinic} />
      <main className="flex-1">
        {content}
      </main>
      <Footer clinic={clinic} />
    </div>
  );
}
