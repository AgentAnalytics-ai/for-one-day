-- ============================================================================
-- QUICK USER CHECK - Simple Version
-- ============================================================================
-- ⚠️ REPLACE 'kcdecker23@outlook.com' with the affected user's email
-- ============================================================================

-- Quick status check
SELECT 
  u.email,
  u.created_at as user_created,
  CASE WHEN p.user_id IS NOT NULL THEN '✅ Has Profile' ELSE '❌ No Profile' END as profile,
  CASE WHEN COUNT(fm.family_id) > 0 THEN '✅ In ' || COUNT(fm.family_id) || ' families' ELSE '❌ No families' END as families
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.family_members fm ON fm.user_id = u.id
WHERE u.email = 'kcdecker23@outlook.com'  -- ⬅️ CHANGE THIS EMAIL
GROUP BY u.id, u.email, u.created_at, p.user_id;

-- ============================================================================
-- INTERPRETATION:
-- ============================================================================
-- If you see "❌ No Profile":
--   → Signup failed due to RLS infinite recursion bug
--   → Fix the RLS policy first, then user can retry signup
--   → No cleanup needed
--
-- If you see "✅ Has Profile":
--   → Profile exists (signup partially succeeded)
--   → Fix the RLS policy to prevent future issues
--   → User should be able to continue normally
-- ============================================================================
