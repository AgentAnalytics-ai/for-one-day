/**
 * 🔧 Add Missing Stripe Columns to Profiles
 * Safe migration - adds columns if they don't exist
 * Run this in Supabase SQL Editor
 */

-- Add Stripe customer ID to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create index for faster Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
  ON public.profiles(stripe_customer_id) 
  WHERE stripe_customer_id IS NOT NULL;

-- Create subscription_events table for webhook audit trail
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  subscription_id TEXT,
  customer_id TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for subscription_events
CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_id 
  ON public.subscription_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_subscription_events_type 
  ON public.subscription_events(event_type);

CREATE INDEX IF NOT EXISTS idx_subscription_events_customer 
  ON public.subscription_events(customer_id);

-- Add comment
COMMENT ON TABLE public.subscription_events IS 'Stripe webhook events for audit trail and debugging';

-- Enable RLS on subscription_events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Only service role can view events (for debugging)
CREATE POLICY IF NOT EXISTS "Service role can view events"
  ON public.subscription_events FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role can insert events"
  ON public.subscription_events FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete!';
  RAISE NOTICE 'Added column: stripe_customer_id to profiles';
  RAISE NOTICE 'Created table: subscription_events';
  RAISE NOTICE 'Created indexes for performance';
END $$;

