import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clinic, ClinicService, ClinicDoctor, ClinicTiming, Testimonial, FAQ } from '../types';

interface ClinicData {
  clinic: Clinic | null;
  services: ClinicService[];
  doctors: ClinicDoctor[];
  timings: ClinicTiming[];
  testimonials: Testimonial[];
  faqs: FAQ[];
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

    const [servicesRes, doctorsRes, timingsRes, testimonialsRes, faqsRes] = await Promise.all([
      supabase.from('clinic_services').select('*').eq('clinic_id', clinicData.id).eq('is_active', true).order('sort_order'),
      supabase.from('clinic_doctors').select('*').eq('clinic_id', clinicData.id).eq('is_active', true).order('sort_order'),
      supabase.from('clinic_timings').select('*').eq('clinic_id', clinicData.id).order('day_of_week'),
      supabase.from('testimonials').select('*').eq('clinic_id', clinicData.id).order('sort_order'),
      supabase.from('faqs').select('*').eq('clinic_id', clinicData.id).eq('is_active', true).order('sort_order'),
    ]);

    if (servicesRes.error) console.error('Failed to fetch services:', servicesRes.error.message);
    if (doctorsRes.error) console.error('Failed to fetch doctors:', doctorsRes.error.message);
    if (timingsRes.error) console.error('Failed to fetch timings:', timingsRes.error.message);
    if (testimonialsRes.error) console.error('Failed to fetch testimonials:', testimonialsRes.error.message);
    if (faqsRes.error) console.error('Failed to fetch FAQs:', faqsRes.error.message);

    setServices(servicesRes.data ?? []);
    setDoctors(doctorsRes.data ?? []);
    setTimings(timingsRes.data ?? []);
    setTestimonials(testimonialsRes.data ?? []);
    setFaqs(faqsRes.data ?? []);
    setLoading(false);
  }

  return { clinic, services, doctors, timings, testimonials, faqs, loading, error };
}
