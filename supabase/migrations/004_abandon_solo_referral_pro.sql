-- ============================================================================
-- 004_abandon_solo_referral_pro.sql
-- Allow solo-home owners with referral/profile Pro (no family Stripe) to join
-- a spouse household. Step 5 gate: Sara-style existing Pro-on-solo users.
-- Run after 003 on prod.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.abandon_solo_household_if_eligible(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_family_id uuid;
  v_member_count int;
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

  SELECT fe.stripe_subscription_id
  INTO v_stripe_sub
  FROM public.family_entitlements fe
  WHERE fe.family_id = v_family_id;

  -- Block only real household billing — referral/profile Pro without Stripe is OK
  IF v_stripe_sub IS NOT NULL THEN
    RETURN NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = p_user_id
      AND s.status IN ('active', 'trialing')
  ) THEN
    RETURN NULL;
  END IF;

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
