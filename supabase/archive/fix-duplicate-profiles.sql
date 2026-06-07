-- Fix Duplicate Profile Records
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- 1. CHECK FOR DUPLICATE PROFILES
-- ============================================================================

-- First, let's see what duplicate profiles exist
SELECT 
  user_id,
  COUNT(*) as profile_count,
  array_agg(id) as profile_ids,
  array_agg(created_at) as created_dates
FROM public.profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1
ORDER BY profile_count DESC;

-- ============================================================================
-- 2. KEEP THE LATEST PROFILE, DELETE OTHERS
-- ============================================================================

-- For each user with multiple profiles, keep the most recent one
WITH duplicate_profiles AS (
  SELECT 
    user_id,
    id,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM public.profiles
),
profiles_to_delete AS (
  SELECT id 
  FROM duplicate_profiles 
  WHERE rn > 1
)
DELETE FROM public.profiles 
WHERE id IN (SELECT id FROM profiles_to_delete);

-- ============================================================================
-- 3. VERIFY THE FIX
-- ============================================================================

-- Check that we now have only one profile per user
SELECT 
  user_id,
  COUNT(*) as profile_count
FROM public.profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- If this query returns no results, the fix worked!

-- ============================================================================
-- 4. ADD UNIQUE CONSTRAINT TO PREVENT FUTURE DUPLICATES
-- ============================================================================

-- Add a unique constraint on user_id to prevent future duplicates
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON CONSTRAINT profiles_user_id_unique ON public.profiles IS 'Ensures each user can only have one profile record';
