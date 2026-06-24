import { Activity, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Clinic } from '../../types';

interface FooterProps {
  clinic: Clinic | null;
}

export function Footer({ clinic }: FooterProps) {
  const year = new Date().getFullYear();
  const publicBasePath = clinic?.slug ? `/${clinic.slug}` : '/';

  return (
    <footer className="bg-neutral-900 text-white dark:bg-neutral-950">
      <div className="container-max section-padding pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">{clinic?.name || 'Clinic'}</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              {clinic?.footer_description || clinic?.description || 'Serving families since 2015. Providing compassionate, evidence-based care.'}
            </p>
            {clinic?.whatsapp_number && (
              <a href={`https://wa.me/${clinic.whatsapp_number.replace(/\s/g, '')}?text=Hi%2C%20I'd%20like%20to%20know%20more%20about%20your%20clinic`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-500 mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', href: publicBasePath },
                { label: 'Services', href: `${publicBasePath}/services` },
                { label: 'Doctors', href: `${publicBasePath}/doctors` },
                { label: 'Contact', href: `${publicBasePath}/contact` },
                { label: 'Reviews', href: `${publicBasePath}/reviews` },
                { label: 'Blog', href: `${publicBasePath}/blog` },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-neutral-300 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-500 mb-4">Contact</h4>
            <ul className="space-y-3">
              {clinic?.phone && (
                <li>
                  <a href={`tel:${clinic.phone}`} className="flex items-start gap-3 text-neutral-300 hover:text-white text-sm transition-colors">
                    <Phone className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                    {clinic.phone}
                  </a>
                </li>
              )}
              <li>
                <span className="flex items-start gap-3 text-red-400 text-sm font-medium">
                  <span className="w-4 h-4 mt-0.5 flex items-center justify-center">⚠</span>
                  Emergency 24/7
                </span>
                <span className="flex items-start gap-3 text-neutral-300 text-sm ml-7">
                  {clinic?.emergency_phone || clinic?.phone || '+91 98765 00999'}
                </span>
              </li>
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

          {/* Hours */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-500 mb-4">Hours</h4>
            <div className="flex items-center gap-2 text-neutral-300 text-sm">
              <Clock className="w-4 h-4 text-primary-400" />
              {clinic?.opening_hours_display || '9 AM – 10 PM'}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            &copy; {year} {clinic?.name || 'Clinic'}. All rights reserved.
          </p>
          <p className="text-neutral-600 text-xs">
            {clinic?.footer_tagline || 'Designed for better healthcare delivery'}
          </p>
        </div>
      </div>
    </footer>
  );
}
