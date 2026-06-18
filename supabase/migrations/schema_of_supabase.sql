-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.clinics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT ''::text,
  slug text NOT NULL UNIQUE,
  tagline text DEFAULT ''::text,
  description text DEFAULT ''::text,
  logo_url text DEFAULT ''::text,
  phone text DEFAULT ''::text,
  email text DEFAULT ''::text,
  address text DEFAULT ''::text,
  city text DEFAULT ''::text,
  state text DEFAULT ''::text,
  zip text DEFAULT ''::text,
  website text DEFAULT ''::text,
  primary_color text DEFAULT '#0ea5e9'::text,
  secondary_color text DEFAULT '#0284c7'::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  emergency_phone text DEFAULT ''::text,
  whatsapp_number text DEFAULT ''::text,
  founded_year integer DEFAULT (EXTRACT(year FROM now()))::integer,
  google_maps_url text DEFAULT ''::text,
  facebook_url text DEFAULT ''::text,
  instagram_url text DEFAULT ''::text,
  youtube_url text DEFAULT ''::text,
  twitter_url text DEFAULT ''::text,
  CONSTRAINT clinics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clinic_admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'staff'::text CHECK (role = ANY (ARRAY['admin'::text, 'staff'::text, 'developer'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clinic_admins_pkey PRIMARY KEY (id),
  CONSTRAINT clinic_admins_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);
CREATE TABLE public.clinic_services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  title text NOT NULL DEFAULT ''::text,
  description text DEFAULT ''::text,
  icon text DEFAULT 'stethoscope'::text,
  image_url text DEFAULT ''::text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  features ARRAY DEFAULT '{}'::text[],
  consultation_fee integer DEFAULT 0,
  follow_up_fee integer DEFAULT 0,
  CONSTRAINT clinic_services_pkey PRIMARY KEY (id),
  CONSTRAINT clinic_services_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);
CREATE TABLE public.clinic_doctors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  name text NOT NULL DEFAULT ''::text,
  specialization text DEFAULT ''::text,
  bio text DEFAULT ''::text,
  image_url text DEFAULT ''::text,
  qualifications ARRAY DEFAULT '{}'::text[],
  experience_years integer DEFAULT 0,
  available_days ARRAY DEFAULT '{}'::text[],
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  open_time text NOT NULL DEFAULT '06:00'::text,
  close_time text NOT NULL DEFAULT '21:00'::text,
  languages ARRAY DEFAULT '{English,Hindi}'::text[],
  is_director boolean DEFAULT false,
  director_bio text DEFAULT ''::text,
  director_quote text DEFAULT ''::text,
  CONSTRAINT clinic_doctors_pkey PRIMARY KEY (id),
  CONSTRAINT clinic_doctors_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);
CREATE TABLE public.clinic_timings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  day_of_week text NOT NULL CHECK (day_of_week = ANY (ARRAY['monday'::text, 'tuesday'::text, 'wednesday'::text, 'thursday'::text, 'friday'::text, 'saturday'::text, 'sunday'::text])),
  open_time text DEFAULT '09:00'::text,
  close_time text DEFAULT '17:00'::text,
  is_closed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clinic_timings_pkey PRIMARY KEY (id),
  CONSTRAINT clinic_timings_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  patient_name text NOT NULL DEFAULT ''::text,
  patient_email text NOT NULL DEFAULT ''::text,
  patient_phone text DEFAULT ''::text,
  doctor_id uuid,
  service_id uuid,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL DEFAULT ''::text,
  message text DEFAULT ''::text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'rejected'::text, 'completed'::text, 'cancelled'::text])),
  notes text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id),
  CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.clinic_doctors(id),
  CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.clinic_services(id)
);
CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  name text NOT NULL DEFAULT ''::text,
  email text NOT NULL DEFAULT ''::text,
  phone text DEFAULT ''::text,
  subject text DEFAULT ''::text,
  message text NOT NULL DEFAULT ''::text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id),
  CONSTRAINT contact_messages_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);
CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  patient_name text NOT NULL DEFAULT ''::text,
  patient_avatar_url text DEFAULT ''::text,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  message text NOT NULL DEFAULT ''::text,
  designation text DEFAULT ''::text,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT testimonials_pkey PRIMARY KEY (id),
  CONSTRAINT testimonials_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);
CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  question text NOT NULL DEFAULT ''::text,
  answer text NOT NULL DEFAULT ''::text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faqs_pkey PRIMARY KEY (id),
  CONSTRAINT faqs_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  title text NOT NULL DEFAULT ''::text,
  excerpt text DEFAULT ''::text,
  content text DEFAULT ''::text,
  category text DEFAULT ''::text,
  image_url text DEFAULT ''::text,
  read_time text DEFAULT '5 min read'::text,
  author text DEFAULT ''::text,
  publish_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id),
  CONSTRAINT blog_posts_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);
CREATE TABLE public.insurance_providers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  name text NOT NULL DEFAULT ''::text,
  logo_url text DEFAULT ''::text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT insurance_providers_pkey PRIMARY KEY (id),
  CONSTRAINT insurance_providers_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);
CREATE TABLE public.certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  name text NOT NULL DEFAULT ''::text,
  icon text DEFAULT 'shield'::text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT certifications_pkey PRIMARY KEY (id),
  CONSTRAINT certifications_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);
CREATE TABLE public.health_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  name text NOT NULL DEFAULT ''::text,
  price integer DEFAULT 0,
  features ARRAY DEFAULT '{}'::text[],
  is_popular boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT health_packages_pkey PRIMARY KEY (id),
  CONSTRAINT health_packages_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id)
);