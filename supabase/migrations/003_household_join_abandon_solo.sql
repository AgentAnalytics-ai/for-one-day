-- ============================================================================
-- 003_household_join_abandon_solo.sql
-- Step 5b — existing user with solo free home can join invite (abandon empty home)
-- Run after 002 on prod.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- abandon_solo_household_if_eligible — sole owner, free plan, no family Stripe
-- Detaches user content via owner_id/user_id; memories are not deleted.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.abandon_solo_household_if_eligible(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_family_id uuid;
  v_member_count int;
  v_plan text;
  v_stripe_sub text;
BEGIN
  SELECT f.id INTO v_family_id
  FROM public.families f
  WHERE f.owner_id = p_user_id
  LIMIT 1;

  IF v_family_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COUNT(*)::int INTO v_member_count
  FROM public.family_members
  WHERE family_id = v_family_id;

  IF v_member_count <> 1 THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = v_family_id AND user_id = p_user_id
  ) THEN
    RETURN NULL;
  END IF;

  SELECT fe.plan, fe.stripe_subscription_id
  INTO v_plan, v_stripe_sub
  FROM public.family_entitlements fe
  WHERE fe.family_id = v_family_id;

  IF v_plan IS NULL OR v_plan <> 'free' OR v_stripe_sub IS NOT NULL THEN
    RETURN NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = p_user_id
      AND s.status IN ('active', 'trialing')
  ) THEN
    RETURN NULL;
  END IF;

  -- Detach user-scoped rows (do not delete memories / vault)
  UPDATE public.vault_items
  SET family_id = NULL
  WHERE family_id = v_family_id AND owner_id = p_user_id;

  UPDATE public.devotion_entries
  SET family_id = NULL
  WHERE family_id = v_family_id AND user_id = p_user_id;

  UPDATE public.family_invitations
  SET status = 'expired', updated_at = now()
  WHERE family_id = v_family_id AND status = 'pending';

  UPDATE public.profiles
  SET primary_family_id = NULL
  WHERE user_id = p_user_id AND primary_family_id = v_family_id;

  DELETE FROM public.family_members
  WHERE family_id = v_family_id AND user_id = p_user_id;

  DELETE FROM public.family_entitlements WHERE family_id = v_family_id;
  DELETE FROM public.families WHERE id = v_family_id AND owner_id = p_user_id;

  RETURN v_family_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.abandon_solo_household_if_eligible(uuid) TO authenticated;

-- ----------------------------------------------------------------------------
-- accept_family_invitation — join + abandon solo home when eligible
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
  v_abandoned uuid;
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

  -- Step 5b: abandon solo free home so existing accounts can join
  IF EXISTS (
    SELECT 1 FROM public.family_members fm WHERE fm.user_id = v_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.families f WHERE f.owner_id = v_user_id
  ) THEN
    v_abandoned := public.abandon_solo_household_if_eligible(v_user_id);

    IF EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.user_id = v_user_id AND fm.family_id <> v_inv.family_id
    ) THEN
      RAISE EXCEPTION 'You are already in another household. Leave it first or contact support.';
    END IF;

    IF EXISTS (SELECT 1 FROM public.families f WHERE f.owner_id = v_user_id) THEN
      RAISE EXCEPTION 'You manage a household with Pro, other members, or active billing. Contact support to switch homes.';
    END IF;
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

-- ----------------------------------------------------------------------------
-- accept_pending_household_invitation — also works for solo-home existing users
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
  v_invited_family uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  IF v_email IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT fi.invitation_token, fi.family_id
  INTO v_token, v_invited_family
  FROM public.family_invitations fi
  WHERE lower(trim(fi.invited_email)) = lower(trim(v_email))
    AND fi.status = 'pending'
    AND fi.expires_at > now()
  ORDER BY fi.created_at DESC
  LIMIT 1;

  IF v_token IS NULL THEN
    RETURN NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.user_id = v_user_id AND fm.family_id = v_invited_family
  ) THEN
    UPDATE public.profiles
    SET primary_family_id = v_invited_family
    WHERE user_id = v_user_id;

    UPDATE public.family_invitations
    SET status = 'accepted', updated_at = now()
    WHERE invitation_token = v_token;

    RETURN v_invited_family;
  END IF;

  RETURN public.accept_family_invitation(v_token);
END;
$$;
