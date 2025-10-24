-- Missing Tables - Critical Schema Fixes
-- Run this in your Supabase SQL Editor

-- 1. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
  role TEXT CHECK (role IN ('parent', 'spouse', 'adult-child', 'executor', 'other')),
  familySituation TEXT CHECK (familySituation IN ('married', 'single-parent', 'adult-child', 'executor', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_preferences IS 'User preferences for personalized experience';

-- 2. User Stats Table
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

-- 3. Daily Reflections Table
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

-- 4. Legacy Notes Table (alternative to vault_items for some APIs)
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

-- 5. User Engagement Table
CREATE TABLE IF NOT EXISTS public.user_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  devotion_streak INTEGER DEFAULT 0,
  spiritual_growth_level INTEGER DEFAULT 1,
  spiritual_growth_progress INTEGER DEFAULT 0,
  weekly_reflections INTEGER DEFAULT 0,
  quiz_average DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_engagement IS 'User engagement metrics and gamification';

-- 6. Quiz Results Table
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.quiz_results IS 'Quiz results and scores';

-- 7. Emergency Access Requests Table
CREATE TABLE IF NOT EXISTS public.emergency_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  relationship TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.emergency_access_requests IS 'Emergency access requests for legacy notes';

-- 8. Delivery Recipients Table
CREATE TABLE IF NOT EXISTS public.delivery_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_item_id UUID NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  delivery_date TIMESTAMPTZ,
  delivery_status TEXT DEFAULT 'scheduled' CHECK (delivery_status IN ('scheduled', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.delivery_recipients IS 'Scheduled delivery recipients for legacy notes';

-- 9. Template Usage Table
CREATE TABLE IF NOT EXISTS public.template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  vault_item_id UUID REFERENCES vault_items(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.template_usage IS 'Track template usage for analytics';

-- 10. Subscription Events Table
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.subscription_events IS 'Stripe subscription events for audit trail';

-- Enable RLS on all tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reflections" ON daily_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON daily_reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own legacy notes" ON legacy_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own legacy notes" ON legacy_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own legacy notes" ON legacy_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own legacy notes" ON legacy_notes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own engagement" ON user_engagement
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own engagement" ON user_engagement
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own engagement" ON user_engagement
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz results" ON quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results" ON quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own emergency requests" ON emergency_access_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency requests" ON emergency_access_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own delivery recipients" ON delivery_recipients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own delivery recipients" ON delivery_recipients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own template usage" ON template_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own template usage" ON template_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_id ON daily_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_date ON daily_reflections(date);
CREATE INDEX IF NOT EXISTS idx_legacy_notes_user_id ON legacy_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_notes_template_type ON legacy_notes(template_type);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_access_user_id ON emergency_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_recipients_vault_item ON delivery_recipients(vault_item_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_user_id ON template_usage(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reflections_updated_at
    BEFORE UPDATE ON daily_reflections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legacy_notes_updated_at
    BEFORE UPDATE ON legacy_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_engagement_updated_at
    BEFORE UPDATE ON user_engagement
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
