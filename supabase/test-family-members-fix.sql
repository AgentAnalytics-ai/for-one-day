-- ============================================================================
-- TEST SCRIPT: Check User State & Verify Fix
-- ============================================================================
-- 
-- Use this to:
-- 1. Check if a user exists and their current state
-- 2. Test if the RLS policy fix works
-- 3. Identify what needs to be cleaned up (if anything)
--
-- INSTRUCTIONS:
-- 1. Replace 'user-email@example.com' with the affected user's email in the queries below
-- 2. Run each section one at a time
-- 3. Review the results to determine next steps
-- ============================================================================

-- ============================================================================
-- STEP 1: Find the User
-- ============================================================================
-- ⚠️ REPLACE 'user-email@example.com' with the affected user's email

-- Check if user exists in auth.users
-- ⚠️ REPLACE 'user-email@example.com' with the actual email
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'user-email@example.com';  -- ⬅️ CHANGE THIS

-- ============================================================================
-- STEP 2: Check User's Profile State
-- ============================================================================
-- Check if profile exists (this is what was failing)
SELECT 
  user_id,
  full_name,
  plan,
  created_at,
  updated_at
FROM public.profiles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'user-email@example.com'  -- ⬅️ CHANGE THIS EMAIL
);

-- ============================================================================
-- STEP 3: Check Family Memberships
-- ============================================================================
-- Check if user has any family_members records
SELECT 
  fm.family_id,
  fm.user_id,
  fm.role,
  fm.joined_at,
  f.name as family_name,
  f.owner_id
FROM public.family_members fm
LEFT JOIN public.families f ON f.id = fm.family_id
WHERE fm.user_id IN (
  SELECT id FROM auth.users WHERE email = 'user-email@example.com'  -- ⬅️ CHANGE THIS
);

-- ============================================================================
-- STEP 4: Test RLS Policy (Before Fix)
-- ============================================================================
-- This will FAIL if the infinite recursion bug exists
-- Run this BEFORE applying the fix to confirm the bug

-- Set role to authenticated user
SET ROLE authenticated;

-- Try to query family_members as the user
-- This should either work or show the recursion error
DO $$
DECLARE
  test_user_id uuid;
  result_count int;
BEGIN
  -- Get the user's ID
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'user-email@example.com'  -- ⬅️ CHANGE THIS EMAIL
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'User not found: %', 'user-email@example.com'  -- ⬅️ CHANGE THIS EMAIL;
    RETURN;
  END IF;
  
  -- Set the JWT claim (simulating authenticated user)
  PERFORM set_config('request.jwt.claim.sub', test_user_id::text, true);
  
  -- Try to query family_members
  SELECT COUNT(*) INTO result_count
  FROM public.family_members
  WHERE user_id = test_user_id;
  
  RAISE NOTICE 'Query succeeded! Count: %', result_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Query failed with error: %', SQLERRM;
END $$;

RESET ROLE;

-- ============================================================================
-- STEP 5: Test Profile Creation (Simulate Signup)
-- ============================================================================
-- This simulates what happens during signup
DO $$
DECLARE
  test_user_id uuid;
  profile_exists boolean;
BEGIN
  -- Get the user's ID
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'user-email@example.com'  -- ⬅️ CHANGE THIS EMAIL
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'User not found: %', 'user-email@example.com'  -- ⬅️ CHANGE THIS EMAIL;
    RETURN;
  END IF;
  
  -- Check if profile already exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE user_id = test_user_id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE NOTICE 'Profile already exists for user: %', test_user_id;
  ELSE
    RAISE NOTICE 'Profile does NOT exist - this is what was failing during signup';
    RAISE NOTICE 'After fix, profile creation should work';
  END IF;
END $$;

-- ============================================================================
-- STEP 6: Cleanup Options (Only run if needed)
-- ============================================================================

-- OPTION A: Delete user completely (if they never successfully signed up)
-- WARNING: This deletes ALL user data permanently
/*
DELETE FROM auth.users
WHERE email = 'user-email@example.com'  -- ⬅️ CHANGE THIS EMAIL;
*/

-- OPTION B: Delete just the profile (if profile creation partially failed)
-- This allows user to retry signup
/*
DELETE FROM public.profiles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'user-email@example.com'  -- ⬅️ CHANGE THIS EMAIL
);
*/

-- OPTION C: Delete orphaned family_members records (if any exist)
-- This cleans up any broken family relationships
/*
DELETE FROM public.family_members
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'user-email@example.com'  -- ⬅️ CHANGE THIS EMAIL
)
AND family_id NOT IN (
  SELECT id FROM public.families
);
*/

-- ============================================================================
-- STEP 7: Verify Fix Works (Run AFTER applying fix)
-- ============================================================================
-- After running fix-family-members-infinite-recursion.sql, test again:

-- Test 1: Check policy exists
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'family_members'
  AND policyname = 'Users can view family members';

-- Test 2: Verify function is correct
SELECT 
  proname,
  prosecdef as security_definer,
  proconfig
FROM pg_proc
WHERE proname = 'is_family_member';

-- Test 3: Try querying as user (should work now)
SET ROLE authenticated;

DO $$
DECLARE
  test_user_id uuid;
  result_count int;
BEGIN
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'user-email@example.com'  -- ⬅️ CHANGE THIS EMAIL
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'User not found';
    RETURN;
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', test_user_id::text, true);
  
  SELECT COUNT(*) INTO result_count
  FROM public.family_members
  WHERE user_id = test_user_id;
  
  RAISE NOTICE '✅ SUCCESS! Query worked. Count: %', result_count;
END $$;

RESET ROLE;

-- ============================================================================
-- SUMMARY QUERY: Get Complete User State
-- ============================================================================
-- Run this to see everything about the user at once
SELECT 
  'User Info' as section,
  u.id::text as user_id,
  u.email,
  u.created_at::text as user_created,
  CASE 
    WHEN p.user_id IS NOT NULL THEN '✅ Profile exists'
    ELSE '❌ No profile (signup failed)'
  END as profile_status,
  CASE 
    WHEN COUNT(fm.family_id) > 0 THEN '✅ Has ' || COUNT(fm.family_id) || ' family memberships'
    ELSE '❌ No family memberships'
  END as family_status
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.family_members fm ON fm.user_id = u.id
WHERE u.email = 'user-email@example.com'  -- ⬅️ CHANGE THIS EMAIL
GROUP BY u.id, u.email, u.created_at, p.user_id;

-- ============================================================================
-- RECOMMENDATIONS BASED ON RESULTS:
-- ============================================================================
--
-- Scenario 1: User exists, NO profile
--   → Fix the RLS policy, then user can retry signup
--   → No cleanup needed
--
-- Scenario 2: User exists, profile exists but broken
--   → Fix the RLS policy
--   → May need to delete and recreate profile (OPTION B)
--
-- Scenario 3: User exists, has orphaned family_members
--   → Fix the RLS policy
--   → Clean up orphaned records (OPTION C)
--
-- Scenario 4: User never completed signup
--   → Fix the RLS policy
--   → User can retry signup (no cleanup needed)
--   → OR delete user completely (OPTION A) if you want fresh start
--
-- ============================================================================
