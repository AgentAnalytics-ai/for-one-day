-- ============================================================================
-- FIX KREG'S SUBSCRIPTION STATUS
-- ============================================================================
-- This script manually updates Kreg's account to Pro if payment was successful
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Check Kreg's current status
SELECT 
  u.id as user_id,
  u.email,
  p.plan as current_plan,
  p.stripe_customer_id,
  s.id as subscription_id,
  s.status as subscription_status,
  s.current_period_end
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.subscriptions s ON s.user_id = u.id
WHERE u.email = 'kcdecker23@outlook.com';

-- Step 2: If subscription exists in Stripe but not in database, update manually
-- First, check if there's a subscription record
-- If payment was successful in Stripe, update the profile:

UPDATE public.profiles
SET plan = 'pro'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'kcdecker23@outlook.com'
);

-- Step 3: Verify the update
SELECT 
  u.email,
  p.plan,
  p.updated_at
FROM auth.users u
JOIN public.profiles p ON p.user_id = u.id
WHERE u.email = 'kcdecker23@outlook.com';

-- ============================================================================
-- NEXT STEPS:
-- ============================================================================
-- 1. Check Stripe Dashboard to confirm payment was successful
-- 2. If payment exists, manually create subscription record:
--    INSERT INTO public.subscriptions (id, user_id, status, price_id, current_period_start, current_period_end)
--    VALUES ('sub_xxxxx', (SELECT id FROM auth.users WHERE email = 'kcdecker23@outlook.com'), 'active', 'price_xxxxx', NOW(), NOW() + INTERVAL '1 month');
-- 3. Verify webhook endpoint is configured in Stripe Dashboard
-- ============================================================================
