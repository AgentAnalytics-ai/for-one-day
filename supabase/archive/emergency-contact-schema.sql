-- Emergency Contact System - Simple Implementation
-- Add emergency contact field to profiles table

-- Add emergency contact email field
ALTER TABLE public.profiles 
ADD COLUMN emergency_contact_email text,
ADD COLUMN emergency_contact_name text,
ADD COLUMN emergency_contact_phone text,
ADD COLUMN emergency_contact_relationship text DEFAULT 'spouse';

-- Add privacy settings
ALTER TABLE public.profiles 
ADD COLUMN emergency_access_enabled boolean DEFAULT true,
ADD COLUMN emergency_access_notes text,
ADD COLUMN email_notifications_enabled boolean DEFAULT true;

-- Add comments
COMMENT ON COLUMN public.profiles.emergency_contact_email IS 'Email of person to contact in case of emergency/death';
COMMENT ON COLUMN public.profiles.emergency_contact_name IS 'Name of emergency contact person';
COMMENT ON COLUMN public.profiles.emergency_contact_phone IS 'Phone number of emergency contact';
COMMENT ON COLUMN public.profiles.emergency_contact_relationship IS 'Relationship to user (spouse, child, parent, etc.)';
COMMENT ON COLUMN public.profiles.emergency_access_enabled IS 'Whether emergency access is enabled for this user';
COMMENT ON COLUMN public.profiles.emergency_access_notes IS 'Additional notes for emergency access process';
COMMENT ON COLUMN public.profiles.email_notifications_enabled IS 'Whether user wants to receive email notifications';

-- Create emergency access log table for support team
CREATE TABLE public.emergency_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Can be null initially
  account_holder_email text NOT NULL, -- Email of the account holder
  requester_email text NOT NULL,
  requester_name text NOT NULL,
  requester_relationship text,
  request_reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'completed')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id)
);

COMMENT ON TABLE public.emergency_access_requests IS 'Log of emergency access requests from family members';

-- Enable RLS
ALTER TABLE public.emergency_access_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emergency access requests
CREATE POLICY "Users can view their own emergency requests"
  ON public.emergency_access_requests FOR SELECT
  USING (user_id = auth.uid());

-- Admin policy (you'll need to add admin role later)
CREATE POLICY "Admins can manage all emergency requests"
  ON public.emergency_access_requests FOR ALL
  USING (false); -- Will be updated when admin system is added

-- Index for performance
CREATE INDEX idx_emergency_requests_user ON emergency_access_requests(user_id, created_at DESC);
CREATE INDEX idx_emergency_requests_status ON emergency_access_requests(status, created_at DESC);
