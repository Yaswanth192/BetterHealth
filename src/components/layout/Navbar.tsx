import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Activity, MessageCircle, Sun, Moon } from 'lucide-react';
import { Clinic } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface NavbarProps {
  clinic: Clinic | null;
}

export function Navbar({ clinic }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const publicBasePath = clinic?.slug ? `/${clinic.slug}` : '/';
  const isHomePage = location.pathname === publicBasePath || location.pathname === `${publicBasePath}/`;
  const solidHeader = scrolled || !isHomePage;

  const navLinks = [
    { label: 'Home', href: publicBasePath },
    { label: 'Services', href: `${publicBasePath}/services` },
    { label: 'Doctors', href: `${publicBasePath}/doctors` },
    { label: 'Contact', href: `${publicBasePath}/contact` },
    { label: 'Reviews', href: `${publicBasePath}/reviews` },
    { label: 'Blog', href: `${publicBasePath}/blog` },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  function handleNavClick() {
    setIsOpen(false);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Top bar */}
      <div className={`transition-all duration-300 ${solidHeader ? 'bg-[#1a1a2e] text-white dark:bg-[#1a1a2e] dark:text-neutral-100' : 'bg-[#1a1a2e] text-white/90 dark:bg-[#1a1a2e] dark:text-neutral-100/90'}`}>
        <div className="container-max flex items-center justify-between px-4 sm:px-6 lg:px-8 py-1 text-xs">
          <div className="flex items-center gap-4">
            {clinic?.phone && (
              <a href={`tel:${clinic.phone}`} className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] transition-all">
                <Phone className="w-3 h-3" />
                {clinic.phone}
              </a>
            )}
            {clinic?.email && (
              <a href={`mailto:${clinic.email}`} className="hidden sm:flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] transition-all">
                <span className="w-3 h-3 flex items-center justify-center">✉</span>
                {clinic.email}
              </a>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Emergency 24/7
            </span>
            <a href={clinic?.whatsapp_number ? `https://wa.me/${clinic.whatsapp_number.replace(/\s/g, '')}` : '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] transition-all">
              <MessageCircle className="w-3 h-3" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={`transition-all duration-300 ${
          solidHeader ? 'bg-white/95 backdrop-blur-md shadow-md dark:bg-neutral-900/95 dark:shadow-neutral-900/50' : 'bg-white/90 backdrop-blur-sm dark:bg-neutral-900/90'
        }`}
      >
        <div className="container-max flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
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
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-none">
                {clinic?.name || 'MediCare'}
              </span>
              {clinic?.tagline && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-none mt-0.5">
                  {clinic.tagline}
                </p>
              )}
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href || location.pathname === `${link.href}/`;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary-700 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                      : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50 dark:text-neutral-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={`${publicBasePath}/appointment`}
              onClick={handleNavClick}
              className="btn-book text-sm"
            >
              Book Appointment
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-md border-t border-neutral-100 shadow-lg animate-slide-down dark:bg-neutral-900/98 dark:border-neutral-800">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="px-4 py-2.5 rounded-lg text-neutral-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors dark:text-neutral-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <a
                href={`${publicBasePath}/appointment`}
                onClick={handleNavClick}
                className="btn-book w-full justify-center"
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
