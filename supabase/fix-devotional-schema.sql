-- Fix devotional schema to support daily devotionals
-- Run this in your Supabase SQL Editor

-- Add missing date field to devotion_themes
ALTER TABLE public.devotion_themes ADD COLUMN IF NOT EXISTS date DATE;

-- Add index for date lookups
CREATE INDEX IF NOT EXISTS idx_devotion_themes_date ON devotion_themes(date);

-- Update the comment to reflect daily devotionals
COMMENT ON TABLE public.devotion_themes IS 'Daily devotional themes (AI-generated content)';

-- Add week_start field for weekly themes (optional)
ALTER TABLE public.devotion_themes ADD COLUMN IF NOT EXISTS week_start DATE;

-- Create index for week lookups
CREATE INDEX IF NOT EXISTS idx_devotion_themes_week ON devotion_themes(week_start);

-- Update RLS policies for devotion_themes
DROP POLICY IF EXISTS "Anyone can view active devotion themes" ON devotion_themes;
CREATE POLICY "Anyone can view active devotion themes" ON devotion_themes
  FOR SELECT USING (is_active = true);

-- Add policy for inserting devotion themes (for AI generation)
DROP POLICY IF EXISTS "Authenticated users can insert devotion themes" ON devotion_themes;
CREATE POLICY "Authenticated users can insert devotion themes" ON devotion_themes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add policy for updating devotion themes
DROP POLICY IF EXISTS "Authenticated users can update devotion themes" ON devotion_themes;
CREATE POLICY "Authenticated users can update devotion themes" ON devotion_themes
  FOR UPDATE USING (auth.role() = 'authenticated');
