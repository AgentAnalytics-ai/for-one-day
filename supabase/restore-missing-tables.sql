-- Restore Missing Tables - Fix What the Cleanup Broke
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- ADD MISSING FIELDS TO EXISTING TABLES
-- ============================================================================

-- Add missing fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_relationship TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_access_notes TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_access_enabled BOOLEAN DEFAULT FALSE;

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.family_id IS 'Reference to the user''s family group';
COMMENT ON COLUMN public.profiles.executor_name IS 'Name of the designated executor/trustee for digital legacy';
COMMENT ON COLUMN public.profiles.executor_email IS 'Email of the designated executor/trustee';
COMMENT ON COLUMN public.profiles.executor_phone IS 'Phone number of the designated executor/trustee';
COMMENT ON COLUMN public.profiles.executor_relationship IS 'Relationship of the designated executor/trustee to the user';
COMMENT ON COLUMN public.profiles.emergency_contact_name IS 'Name of the emergency contact person';
COMMENT ON COLUMN public.profiles.emergency_contact_email IS 'Email of the emergency contact person';
COMMENT ON COLUMN public.profiles.emergency_contact_phone IS 'Phone number of the emergency contact person';
COMMENT ON COLUMN public.profiles.emergency_contact_relationship IS 'Relationship of the emergency contact to the user';
COMMENT ON COLUMN public.profiles.emergency_access_notes IS 'Additional notes for emergency access verification';
COMMENT ON COLUMN public.profiles.emergency_access_enabled IS 'Whether emergency access is enabled for legacy notes';

-- ============================================================================
-- CREATE MISSING TABLES
-- ============================================================================

-- Daily Reflections Table (for simple daily reflection system)
CREATE TABLE IF NOT EXISTS public.daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reflection TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

COMMENT ON TABLE public.daily_reflections IS 'Simple daily reflections - one per day per user';

-- User Stats Table (for tracking streaks and usage)
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_streak INTEGER DEFAULT 0,
  total_reflections INTEGER DEFAULT 0,
  total_legacy_notes INTEGER DEFAULT 0,
  last_reflection_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_stats IS 'Simple user statistics and streaks';

-- User Preferences Table (for personalization)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
  role TEXT CHECK (role IN ('parent', 'spouse', 'adult-child', 'executor', 'other')),
  familySituation TEXT CHECK (familySituation IN ('married', 'single-parent', 'adult-child', 'executor', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_preferences IS 'User preferences for personalized experience';

-- Legacy Notes Table (alternative structure for some APIs)
CREATE TABLE IF NOT EXISTS public.legacy_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT,
  recipient_name TEXT,
  recipient_email TEXT,
  is_shared BOOLEAN DEFAULT FALSE,
  shared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.legacy_notes IS 'Legacy notes - alternative structure for some APIs';

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_id ON daily_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_date ON daily_reflections(date);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_notes_user_id ON legacy_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_notes_template_type ON legacy_notes(template_type);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Daily reflections policies
CREATE POLICY "Users can view own reflections" ON daily_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON daily_reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON daily_reflections
  FOR DELETE USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Legacy notes policies
CREATE POLICY "Users can view own legacy notes" ON legacy_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own legacy notes" ON legacy_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own legacy notes" ON legacy_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own legacy notes" ON legacy_notes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_daily_reflections_updated_at ON daily_reflections;
CREATE TRIGGER update_daily_reflections_updated_at
    BEFORE UPDATE ON daily_reflections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_notes_updated_at ON legacy_notes;
CREATE TRIGGER update_legacy_notes_updated_at
    BEFORE UPDATE ON legacy_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CREATE VAULT STORAGE BUCKET FOR VOICE RECORDINGS
-- ============================================================================

-- Create the vault storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault',
  'vault',
  false, -- Private bucket
  10485760, -- 10MB limit for voice recordings
  ARRAY['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg'];

-- Create RLS policies for the vault bucket
CREATE POLICY "Users can upload their own voice recordings" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vault' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own voice recordings" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'vault' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own voice recordings" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'vault' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
