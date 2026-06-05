
/*
  # Clinic System - Core Tables (Part 1)

  ## New Tables
  1. clinics - Main clinic configuration
  2. clinic_admins - Links users to clinics with roles

  ## Security
  - RLS enabled on both tables
  - Public read for active clinics
  - Authenticated users can view their own admin records
  - Self-referencing developer check handled via a helper approach
*/

-- ==========================================
-- CLINICS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  slug text UNIQUE NOT NULL,
  tagline text DEFAULT '',
  description text DEFAULT '',
  logo_url text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  zip text DEFAULT '',
  website text DEFAULT '',
  primary_color text DEFAULT '#0ea5e9',
  secondary_color text DEFAULT '#0284c7',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- CLINIC ADMINS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS clinic_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'developer')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_admins ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinics_slug ON clinics(slug);
CREATE INDEX IF NOT EXISTS idx_clinic_admins_user_id ON clinic_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_admins_clinic_id ON clinic_admins(clinic_id);

-- ==========================================
-- RLS POLICIES - CLINICS
-- ==========================================
CREATE POLICY "Public can read active clinics"
  ON clinics FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view their clinic"
  ON clinics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.clinic_id = clinics.id
      AND clinic_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Developers can insert clinics"
  ON clinics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.user_id = auth.uid()
      AND clinic_admins.role = 'developer'
    )
  );

CREATE POLICY "Developers can update any clinic"
  ON clinics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.user_id = auth.uid()
      AND clinic_admins.role = 'developer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins
      WHERE clinic_admins.user_id = auth.uid()
      AND clinic_admins.role = 'developer'
    )
  );

-- ==========================================
-- RLS POLICIES - CLINIC ADMINS
-- ==========================================
CREATE POLICY "Users can view their own admin records"
  ON clinic_admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Developers can view all admin records"
  ON clinic_admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins ca2
      WHERE ca2.user_id = auth.uid()
      AND ca2.role = 'developer'
    )
  );

CREATE POLICY "Developers can insert admin records"
  ON clinic_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins ca2
      WHERE ca2.user_id = auth.uid()
      AND ca2.role = 'developer'
    )
  );

CREATE POLICY "Developers can update admin records"
  ON clinic_admins FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins ca2
      WHERE ca2.user_id = auth.uid()
      AND ca2.role = 'developer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_admins ca2
      WHERE ca2.user_id = auth.uid()
      AND ca2.role = 'developer'
    )
  );

CREATE POLICY "Developers can delete admin records"
  ON clinic_admins FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinic_admins ca2
      WHERE ca2.user_id = auth.uid()
      AND ca2.role = 'developer'
    )
  );
