-- Add date field to devotion_themes table for daily devotionals
-- Run this in your Supabase SQL Editor

-- Add date column
ALTER TABLE public.devotion_themes 
ADD COLUMN IF NOT EXISTS date DATE;

-- Create index for date lookups
CREATE INDEX IF NOT EXISTS idx_devotion_themes_date ON public.devotion_themes(date);

-- Update existing records to have today's date (if any exist)
UPDATE public.devotion_themes 
SET date = CURRENT_DATE 
WHERE date IS NULL;

-- Make date column NOT NULL after setting default values
ALTER TABLE public.devotion_themes 
ALTER COLUMN date SET NOT NULL;

-- Add unique constraint to prevent duplicate devotionals for the same date
ALTER TABLE public.devotion_themes 
ADD CONSTRAINT unique_devotion_date UNIQUE (date);
