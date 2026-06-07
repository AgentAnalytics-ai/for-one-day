-- ============================================================================
-- 002_household_invite_accept.sql
-- Step 5 — accept invitation RPC + RLS email case fix
-- Run after 001. Then: supabase/verify-step5-spouse.sql
-- ============================================================================

-- Fix invitation visibility policy (case-insensitive email match)
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.family_invitations;
CREATE POLICY "Users can view invitations sent to them"
  ON public.family_invitations FOR SELECT
  USING (
    lower(invited_email) = lower(
      (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- accept_family_invitation — atomic join to existing household
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.accept_family_invitation(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_inv public.family_invitations%ROWTYPE;
  v_member_count int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  IF v_email IS NULL OR trim(v_email) = '' THEN
    RAISE EXCEPTION 'User email not found';
  END IF;

  SELECT * INTO v_inv
  FROM public.family_invitations
  WHERE invitation_token = p_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  IF lower(trim(v_inv.invited_email)) <> lower(trim(v_email)) THEN
    RAISE EXCEPTION 'Invitation was sent to a different email address';
  END IF;

  -- Already in this household
  IF EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = v_inv.family_id AND user_id = v_user_id
  ) THEN
    UPDATE public.family_invitations
    SET status = 'accepted', updated_at = now()
    WHERE id = v_inv.id;

    UPDATE public.profiles
    SET primary_family_id = v_inv.family_id
    WHERE user_id = v_user_id;

    RETURN v_inv.family_id;
  END IF;

  -- Block: already manages another household
  IF EXISTS (
    SELECT 1 FROM public.families f WHERE f.owner_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You already manage a household. Use that home or contact support.';
  END IF;

  -- Block: already in a different household
  IF EXISTS (
    SELECT 1 FROM public.family_members fm WHERE fm.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You are already in a household';
  END IF;

  SELECT COUNT(*)::int INTO v_member_count
  FROM public.family_members
  WHERE family_id = v_inv.family_id;

  IF v_member_count >= 6 THEN
    RAISE EXCEPTION 'This household has reached the member limit';
  END IF;

  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (v_inv.family_id, v_user_id, v_inv.role);

  UPDATE public.family_invitations
  SET status = 'accepted', updated_at = now()
  WHERE id = v_inv.id;

  UPDATE public.family_invitations
  SET status = 'expired', updated_at = now()
  WHERE lower(trim(invited_email)) = lower(trim(v_email))
    AND status = 'pending'
    AND id <> v_inv.id;

  UPDATE public.profiles
  SET primary_family_id = v_inv.family_id
  WHERE user_id = v_user_id;

  RETURN v_inv.family_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_family_invitation(text) TO authenticated;

-- ----------------------------------------------------------------------------
-- accept_pending_household_invitation — callback after signup verify (by email)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.accept_pending_household_invitation()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_token text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  IF v_email IS NULL THEN
    RETURN NULL;
  END IF;

  -- Already in a household — nothing to do
  IF EXISTS (SELECT 1 FROM public.family_members WHERE user_id = v_user_id) THEN
    RETURN NULL;
  END IF;

  SELECT fi.invitation_token INTO v_token
  FROM public.family_invitations fi
  WHERE lower(trim(fi.invited_email)) = lower(trim(v_email))
    AND fi.status = 'pending'
    AND fi.expires_at > now()
  ORDER BY fi.created_at DESC
  LIMIT 1;

  IF v_token IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN public.accept_family_invitation(v_token);
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_pending_household_invitation() TO authenticated;
