import { Link } from 'react-router-dom';
import { Activity, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Clinic } from '../../types';

interface FooterProps {
  clinic: Clinic | null;
}

export function Footer({ clinic }: FooterProps) {
  const year = new Date().getFullYear();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container-max section-padding pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">{clinic?.name || 'MediCare Clinic'}</span>
            </div>
            <p className="text-neutral-400 leading-relaxed mb-6 max-w-sm">
              {clinic?.description || 'Providing exceptional healthcare with compassion and expertise. Your health and well-being are our top priorities.'}
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-primary-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {['services', 'doctors', 'testimonials', 'faq', 'contact', 'appointment'].map((id) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className="text-neutral-300 hover:text-white capitalize transition-colors text-sm"
                  >
                    {id === 'faq' ? 'FAQ' : id.charAt(0).toUpperCase() + id.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">Contact</h4>
            <ul className="space-y-3">
              {clinic?.phone && (
                <li>
                  <a href={`tel:${clinic.phone}`} className="flex items-start gap-3 text-neutral-300 hover:text-white text-sm transition-colors">
                    <Phone className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                    {clinic.phone}
                  </a>
                </li>
              )}
              {clinic?.email && (
                <li>
                  <a href={`mailto:${clinic.email}`} className="flex items-start gap-3 text-neutral-300 hover:text-white text-sm transition-colors">
                    <Mail className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                    {clinic.email}
                  </a>
                </li>
              )}
              {clinic?.address && (
                <li className="flex items-start gap-3 text-neutral-300 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                  <span>{clinic.address}, {clinic.city}, {clinic.state} {clinic.zip}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            &copy; {year} {clinic?.name || 'MediCare Clinic'}. All rights reserved.
          </p>
          <p className="text-neutral-600 text-xs">
            Designed for better healthcare delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
