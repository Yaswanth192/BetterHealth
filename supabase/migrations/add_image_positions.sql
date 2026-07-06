-- Add focal point position columns for clinic images
-- Position is stored as jsonb with x and y percentages (0-100)
-- Default is center (50, 50)

ALTER TABLE clinics ADD COLUMN IF NOT EXISTS hero_image_position jsonb DEFAULT '{"x":50,"y":50}'::jsonb;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS about_hero_image_position jsonb DEFAULT '{"x":50,"y":50}'::jsonb;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS about_image_position jsonb DEFAULT '{"x":50,"y":50}'::jsonb;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS services_heading_image_position jsonb DEFAULT '{"x":50,"y":50}'::jsonb;
