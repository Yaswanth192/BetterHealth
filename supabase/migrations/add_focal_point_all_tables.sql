-- Add focal point position and zoom columns for all image tables
-- Position is stored as jsonb with x and y percentages (0-100), default center (50, 50)
-- Zoom is a decimal between 1 and 2, default 1 (no zoom)

-- Doctor photos
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS image_position jsonb DEFAULT '{"x":50,"y":50}'::jsonb;
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS image_zoom numeric DEFAULT 1;

-- Hospital/architecture images
ALTER TABLE architecture_images ADD COLUMN IF NOT EXISTS image_position jsonb DEFAULT '{"x":50,"y":50}'::jsonb;
ALTER TABLE architecture_images ADD COLUMN IF NOT EXISTS image_zoom numeric DEFAULT 1;

-- Blog posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_position jsonb DEFAULT '{"x":50,"y":50}'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_zoom numeric DEFAULT 1;

-- Service images
ALTER TABLE clinic_services ADD COLUMN IF NOT EXISTS image_position jsonb DEFAULT '{"x":50,"y":50}'::jsonb;
ALTER TABLE clinic_services ADD COLUMN IF NOT EXISTS image_zoom numeric DEFAULT 1;
