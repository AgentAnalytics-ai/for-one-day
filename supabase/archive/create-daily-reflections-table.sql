-- Create daily_reflections table if it doesn't exist
-- This includes the media_urls column for images

CREATE TABLE IF NOT EXISTS public.daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reflection TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Add media_urls column if table exists but column doesn't
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reflections') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'daily_reflections' 
                    AND column_name = 'media_urls') THEN
    ALTER TABLE public.daily_reflections 
    ADD COLUMN media_urls TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date 
ON daily_reflections(user_id, date DESC);

-- Add comments
COMMENT ON TABLE public.daily_reflections IS 'Daily reflections with optional images - one per day per user';
COMMENT ON COLUMN public.daily_reflections.media_urls IS 'Array of storage paths for images attached to this reflection';

-- Enable RLS
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Users can insert own reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Users can update own reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Users can delete own reflections" ON daily_reflections;

-- Create RLS policies
CREATE POLICY "Users can view own reflections" ON daily_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON daily_reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON daily_reflections
  FOR DELETE USING (auth.uid() = user_id);

-- ✅ Done! The daily_reflections table is ready with media support.

