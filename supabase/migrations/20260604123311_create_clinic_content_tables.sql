
/*
  # Clinic System - Content Tables (Part 2)

  ## New Tables
  1. clinic_services - Services offered by clinics
  2. clinic_doctors - Doctor profiles
  3. clinic_timings - Operating hours
  4. appointments - Patient appointment requests
  5. contact_messages - Contact form submissions
  6. testimonials - Patient testimonials
  7. faqs - Frequently asked questions

  ## Security
  - RLS enabled on all tables
  - Public read for published content
  - Clinic admins manage their own clinic data
  - Anyone can submit appointments and contact messages
*/

-- ==========================================
-- CLINIC SERVICES
-- ==========================================
CREATE TABLE IF NOT EXISTS clinic_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  icon text DEFAULT 'stethoscope',
  image_url text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active services"
  ON clinic_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Clinic admins can insert services"
  ON clinic_services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinic_services.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can update services"
  ON clinic_services FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinic_services.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinic_services.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can delete services"
  ON clinic_services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinic_services.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

-- ==========================================
-- CLINIC DOCTORS
-- ==========================================
CREATE TABLE IF NOT EXISTS clinic_doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  specialization text DEFAULT '',
  bio text DEFAULT '',
  image_url text DEFAULT '',
  qualifications text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  available_days text[] DEFAULT '{}',
  available_times text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active doctors"
  ON clinic_doctors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Clinic admins can insert doctors"
  ON clinic_doctors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinic_doctors.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can update doctors"
  ON clinic_doctors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinic_doctors.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinic_doctors.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can delete doctors"
  ON clinic_doctors FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinic_doctors.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

-- ==========================================
-- CLINIC TIMINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS clinic_timings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  open_time text DEFAULT '09:00',
  close_time text DEFAULT '17:00',
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(clinic_id, day_of_week)
);

ALTER TABLE clinic_timings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read clinic timings"
  ON clinic_timings FOR SELECT
  USING (true);

CREATE POLICY "Clinic admins can insert timings"
  ON clinic_timings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinic_timings.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can update timings"
  ON clinic_timings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinic_timings.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinic_timings.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

-- ==========================================
-- APPOINTMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_name text NOT NULL DEFAULT '',
  patient_email text NOT NULL DEFAULT '',
  patient_phone text DEFAULT '',
  doctor_id uuid REFERENCES clinic_doctors(id) ON DELETE SET NULL,
  service_id uuid REFERENCES clinic_services(id) ON DELETE SET NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL DEFAULT '',
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','completed','cancelled')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clinic admins can view their clinic appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = appointments.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can update their clinic appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = appointments.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = appointments.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can delete their clinic appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = appointments.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

-- ==========================================
-- CONTACT MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  subject text DEFAULT '',
  message text NOT NULL DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clinic admins can view their contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = contact_messages.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can update their contact messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = contact_messages.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = contact_messages.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

-- ==========================================
-- TESTIMONIALS
-- ==========================================
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_name text NOT NULL DEFAULT '',
  patient_avatar_url text DEFAULT '',
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  message text NOT NULL DEFAULT '',
  designation text DEFAULT '',
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read testimonials"
  ON testimonials FOR SELECT
  USING (true);

CREATE POLICY "Clinic admins can insert testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = testimonials.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = testimonials.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = testimonials.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = testimonials.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

-- ==========================================
-- FAQS
-- ==========================================
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  question text NOT NULL DEFAULT '',
  answer text NOT NULL DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active FAQs"
  ON faqs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Clinic admins can insert FAQs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = faqs.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can update FAQs"
  ON faqs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = faqs.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = faqs.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinic admins can delete FAQs"
  ON faqs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = faqs.clinic_id
      AND clinic_admins.user_id = auth.uid()
    )
  );

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_preferred_date ON appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_contact_messages_clinic_id ON contact_messages(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_services_clinic_id ON clinic_services(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_doctors_clinic_id ON clinic_doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_clinic_id ON testimonials(clinic_id);
CREATE INDEX IF NOT EXISTS idx_faqs_clinic_id ON faqs(clinic_id);
