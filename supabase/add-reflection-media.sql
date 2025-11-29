-- Add media support to daily_reflections table
-- This allows storing image URLs with daily reflections

ALTER TABLE public.daily_reflections 
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';

-- Add index for performance when querying by date
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date 
ON daily_reflections(user_id, date DESC);

COMMENT ON COLUMN public.daily_reflections.media_urls IS 'Array of image URLs attached to this reflection';

-- ✅ Done! Reflections can now store multiple image URLs.

