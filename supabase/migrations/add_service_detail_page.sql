-- Add detail page columns to clinic_services
-- Run this migration to enable the "Learn More" service detail pages

ALTER TABLE clinic_services 
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS content_sections jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;

-- Unique index: slug must be unique per clinic (nullable rows ignored)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinic_services_slug 
ON clinic_services (clinic_id, slug) WHERE slug IS NOT NULL;
