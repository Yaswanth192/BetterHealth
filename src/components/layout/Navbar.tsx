import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Activity } from 'lucide-react';
import { Clinic } from '../../types';

interface NavbarProps {
  clinic: Clinic | null;
}

export function Navbar({ clinic }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const publicBasePath = typeof window !== 'undefined' && window.location.hostname === 'localhost' && clinic?.slug ? `/${clinic.slug}` : '/';

  const navLinks = [
    { label: 'Home', href: publicBasePath },
    { label: 'Services', href: `${publicBasePath}#services` },
    { label: 'Doctors', href: `${publicBasePath}#doctors` },
    { label: 'Testimonials', href: `${publicBasePath}#testimonials` },
    { label: 'FAQ', href: `${publicBasePath}#faq` },
    { label: 'Contact', href: `${publicBasePath}#contact` },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  function handleNavClick(href: string) {
    if (href.startsWith('/#')) {
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <nav className="container-max flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to={publicBasePath} className="flex items-center gap-2.5 group">
          {clinic?.logo_url ? (
            <img src={clinic.logo_url} alt={clinic.name} className="h-9 w-auto object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <span className={`text-lg font-bold leading-none transition-colors ${scrolled ? 'text-neutral-900' : 'text-white'}`}>
              {clinic?.name || 'MediCare'}
            </span>
            {clinic?.tagline && (
              <p className={`text-xs leading-none mt-0.5 transition-colors ${scrolled ? 'text-neutral-400' : 'text-white/70'}`}>
                {clinic.tagline}
              </p>
            )}
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                if (link.href.startsWith('/#')) {
                  e.preventDefault();
                  handleNavClick(link.href);
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 ${
                scrolled ? 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50' : 'text-white/90 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {clinic?.phone && (
            <a
              href={`tel:${clinic.phone}`}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${scrolled ? 'text-primary-600' : 'text-white/80 hover:text-white'}`}
            >
              <Phone className="w-4 h-4" />
              {clinic.phone}
            </a>
          )}
          <a
            href={`${publicBasePath}#appointment`}
            onClick={(e) => { e.preventDefault(); handleNavClick(`${publicBasePath}#appointment`); }}
            className="btn-primary text-sm"
          >
            Book Appointment
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-neutral-700 hover:bg-neutral-100' : 'text-white hover:bg-white/10'}`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-md border-t border-neutral-100 shadow-lg animate-slide-down">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/#')) {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }}
                className="px-4 py-2.5 rounded-lg text-neutral-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 pt-3 border-t border-neutral-100">
              <a
                href={`${publicBasePath}#appointment`}
                onClick={(e) => { e.preventDefault(); handleNavClick(`${publicBasePath}#appointment`); }}
                className="btn-primary w-full justify-center"
              >
                Book Appointment
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
