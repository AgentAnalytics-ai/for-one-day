-- Add Bible Reading Fields to daily_reflections
-- Extends existing table for Turn the Page Challenge
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Step 1: Add bible_book column
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reflections') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'daily_reflections' 
                    AND column_name = 'bible_book') THEN
    ALTER TABLE public.daily_reflections 
    ADD COLUMN bible_book TEXT;
  END IF;
END $$;

-- Step 2: Add bible_chapter column
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reflections') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'daily_reflections' 
                    AND column_name = 'bible_chapter') THEN
    ALTER TABLE public.daily_reflections 
    ADD COLUMN bible_chapter INTEGER;
  END IF;
END $$;

-- Step 3: Add day_number column
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reflections') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'daily_reflections' 
                    AND column_name = 'day_number') THEN
    ALTER TABLE public.daily_reflections 
    ADD COLUMN day_number INTEGER;
  END IF;
END $$;

-- Step 4: Add quick_note column
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reflections') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'daily_reflections' 
                    AND column_name = 'quick_note') THEN
    ALTER TABLE public.daily_reflections 
    ADD COLUMN quick_note TEXT;
  END IF;
END $$;

-- Step 5: Add index for Bible reading queries
CREATE INDEX IF NOT EXISTS idx_daily_reflections_bible 
ON daily_reflections(user_id, bible_book, bible_chapter);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.daily_reflections.bible_book IS 'Bible book name (e.g., Genesis, Psalms) for Turn the Page Challenge';
COMMENT ON COLUMN public.daily_reflections.bible_chapter IS 'Bible chapter number for Turn the Page Challenge';
COMMENT ON COLUMN public.daily_reflections.day_number IS 'Day number in the 730-day reading plan (1-730)';
COMMENT ON COLUMN public.daily_reflections.quick_note IS 'Optional quick note for Bible reading (voice-to-text or one-line)';

-- ✅ Done! The daily_reflections table now supports Bible reading progress tracking.
