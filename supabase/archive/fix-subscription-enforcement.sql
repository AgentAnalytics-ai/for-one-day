-- Fix Subscription Enforcement - Professional Setup
-- Run this in your Supabase SQL Editor to ensure all gates are locked

-- ============================================================================
-- STEP 1: ENSURE PROFILES TABLE HAS CORRECT SUBSCRIPTION FIELDS
-- ============================================================================

-- Add subscription fields if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'lifetime')),
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz,
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- ============================================================================
-- STEP 2: ENSURE ALL USERS HAVE CORRECT DEFAULT SUBSCRIPTION STATUS
-- ============================================================================

-- Update any users without subscription_status to 'free'
UPDATE public.profiles 
SET subscription_status = 'free' 
WHERE subscription_status IS NULL;

-- ============================================================================
-- STEP 3: CREATE ROW LEVEL SECURITY FOR VAULT_ITEMS
-- ============================================================================

-- Enable RLS on vault_items if not already enabled
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own vault items" ON public.vault_items;
DROP POLICY IF EXISTS "Users can insert own vault items" ON public.vault_items;
DROP POLICY IF EXISTS "Users can update own vault items" ON public.vault_items;
DROP POLICY IF EXISTS "Users can delete own vault items" ON public.vault_items;

-- Create comprehensive RLS policies for vault_items
CREATE POLICY "Users can view own vault items"
  ON public.vault_items FOR SELECT
  USING (
    owner_id = auth.uid() OR
    family_id IN (
      SELECT family_id 
      FROM public.family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own vault items"
  ON public.vault_items FOR INSERT
  WITH CHECK (
    owner_id = auth.uid() AND
    family_id IN (
      SELECT family_id 
      FROM public.family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own vault items"
  ON public.vault_items FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own vault items"
  ON public.vault_items FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================================
-- STEP 4: CREATE SUBSCRIPTION LIMIT ENFORCEMENT FUNCTION
-- ============================================================================

-- Drop and recreate the function to ensure it's correct
DROP FUNCTION IF EXISTS can_create_legacy_note(uuid);

CREATE OR REPLACE FUNCTION can_create_legacy_note(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan text;
  current_count integer;
  max_allowed integer;
BEGIN
  -- Get user's subscription status
  SELECT subscription_status INTO user_plan
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  -- If no profile found, default to free
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  -- Set limits based on plan
  IF user_plan = 'pro' OR user_plan = 'lifetime' THEN
    RETURN true; -- Unlimited for pro/lifetime
  END IF;
  
  -- Count current legacy notes for free users
  SELECT COUNT(*) INTO current_count
  FROM public.vault_items vi
  JOIN public.family_members fm ON vi.family_id = fm.family_id
  WHERE fm.user_id = user_uuid 
    AND vi.kind = 'letter'
    AND vi.metadata->>'legacy_note' = 'true';
  
  -- Free users get 5 legacy notes
  max_allowed := 5;
  
  RETURN current_count < max_allowed;
END;
$$;

-- ============================================================================
-- STEP 5: CREATE SUBSCRIPTION STATUS FUNCTION
-- ============================================================================

-- Drop and recreate the function
DROP FUNCTION IF EXISTS get_user_subscription_status(uuid);

CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uuid uuid)
RETURNS TABLE (
  plan text,
  status text,
  is_active boolean,
  ends_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.subscription_status, 'free') as plan,
    COALESCE(s.status, 'free') as status,
    CASE 
      WHEN s.status IN ('active', 'trialing') OR p.subscription_status IN ('pro', 'lifetime') THEN true
      ELSE false
    END as is_active,
    s.current_period_end as ends_at
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON p.user_id = s.user_id 
    AND s.status IN ('active', 'trialing', 'past_due')
  WHERE p.user_id = user_uuid;
END;
$$;

-- ============================================================================
-- STEP 6: CREATE VAULT ITEM INSERT TRIGGER FOR ENFORCEMENT
-- ============================================================================

-- Create a trigger function to enforce limits
CREATE OR REPLACE FUNCTION enforce_legacy_note_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan text;
  current_count integer;
  max_allowed integer;
BEGIN
  -- Only check for legacy notes
  IF NEW.kind = 'letter' AND NEW.metadata->>'legacy_note' = 'true' THEN
    
    -- Get user's subscription status
    SELECT subscription_status INTO user_plan
    FROM public.profiles
    WHERE user_id = NEW.owner_id;
    
    -- If no profile found, default to free
    IF user_plan IS NULL THEN
      user_plan := 'free';
    END IF;
    
    -- Set limits based on plan
    IF user_plan = 'pro' OR user_plan = 'lifetime' THEN
      RETURN NEW; -- Unlimited for pro/lifetime
    END IF;
    
    -- Count current legacy notes for free users
    SELECT COUNT(*) INTO current_count
    FROM public.vault_items vi
    WHERE vi.family_id = NEW.family_id
      AND vi.owner_id = NEW.owner_id
      AND vi.kind = 'letter'
      AND vi.metadata->>'legacy_note' = 'true';
    
    -- Free users get 5 legacy notes
    max_allowed := 5;
    
    -- Check if limit would be exceeded
    IF current_count >= max_allowed THEN
      RAISE EXCEPTION 'You have reached your limit of % legacy notes on the Free plan. Upgrade to Pro for unlimited notes.', max_allowed;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS enforce_legacy_note_limit_trigger ON public.vault_items;
CREATE TRIGGER enforce_legacy_note_limit_trigger
  BEFORE INSERT ON public.vault_items
  FOR EACH ROW
  EXECUTE FUNCTION enforce_legacy_note_limit();

-- ============================================================================
-- STEP 7: VERIFY SETUP
-- ============================================================================

-- Test the function
SELECT can_create_legacy_note(auth.uid()) as can_create;

-- Show current subscription status
SELECT * FROM get_user_subscription_status(auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION can_create_legacy_note(uuid) IS 'Check if user can create another legacy note based on their plan - ENFORCES 5 NOTE LIMIT FOR FREE USERS';
COMMENT ON FUNCTION get_user_subscription_status(uuid) IS 'Get comprehensive subscription status for a user';
COMMENT ON FUNCTION enforce_legacy_note_limit() IS 'Database-level trigger to enforce legacy note limits - PREVENTS BYPASSING APP-LEVEL CHECKS';
