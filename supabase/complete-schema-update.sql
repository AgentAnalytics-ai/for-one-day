-- Complete database schema update for For One Day
-- Run this in your Supabase SQL Editor

-- Add missing date field to devotion_themes
ALTER TABLE public.devotion_themes ADD COLUMN IF NOT EXISTS date DATE;

-- Add index for date lookups
CREATE INDEX IF NOT EXISTS idx_devotion_themes_date ON devotion_themes(date);

-- Add week_start field for weekly themes (optional)
ALTER TABLE public.devotion_themes ADD COLUMN IF NOT EXISTS week_start DATE;

-- Create index for week lookups
CREATE INDEX IF NOT EXISTS idx_devotion_themes_week ON devotion_themes(week_start);

-- Add executor fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_relationship TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.executor_name IS 'Name of the designated executor/trustee for digital legacy.';
COMMENT ON COLUMN public.profiles.executor_email IS 'Email of the designated executor/trustee.';
COMMENT ON COLUMN public.profiles.executor_phone IS 'Phone number of the designated executor/trustee.';
COMMENT ON COLUMN public.profiles.executor_relationship IS 'Relationship of the designated executor/trustee to the user (e.g., spouse, adult child, attorney).';

-- Update the comment to reflect daily devotionals
COMMENT ON TABLE public.devotion_themes IS 'Daily devotional themes (AI-generated content)';

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

-- Ensure profiles table has all necessary fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_access_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_access_notes TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add comments for profile fields
COMMENT ON COLUMN public.profiles.full_name IS 'User full name';
COMMENT ON COLUMN public.profiles.emergency_contact_name IS 'Name of emergency contact person';
COMMENT ON COLUMN public.profiles.emergency_contact_email IS 'Email of emergency contact person';
COMMENT ON COLUMN public.profiles.emergency_contact_phone IS 'Phone number of emergency contact person';
COMMENT ON COLUMN public.profiles.emergency_contact_relationship IS 'Relationship to emergency contact person';
COMMENT ON COLUMN public.profiles.emergency_access_enabled IS 'Whether emergency access is enabled';
COMMENT ON COLUMN public.profiles.emergency_access_notes IS 'Additional notes for emergency access';
COMMENT ON COLUMN public.profiles.plan IS 'User subscription plan (free, pro, lifetime)';
COMMENT ON COLUMN public.profiles.updated_at IS 'Last update timestamp';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
