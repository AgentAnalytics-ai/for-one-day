-- Clean Minimal Schema - Only What We Actually Use
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- DROP UNUSED TABLES (if they exist)
-- ============================================================================
DROP TABLE IF EXISTS public.quiz_results CASCADE;
DROP TABLE IF EXISTS public.user_engagement CASCADE;
DROP TABLE IF EXISTS public.table_talk_decks CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.devotion_themes CASCADE;
DROP TABLE IF EXISTS public.devotion_entries CASCADE;
DROP TABLE IF EXISTS public.daily_reflections CASCADE;
DROP TABLE IF EXISTS public.delivery_recipients CASCADE;
DROP TABLE IF EXISTS public.template_usage CASCADE;
DROP TABLE IF EXISTS public.subscription_events CASCADE;
DROP TABLE IF EXISTS public.emergency_access_requests CASCADE;

-- ============================================================================
-- CORE TABLES (What We Actually Use)
-- ============================================================================

-- PROFILES (with all needed fields)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  family_id uuid references families(id),
  -- Executor fields
  executor_name text,
  executor_email text,
  executor_phone text,
  executor_relationship text,
  -- Emergency contact fields
  emergency_contact_name text,
  emergency_contact_email text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  emergency_access_notes text,
  emergency_access_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

COMMENT ON TABLE public.profiles IS 'User profiles with executor and emergency contact info';

-- FAMILIES (for sharing)
CREATE TABLE IF NOT EXISTS public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

COMMENT ON TABLE public.families IS 'Family groups for sharing legacy notes';

-- FAMILY MEMBERS (for sharing permissions)
CREATE TABLE IF NOT EXISTS public.family_members (
  family_id uuid references families(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'spouse', 'child', 'viewer')),
  joined_at timestamptz default now(),
  primary key (family_id, user_id)
);

COMMENT ON TABLE public.family_members IS 'Family membership with roles';

-- VAULT ITEMS (legacy notes - the main feature)
CREATE TABLE IF NOT EXISTS public.vault_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('letter', 'video', 'audio', 'document', 'photo')),
  title text not null,
  description text,
  storage_path text,
  file_size_bytes bigint,
  mime_type text,
  encrypted boolean default false,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

COMMENT ON TABLE public.vault_items IS 'Legacy notes and letters - the heart of For One Day';

-- SUBSCRIPTIONS (Stripe billing)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null,
  price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

COMMENT ON TABLE public.subscriptions IS 'Stripe subscription data';

-- USER PREFERENCES (personalization)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gender text check (gender in ('male', 'female', 'other', 'prefer-not-to-say')),
  role text check (role in ('parent', 'spouse', 'adult-child', 'executor', 'other')),
  familySituation text check (familySituation in ('married', 'single-parent', 'adult-child', 'executor', 'other')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

COMMENT ON TABLE public.user_preferences IS 'User preferences for personalized experience';

-- USER STATS (for streak tracking)
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reflection_streak integer default 0,
  total_reflections integer default 0,
  total_legacy_notes integer default 0,
  last_reflection_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

COMMENT ON TABLE public.user_stats IS 'Simple user statistics and streaks';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_family_id ON profiles(family_id);
CREATE INDEX IF NOT EXISTS idx_families_owner_id ON families(owner_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_family_id ON vault_items(family_id, created_at desc);
CREATE INDEX IF NOT EXISTS idx_vault_items_owner_id ON vault_items(owner_id, created_at desc);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Families policies
CREATE POLICY "Users can view own families" ON families
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own families" ON families
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own families" ON families
  FOR UPDATE USING (auth.uid() = owner_id);

-- Family members policies
CREATE POLICY "Users can view family members of their families" ON family_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = family_members.family_id 
      AND families.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert family members to their families" ON family_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = family_members.family_id 
      AND families.owner_id = auth.uid()
    )
  );

-- Vault items policies
CREATE POLICY "Users can view vault items from their families" ON vault_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = vault_items.family_id 
      AND families.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert vault items to their families" ON vault_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = vault_items.family_id 
      AND families.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update vault items from their families" ON vault_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = vault_items.family_id 
      AND families.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete vault items from their families" ON vault_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = vault_items.family_id 
      AND families.owner_id = auth.uid()
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Create function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at
    BEFORE UPDATE ON families
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_items_updated_at
    BEFORE UPDATE ON vault_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
