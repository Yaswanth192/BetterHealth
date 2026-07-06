-- Add zoom level columns for clinic images
-- Zoom is a decimal between 1 and 2, default is 1 (no zoom)

ALTER TABLE clinics ADD COLUMN IF NOT EXISTS hero_image_zoom numeric DEFAULT 1;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS about_hero_image_zoom numeric DEFAULT 1;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS about_image_zoom numeric DEFAULT 1;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS services_heading_image_zoom numeric DEFAULT 1;
