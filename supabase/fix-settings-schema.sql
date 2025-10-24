-- Fix Settings Schema - Add Missing Fields
-- Run this in your Supabase SQL Editor

-- Add missing executor and emergency contact fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_access_notes TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_access_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS executor_relationship TEXT;

-- Add family_id field if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id);

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.emergency_contact_name IS 'Name of the emergency contact person';
COMMENT ON COLUMN public.profiles.emergency_contact_email IS 'Email of the emergency contact person';
COMMENT ON COLUMN public.profiles.emergency_contact_phone IS 'Phone number of the emergency contact person';
COMMENT ON COLUMN public.profiles.emergency_contact_relationship IS 'Relationship of the emergency contact to the user';
COMMENT ON COLUMN public.profiles.emergency_access_notes IS 'Additional notes for emergency access verification';
COMMENT ON COLUMN public.profiles.emergency_access_enabled IS 'Whether emergency access is enabled for legacy notes';
COMMENT ON COLUMN public.profiles.executor_name IS 'Name of the designated executor/trustee for digital legacy';
COMMENT ON COLUMN public.profiles.executor_email IS 'Email of the designated executor/trustee';
COMMENT ON COLUMN public.profiles.executor_phone IS 'Phone number of the designated executor/trustee';
COMMENT ON COLUMN public.profiles.executor_relationship IS 'Relationship of the designated executor/trustee to the user';
COMMENT ON COLUMN public.profiles.family_id IS 'Reference to the user''s family group';

-- Update the profiles table comment
COMMENT ON TABLE public.profiles IS 'User profiles with emergency contacts, executors, and subscription status';
