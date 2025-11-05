/**
 * 🚨 Add Emergency Contact & Executor Fields to Profiles
 * These fields enable families to access legacy notes when needed
 * Run this in Supabase SQL Editor
 */

-- Add emergency contact fields to profiles (one at a time - PostgreSQL requirement)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_access_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_access_notes TEXT;

-- Add executor/trustee fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_relationship TEXT;

-- Create index for emergency contact lookups
CREATE INDEX IF NOT EXISTS idx_profiles_emergency_email 
  ON public.profiles(emergency_contact_email) 
  WHERE emergency_contact_email IS NOT NULL;

-- Create index for executor lookups
CREATE INDEX IF NOT EXISTS idx_profiles_executor_email 
  ON public.profiles(executor_email) 
  WHERE executor_email IS NOT NULL;

-- Create emergency access requests table (for logging requests)
CREATE TABLE IF NOT EXISTS public.emergency_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  relationship TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for emergency requests
CREATE INDEX IF NOT EXISTS idx_emergency_requests_user 
  ON public.emergency_access_requests(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_emergency_requests_status 
  ON public.emergency_access_requests(status, created_at DESC);

-- Add comment
COMMENT ON TABLE public.emergency_access_requests IS 'Emergency access requests from family members';

-- Enable RLS on emergency_access_requests
ALTER TABLE public.emergency_access_requests ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view their own requests
DROP POLICY IF EXISTS "Users can view own emergency requests" ON public.emergency_access_requests;
CREATE POLICY "Users can view own emergency requests"
  ON public.emergency_access_requests FOR SELECT
  USING (user_id = auth.uid());

-- Anyone can submit an emergency request (they don't need to be logged in)
DROP POLICY IF EXISTS "Anyone can submit emergency requests" ON public.emergency_access_requests;
CREATE POLICY "Anyone can submit emergency requests"
  ON public.emergency_access_requests FOR INSERT
  WITH CHECK (true);

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE '✅ Emergency contact migration complete!';
  RAISE NOTICE 'Added columns: emergency_contact_*, emergency_access_*, executor_* to profiles';
  RAISE NOTICE 'Created table: emergency_access_requests';
  RAISE NOTICE 'Created indexes for performance';
  RAISE NOTICE 'Settings form will now save emergency contact and executor information';
END $$;

