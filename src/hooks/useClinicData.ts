import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clinic, ClinicService, ClinicDoctor, ClinicTiming, Testimonial, FAQ, BlogPost, HealthPackage, ArchitectureImage } from '../types';

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function applyClinicColors(primary: string, secondary?: string, bookButton?: string) {
  const root = document.documentElement;
  if (primary && /^#[0-9a-fA-F]{6}$/.test(primary)) {
    root.style.setProperty('--color-primary-rgb', hexToRgb(primary));
  }
  if (secondary && /^#[0-9a-fA-F]{6}$/.test(secondary)) {
    root.style.setProperty('--color-secondary-rgb', hexToRgb(secondary));
  }
  if (bookButton && /^#[0-9a-fA-F]{6}$/.test(bookButton)) {
    root.style.setProperty('--color-book-btn', bookButton);
    root.style.setProperty('--color-book-btn-rgb', hexToRgb(bookButton));
  }
}

interface ClinicData {
  clinic: Clinic | null;
  services: ClinicService[];
  doctors: ClinicDoctor[];
  timings: ClinicTiming[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  blogPosts: BlogPost[];
  healthPackages: HealthPackage[];
  architectureImages: ArchitectureImage[];
  loading: boolean;
  error: string | null;
}

export function useClinicData(slug?: string): ClinicData {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [timings, setTimings] = useState<ClinicTiming[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
  const [architectureImages, setArchitectureImages] = useState<ArchitectureImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hostname = typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '') : '';
  const isLocalhost = hostname === 'localhost';

  useEffect(() => {
    fetchAll();
  }, [slug, hostname]);

  async function fetchAll() {
    setLoading(true);
    setError(null);

    const lookupField = isLocalhost ? 'slug' : 'website';
    const lookupValue = isLocalhost ? slug?.trim() ?? '' : hostname;

    if (!lookupValue) {
      setError('Clinic not found');
      setLoading(false);
      return;
    }


    console.log({
      hostname,
      isLocalhost,
      slug,
      lookupField,
      lookupValue
    });

    const { data: clinicData, error: clinicError } = await supabase
      .from('clinics')
      .select('*')
      .eq(lookupField, lookupValue)
      .eq('is_active', true)
      .maybeSingle();

    if (clinicError || !clinicData) {
      setError('Clinic not found');
      setLoading(false);
      return;
    }

    setClinic(clinicData);

    if (clinicData.primary_color) {
      applyClinicColors(clinicData.primary_color, clinicData.secondary_color, clinicData.book_button_color);
    }

    const [servicesRes, doctorsRes, timingsRes, testimonialsRes, faqsRes, blogRes, packagesRes, archRes] = await Promise.all([
      supabase.from('clinic_services').select('*').eq('clinic_id', clinicData.id).eq('is_active', true).order('sort_order'),
      supabase.from('clinic_doctors').select('*').eq('clinic_id', clinicData.id).eq('is_active', true).order('sort_order'),
      supabase.from('clinic_timings').select('*').eq('clinic_id', clinicData.id).order('day_of_week'),
      supabase.from('testimonials').select('*').eq('clinic_id', clinicData.id).order('sort_order'),
      supabase.from('faqs').select('*').eq('clinic_id', clinicData.id).eq('is_active', true).order('sort_order'),
      supabase.from('blog_posts').select('*').eq('clinic_id', clinicData.id).eq('is_active', true).order('sort_order'),
      supabase.from('health_packages').select('*').eq('clinic_id', clinicData.id).eq('is_active', true).order('sort_order'),
      supabase.from('architecture_images').select('*').eq('clinic_id', clinicData.id).eq('is_active', true).order('sort_order'),
    ]);

    if (servicesRes.error) console.error('Failed to fetch services:', servicesRes.error.message);
    if (doctorsRes.error) console.error('Failed to fetch doctors:', doctorsRes.error.message);
    if (timingsRes.error) console.error('Failed to fetch timings:', timingsRes.error.message);
    if (testimonialsRes.error) console.error('Failed to fetch testimonials:', testimonialsRes.error.message);
    if (faqsRes.error) console.error('Failed to fetch FAQs:', faqsRes.error.message);
    if (blogRes.error) console.error('Failed to fetch blog posts:', blogRes.error.message);
    if (packagesRes.error) console.error('Failed to fetch health packages:', packagesRes.error.message);
    if (archRes.error) console.error('Failed to fetch architecture images:', archRes.error.message);

    setServices(servicesRes.data ?? []);
    setDoctors(doctorsRes.data ?? []);
    setTimings(timingsRes.data ?? []);
    setTestimonials(testimonialsRes.data ?? []);
    setFaqs(faqsRes.data ?? []);
    setBlogPosts(blogRes.data ?? []);
    setHealthPackages(packagesRes.data ?? []);
    setArchitectureImages(archRes.data ?? []);
    setLoading(false);
  }

  return { clinic, services, doctors, timings, testimonials, faqs, blogPosts, healthPackages, architectureImages, loading, error };
}
