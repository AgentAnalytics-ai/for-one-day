-- ============================================================================
-- IDENTIFY SPAM ACCOUNTS
-- ============================================================================
-- This script helps identify and clean up spam accounts
-- ============================================================================

-- Step 1: Find accounts with suspicious display names
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.full_name as display_name,
  p.plan,
  CASE 
    WHEN p.full_name LIKE '%85.000%' OR p.full_name LIKE '%Lira%' THEN 'SPAM - Turkish scam'
    WHEN p.full_name LIKE '%http%' OR p.full_name LIKE '%https%' THEN 'SPAM - Contains URL'
    WHEN p.full_name LIKE '%bit.ly%' OR p.full_name LIKE '%tinyurl%' THEN 'SPAM - Short URL'
    WHEN u.email LIKE '%+%' AND u.email LIKE '%@gmail.com' THEN 'POSSIBLE SPAM - Gmail alias'
    ELSE 'OK'
  END as spam_indicator
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
ORDER BY u.created_at DESC;

-- Step 2: Count spam vs real accounts
SELECT 
  COUNT(*) FILTER (WHERE 
    p.full_name LIKE '%85.000%' OR 
    p.full_name LIKE '%Lira%' OR
    p.full_name LIKE '%http%' OR
    p.full_name LIKE '%bit.ly%'
  ) as spam_count,
  COUNT(*) FILTER (WHERE 
    p.full_name NOT LIKE '%85.000%' AND 
    p.full_name NOT LIKE '%Lira%' AND
    p.full_name NOT LIKE '%http%' AND
    p.full_name NOT LIKE '%bit.ly%'
  ) as real_count,
  COUNT(*) as total_count
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id;

-- Step 3: Find accounts created in bulk (same minute = likely spam)
SELECT 
  DATE_TRUNC('minute', u.created_at) as creation_minute,
  COUNT(*) as accounts_created,
  STRING_AGG(u.email, ', ') as emails
FROM auth.users u
GROUP BY DATE_TRUNC('minute', u.created_at)
HAVING COUNT(*) > 5  -- More than 5 accounts in same minute = suspicious
ORDER BY creation_minute DESC;

-- Step 4: Find accounts that never signed in (likely spam)
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  p.full_name,
  CASE WHEN u.last_sign_in_at IS NULL THEN 'Never signed in' ELSE 'Has signed in' END as status
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE u.last_sign_in_at IS NULL
  AND u.created_at < NOW() - INTERVAL '1 day'  -- Created more than 1 day ago
ORDER BY u.created_at DESC;

-- ============================================================================
-- CLEANUP RECOMMENDATIONS:
-- ============================================================================
-- 1. Delete spam accounts (be careful - backup first!):
--    DELETE FROM auth.users WHERE id IN (
--      SELECT u.id FROM auth.users u
--      JOIN public.profiles p ON p.user_id = u.id
--      WHERE p.full_name LIKE '%85.000%' OR p.full_name LIKE '%Lira%'
--    );
--
-- 2. Add spam protection to signup:
--    - Email verification (required)
--    - Rate limiting (max 3 signups per IP per hour)
--    - CAPTCHA (reCAPTCHA v3)
--    - Display name validation (no URLs, no spam keywords)
-- ============================================================================
