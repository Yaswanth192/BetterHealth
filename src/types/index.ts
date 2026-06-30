export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
export type AdminRole = 'admin' | 'staff' | 'developer';

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo_url: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  primary_color: string;
  secondary_color: string;
  emergency_phone: string;
  whatsapp_number: string;
  founded_year: number;
  google_maps_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
  book_button_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  years_of_service: number;
  patients_treated: string;
  google_rating: number;
  research_papers: string;
  successful_surgeries: string;
  awards_won: number;
  combined_experience: string;
  hero_headline: string;
  hero_subtitle: string;
  cta_headline: string;
  cta_description: string;
  emergency_title: string;
  footer_description: string;
  footer_tagline: string;
  opening_hours_display: string;
  process_steps: Array<{ title: string; description: string }>;
  hero_image_url: string;
  about_image_url: string;
  doctors_section_subtitle: string;
  testimonials_section_subtitle: string;
  reviews_hero_subtitle: string;
  section_settings: Record<string, { show: boolean; useDummies: boolean }>;
}

export interface ClinicService {
  id: string;
  clinic_id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  features: string[];
  consultation_fee: number;
  follow_up_fee: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ClinicDoctor {
  id: string;
  clinic_id: string;
  name: string;
  specialization: string;
  bio: string;
  image_url: string;
  qualifications: string[];
  experience_years: number;
  languages: string[];
  is_director: boolean;
  director_bio: string;
  director_quote: string;
  available_days: string[];
  open_time: string;
  close_time: string;
  whatsapp_number: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ClinicTiming {
  id: string;
  clinic_id: string;
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  doctor_id: string | null;
  service_id: string | null;
  preferred_date: string;
  preferred_time: string;
  message: string;
  status: AppointmentStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  clinic_doctors?: ClinicDoctor;
  clinic_services?: ClinicService;
}

export interface ContactMessage {
  id: string;
  clinic_id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  clinic_id: string;
  patient_name: string;
  patient_avatar_url: string;
  rating: number;
  message: string;
  designation: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface FAQ {
  id: string;
  clinic_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ClinicAdmin {
  id: string;
  clinic_id: string | null;
  user_id: string;
  role: AdminRole;
  created_at: string;
}

export interface BlogPost {
  id: string;
  clinic_id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  read_time: string;
  author: string;
  publish_date: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface InsuranceProvider {
  id: string;
  clinic_id: string;
  name: string;
  logo_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Certification {
  id: string;
  clinic_id: string;
  name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface HealthPackage {
  id: string;
  clinic_id: string;
  name: string;
  price: number;
  features: string[];
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ArchitectureImage {
  id: string;
  clinic_id: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}
