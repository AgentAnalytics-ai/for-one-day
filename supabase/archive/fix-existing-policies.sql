-- Fix existing policies - handle conflicts gracefully
-- Run this in your Supabase SQL Editor

-- Drop existing policies first, then recreate them
DROP POLICY IF EXISTS "Users can view own reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Users can insert own reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Users can update own reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Users can delete own reflections" ON daily_reflections;

DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;

DROP POLICY IF EXISTS "Users can view own vault items" ON vault_items;
DROP POLICY IF EXISTS "Users can insert own vault items" ON vault_items;
DROP POLICY IF EXISTS "Users can update own vault items" ON vault_items;
DROP POLICY IF EXISTS "Users can delete own vault items" ON vault_items;

-- Recreate the policies
CREATE POLICY "Users can view own reflections" ON daily_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON daily_reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON daily_reflections
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own vault items" ON vault_items
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own vault items" ON vault_items
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own vault items" ON vault_items
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own vault items" ON vault_items
  FOR DELETE USING (auth.uid() = owner_id);

-- Enable RLS on tables
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;

-- Verify tables exist and have data
SELECT 'daily_reflections' as table_name, count(*) as row_count FROM daily_reflections
UNION ALL
SELECT 'user_stats' as table_name, count(*) as row_count FROM user_stats
UNION ALL
SELECT 'vault_items' as table_name, count(*) as row_count FROM vault_items;
