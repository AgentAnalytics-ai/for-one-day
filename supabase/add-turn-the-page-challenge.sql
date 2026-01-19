-- Add Turn the Page Challenge AI Insights Column
-- This migration creates the table if needed, then adds AI insights column
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Step 1: Create daily_reflections table if it doesn't exist
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

-- Step 2: Add media_urls column if table exists but column doesn't
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

-- Step 3: Add turn_the_page_insights column if it doesn't exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reflections') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'daily_reflections' 
                    AND column_name = 'turn_the_page_insights') THEN
    ALTER TABLE public.daily_reflections 
    ADD COLUMN turn_the_page_insights JSONB;
  END IF;
END $$;

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date 
ON daily_reflections(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_reflections_insights 
ON daily_reflections USING GIN (turn_the_page_insights)
WHERE turn_the_page_insights IS NOT NULL;

-- Step 5: Add comments for documentation
COMMENT ON TABLE public.daily_reflections IS 'Daily reflections with optional images and AI insights - one per day per user';
COMMENT ON COLUMN public.daily_reflections.media_urls IS 'Array of storage paths for images attached to this reflection';
COMMENT ON COLUMN public.daily_reflections.turn_the_page_insights IS 
'AI-powered insights from Turn the Page Challenge - stores analysis of Bible photos connecting verse, photo, and reflection';

-- Step 6: Enable RLS (if not already enabled)
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies (drop and recreate to ensure they exist)
DROP POLICY IF EXISTS "Users can view own reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Users can insert own reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Users can update own reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Users can delete own reflections" ON daily_reflections;

CREATE POLICY "Users can view own reflections" ON daily_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON daily_reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON daily_reflections
  FOR DELETE USING (auth.uid() = user_id);

-- ✅ Done! The daily_reflections table is now ready with Turn the Page Challenge support.
