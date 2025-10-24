-- Engagement and Gamification Schema
-- Run this in your Supabase SQL Editor

-- User engagement tracking table
CREATE TABLE IF NOT EXISTS public.user_engagement (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  devotions_completed INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  legacy_notes_created INTEGER DEFAULT 0,
  total_quiz_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_devotion_date TIMESTAMPTZ,
  last_quiz_date TIMESTAMPTZ,
  last_legacy_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  devotional_title TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Family flow sessions (tracking family discussions)
CREATE TABLE IF NOT EXISTS public.family_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  devotional_id UUID REFERENCES devotion_themes(id) ON DELETE SET NULL,
  discussion_prompts JSONB NOT NULL,
  participants JSONB,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_family_sessions_user_id ON family_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_family_sessions_family_id ON family_sessions(family_id);

-- Add comments
COMMENT ON TABLE public.user_engagement IS 'Tracks user engagement metrics and streaks';
COMMENT ON TABLE public.quiz_results IS 'Stores quiz completion results and scores';
COMMENT ON TABLE public.user_achievements IS 'Tracks user achievements and badges';
COMMENT ON TABLE public.family_sessions IS 'Tracks family discussion sessions';

-- RLS Policies
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_sessions ENABLE ROW LEVEL SECURITY;

-- User engagement policies
CREATE POLICY "Users can view own engagement" ON user_engagement
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own engagement" ON user_engagement
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own engagement" ON user_engagement
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quiz results policies
CREATE POLICY "Users can view own quiz results" ON quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results" ON quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Family sessions policies
CREATE POLICY "Users can view own family sessions" ON family_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own family sessions" ON family_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family sessions" ON family_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_engagement table
DROP TRIGGER IF EXISTS update_user_engagement_updated_at ON user_engagement;
CREATE TRIGGER update_user_engagement_updated_at
    BEFORE UPDATE ON user_engagement
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
