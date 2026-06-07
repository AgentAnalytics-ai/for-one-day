-- Initialize user stats for existing users
-- Run this in your Supabase SQL Editor

-- Get your user ID first (replace with your actual user ID)
-- You can find this in Supabase Auth > Users

-- Create user_stats record for users who don't have one
INSERT INTO user_stats (user_id, total_reflections, total_legacy_notes, total_family_connections, last_reflection_date)
SELECT 
  p.user_id,
  COALESCE(dr.reflection_count, 0) as total_reflections,
  COALESCE(vi.legacy_count, 0) as total_legacy_notes,
  0 as total_family_connections,
  dr.last_reflection_date
FROM profiles p
LEFT JOIN (
  SELECT 
    user_id, 
    COUNT(*) as reflection_count,
    MAX(date) as last_reflection_date
  FROM daily_reflections 
  GROUP BY user_id
) dr ON p.user_id = dr.user_id
LEFT JOIN (
  SELECT 
    owner_id, 
    COUNT(*) as legacy_count
  FROM vault_items 
  GROUP BY owner_id
) vi ON p.user_id = vi.owner_id
WHERE NOT EXISTS (
  SELECT 1 FROM user_stats us WHERE us.user_id = p.user_id
);

-- Verify the results
SELECT 
  us.user_id,
  us.total_reflections,
  us.total_legacy_notes,
  us.total_family_connections,
  us.last_reflection_date
FROM user_stats us
JOIN profiles p ON us.user_id = p.user_id
ORDER BY us.created_at DESC;
