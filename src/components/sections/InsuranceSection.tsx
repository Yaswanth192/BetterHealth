import { Shield, MessageCircle } from 'lucide-react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { InsuranceProvider, Certification, Clinic } from '../../types';

interface InsuranceSectionProps {
  insuranceProviders?: InsuranceProvider[];
  certifications?: Certification[];
  clinic?: Clinic | null;
}

const fallbackProviders = ['Star Health', 'HDFC Ergo', 'ICICI Lombard', 'Bajaj Allianz', 'New India Assurance', 'Max Bupa'];
const fallbackCertifications = ['NABH Accredited', 'ISO 9001:2015', 'AERB Licensed', 'Fire Safety Certified'];

export function InsuranceSection({ insuranceProviders = [], certifications = [], clinic }: InsuranceSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const displayProviders = insuranceProviders.length > 0 ? insuranceProviders.map(p => p.name) : fallbackProviders;
  const displayCerts = certifications.length > 0 ? certifications.map(c => c.name) : fallbackCertifications;
  const whatsappNumber = clinic?.whatsapp_number?.replace(/\s/g, '') || '';

  return (
    <section className="section-padding bg-white dark:bg-neutral-900">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        {/* Insurance */}
        <div className={`text-center mb-16 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
            Insurance
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-8">
            Cashless Treatment Available
          </h2>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {displayProviders.map((provider) => (
              <div key={provider} className="px-6 py-3 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium text-sm hover:border-primary-400 hover:text-primary-700 transition-colors">
                {provider}
              </div>
            ))}
          </div>

          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Check Insurance Coverage on WhatsApp
            </a>
          )}
        </div>

        {/* Certifications */}
        <div className={`text-center transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Certifications & Accreditations
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {displayCerts.map((cert) => (
              <div key={cert} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                <Shield className="w-4 h-4 text-primary-500" />
                {cert}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
