-- Family Management Schema Updates
-- Add missing fields for invitation tracking and sharing

-- Add invitation tracking fields to family_members
ALTER TABLE public.family_members 
ADD COLUMN IF NOT EXISTS invitation_status text DEFAULT 'accepted' CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'expired')),
ADD COLUMN IF NOT EXISTS invited_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id);

-- Add sharing settings to vault_items
ALTER TABLE public.vault_items
ADD COLUMN IF NOT EXISTS sharing_settings jsonb DEFAULT '{}';

-- Create family invitations table for pending invitations
CREATE TABLE IF NOT EXISTS public.family_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_name text,
  role text NOT NULL CHECK (role IN ('owner', 'spouse', 'child', 'viewer', 'executor')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_invitations_email ON public.family_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON public.family_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_family_invitations_family ON public.family_invitations(family_id);

-- Enable RLS on new table
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for family_invitations (with safe DROP statements)
DROP POLICY IF EXISTS "Users can view invitations they sent" ON public.family_invitations;
CREATE POLICY "Users can view invitations they sent" ON public.family_invitations
  FOR SELECT USING (invited_by = auth.uid());

DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.family_invitations;
CREATE POLICY "Users can view invitations sent to them" ON public.family_invitations
  FOR SELECT USING (invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Family owners can manage invitations" ON public.family_invitations;
CREATE POLICY "Family owners can manage invitations" ON public.family_invitations
  FOR ALL USING (
    family_id IN (
      SELECT f.id FROM public.families f 
      WHERE f.owner_id = auth.uid()
    )
  );

-- Update existing policies to handle new fields
DROP POLICY IF EXISTS "Users can view family members" ON public.family_members;
CREATE POLICY "Users can view family members" ON public.family_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    family_id IN (
      SELECT fm.family_id FROM public.family_members fm 
      WHERE fm.user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE public.family_invitations IS 'Tracks pending family invitations with tokens and expiration';
