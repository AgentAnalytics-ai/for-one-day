-- Stripe Integration Schema Updates
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- UPDATE PROFILES TABLE
-- ============================================================================

-- Add subscription-related fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'lifetime')),
ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz,
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- Add index for Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- ============================================================================
-- UPDATE SUBSCRIPTIONS TABLE
-- ============================================================================

-- Add more Stripe-specific fields
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS customer_id text,
ADD COLUMN IF NOT EXISTS product_id text,
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS trial_start timestamptz,
ADD COLUMN IF NOT EXISTS trial_end timestamptz,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON public.subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================================
-- CREATE SUBSCRIPTION EVENTS TABLE (for webhook tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  subscription_id text,
  customer_id text,
  processed_at timestamptz DEFAULT now(),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_subscription_events_stripe_id ON public.subscription_events(stripe_event_id);
CREATE INDEX idx_subscription_events_type ON public.subscription_events(event_type);
CREATE INDEX idx_subscription_events_customer ON public.subscription_events(customer_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's subscription status
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
    p.subscription_status as plan,
    COALESCE(s.status, 'free') as status,
    CASE 
      WHEN s.status IN ('active', 'trialing') THEN true
      ELSE false
    END as is_active,
    s.current_period_end as ends_at
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON p.user_id = s.user_id 
    AND s.status IN ('active', 'trialing', 'past_due')
  WHERE p.user_id = user_uuid;
END;
$$;

-- Function to check if user can create legacy notes
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
  -- Get user's plan
  SELECT subscription_status INTO user_plan
  FROM public.profiles
  WHERE user_id = user_uuid;
  
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
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new table
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription events
CREATE POLICY "Users can view own subscription events"
  ON public.subscription_events FOR SELECT
  USING (
    customer_id IN (
      SELECT stripe_customer_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Only service role can insert subscription events (via webhooks)
CREATE POLICY "Service role can insert subscription events"
  ON public.subscription_events FOR INSERT
  WITH CHECK (true); -- This will be restricted by service role key

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.subscription_events IS 'Stripe webhook events for subscription tracking';
COMMENT ON FUNCTION get_user_subscription_status(uuid) IS 'Get comprehensive subscription status for a user';
COMMENT ON FUNCTION can_create_legacy_note(uuid) IS 'Check if user can create another legacy note based on their plan';
