-- ============================================================================
-- 001_household_foundation.sql
-- For One Day — household bootstrap + family_entitlements + user_has_pro()
--
-- HOW TO RUN (expert process):
--   1. Backup / note prod state (optional export)
--   2. Run this ENTIRE file once in Supabase SQL Editor (or: supabase db push)
--   3. Run supabase/verify-household-foundation.sql — all gates must pass
--   4. Then wire app: auth/actions.ts + stripe webhook (Step 3)
--
-- SAFE: Idempotent where possible (IF NOT EXISTS, ON CONFLICT).
-- DOES NOT: drop tables, delete data, or change memories/vault RLS.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles — primary household pointer + lifetime plan support
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS primary_family_id uuid REFERENCES public.families(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_primary_family_id
  ON public.profiles(primary_family_id);

-- App uses lifetime; schema.sql may only allow free/pro
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'pro', 'lifetime'));

COMMENT ON COLUMN public.profiles.primary_family_id IS
  'Active household for Today/wall. Set on bootstrap or spouse join.';

-- ----------------------------------------------------------------------------
-- 2. family_entitlements — billing anchor (one row per household)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.family_entitlements (
  family_id uuid PRIMARY KEY REFERENCES public.families(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'lifetime')),
  billing_owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_entitlements_billing_owner
  ON public.family_entitlements(billing_owner_id);

CREATE INDEX IF NOT EXISTS idx_family_entitlements_plan
  ON public.family_entitlements(plan);

COMMENT ON TABLE public.family_entitlements IS
  'Household plan — source of truth for Pro (webhook writes here). One row per family.';

-- updated_at helper (prod may already have this from schema.sql)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS family_entitlements_updated_at ON public.family_entitlements;
CREATE TRIGGER family_entitlements_updated_at
  BEFORE UPDATE ON public.family_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.family_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view household entitlement" ON public.family_entitlements;
CREATE POLICY "Family members can view household entitlement"
  ON public.family_entitlements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_id = family_entitlements.family_id
        AND fm.user_id = auth.uid()
    )
  );

-- Writes: Stripe webhook / service role only (no authenticated INSERT/UPDATE policies)

-- ----------------------------------------------------------------------------
-- 3. family_invitations — ensure table exists (may already be in prod)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.family_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_name text,
  role text NOT NULL DEFAULT 'spouse'
    CHECK (role IN ('owner', 'spouse', 'child', 'viewer', 'executor', 'member')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_invitations_email
  ON public.family_invitations(lower(invited_email));
CREATE INDEX IF NOT EXISTS idx_family_invitations_token
  ON public.family_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_family_invitations_family
  ON public.family_invitations(family_id);

ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4. RLS — fix family_members recursion (use safe policy only)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view family members" ON public.family_members;
CREATE POLICY "Users can view family members"
  ON public.family_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.families f
      WHERE f.id = family_members.family_id
        AND f.owner_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.is_family_member(fid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.family_id = fid
      AND fm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_family_owner(fid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.families f
    WHERE f.id = fid
      AND f.owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_family_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT family_id FROM public.family_members WHERE user_id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- 5. referral_entitlements — ensure table exists (used by user_has_pro)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.referral_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'founder',
  grant_type text NOT NULL DEFAULT 'founder_referral',
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'revoked')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT referral_entitlements_ends_after_start CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_referral_entitlements_user_status_end
  ON public.referral_entitlements (user_id, status, ends_at DESC);

ALTER TABLE public.referral_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own referral entitlements" ON public.referral_entitlements;
CREATE POLICY "Users can read own referral entitlements"
  ON public.referral_entitlements FOR SELECT
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. Entitlement helpers — single gate for app + RLS
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.family_has_pro(fid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_entitlements fe
    WHERE fe.family_id = fid
      AND fe.plan IN ('pro', 'lifetime')
      AND (
        fe.plan = 'lifetime'
        OR fe.current_period_end IS NULL
        OR fe.current_period_end > now()
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_pro(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Founder / referral grant (per user)
    EXISTS (
      SELECT 1 FROM public.referral_entitlements re
      WHERE re.user_id = p_user_id
        AND re.status = 'active'
        AND re.ends_at > now()
    )
    -- Household Pro / lifetime
    OR EXISTS (
      SELECT 1 FROM public.family_members fm
      JOIN public.family_entitlements fe ON fe.family_id = fm.family_id
      WHERE fm.user_id = p_user_id
        AND fe.plan IN ('pro', 'lifetime')
        AND (
          fe.plan = 'lifetime'
          OR fe.current_period_end IS NULL
          OR fe.current_period_end > now()
        )
    );
$$;

GRANT EXECUTE ON FUNCTION public.user_has_pro(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.family_has_pro(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_family_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_family_owner(uuid) TO authenticated;

-- ----------------------------------------------------------------------------
-- 7. Bootstrap — one household per owner (skip pending spouse invites)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bootstrap_user_household(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_family_id uuid;
  v_display_name text;
  v_email text;
  v_family_name text;
BEGIN
  -- Already in a household
  SELECT fm.family_id INTO v_family_id
  FROM public.family_members fm
  WHERE fm.user_id = p_user_id
  LIMIT 1;

  IF v_family_id IS NOT NULL THEN
    UPDATE public.profiles
    SET primary_family_id = COALESCE(primary_family_id, v_family_id)
    WHERE user_id = p_user_id;
    RETURN v_family_id;
  END IF;

  -- Spouse invite path: do not auto-create a second household
  SELECT u.email INTO v_email FROM auth.users u WHERE u.id = p_user_id;
  IF v_email IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.family_invitations fi
    WHERE lower(fi.invited_email) = lower(v_email)
      AND fi.status = 'pending'
      AND fi.expires_at > now()
  ) THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(NULLIF(trim(full_name), ''), 'My') INTO v_display_name
  FROM public.profiles WHERE user_id = p_user_id;

  v_family_name := v_display_name || '''s Family';

  INSERT INTO public.families (name, owner_id)
  VALUES (v_family_name, p_user_id)
  RETURNING id INTO v_family_id;

  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (v_family_id, p_user_id, 'owner')
  ON CONFLICT (family_id, user_id) DO NOTHING;

  INSERT INTO public.family_entitlements (family_id, plan, billing_owner_id)
  VALUES (v_family_id, 'free', p_user_id)
  ON CONFLICT (family_id) DO NOTHING;

  UPDATE public.profiles
  SET primary_family_id = v_family_id
  WHERE user_id = p_user_id;

  RETURN v_family_id;
END;
$$;

-- Trigger: new signups get a household automatically
CREATE OR REPLACE FUNCTION public.on_profile_created_bootstrap_household()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.bootstrap_user_household(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_family_on_profile_create ON public.profiles;
CREATE TRIGGER ensure_family_on_profile_create
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.on_profile_created_bootstrap_household();

-- ----------------------------------------------------------------------------
-- 8. BACKFILL — existing users without a household
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.user_id
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.family_members fm WHERE fm.user_id = p.user_id
    )
  LOOP
    PERFORM public.bootstrap_user_household(r.user_id);
  END LOOP;
END;
$$;

-- Link primary_family_id for members already in a family (e.g. manual setup)
UPDATE public.profiles p
SET primary_family_id = fm.family_id
FROM public.family_members fm
WHERE fm.user_id = p.user_id
  AND p.primary_family_id IS NULL
  AND fm.role = 'owner';

UPDATE public.profiles p
SET primary_family_id = fm.family_id
FROM public.family_members fm
WHERE fm.user_id = p.user_id
  AND p.primary_family_id IS NULL;

-- Ensure every family has an entitlement row
INSERT INTO public.family_entitlements (family_id, plan, billing_owner_id)
SELECT f.id, 'free', f.owner_id
FROM public.families f
WHERE NOT EXISTS (
  SELECT 1 FROM public.family_entitlements fe WHERE fe.family_id = f.id
)
ON CONFLICT (family_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. BACKFILL — map existing Pro / lifetime to household entitlements
-- ----------------------------------------------------------------------------

WITH owner_plan AS (
  SELECT
    f.id AS family_id,
    f.owner_id,
    p.plan AS profile_plan,
    p.stripe_customer_id,
    s.id AS subscription_id,
    s.status AS subscription_status,
    s.current_period_end
  FROM public.families f
  JOIN public.profiles p ON p.user_id = f.owner_id
  LEFT JOIN LATERAL (
    SELECT sub.id, sub.status, sub.current_period_end
    FROM public.subscriptions sub
    WHERE sub.user_id = f.owner_id
      AND sub.status IN ('active', 'trialing', 'past_due')
    ORDER BY sub.current_period_end DESC NULLS LAST
    LIMIT 1
  ) s ON true
)
UPDATE public.family_entitlements fe
SET
  plan = CASE
    WHEN op.profile_plan = 'lifetime' THEN 'lifetime'
    WHEN op.profile_plan = 'pro' THEN 'pro'
    WHEN op.subscription_status IN ('active', 'trialing') THEN 'pro'
    ELSE fe.plan
  END,
  billing_owner_id = op.owner_id,
  stripe_customer_id = COALESCE(fe.stripe_customer_id, op.stripe_customer_id),
  stripe_subscription_id = COALESCE(fe.stripe_subscription_id, op.subscription_id),
  current_period_end = COALESCE(fe.current_period_end, op.current_period_end),
  updated_at = now()
FROM owner_plan op
WHERE fe.family_id = op.family_id
  AND (
    op.profile_plan IN ('pro', 'lifetime')
    OR op.subscription_status IN ('active', 'trialing')
  );

-- ----------------------------------------------------------------------------
-- 10. family_invitations RLS (idempotent)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view invitations they sent" ON public.family_invitations;
CREATE POLICY "Users can view invitations they sent"
  ON public.family_invitations FOR SELECT
  USING (invited_by = auth.uid());

DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.family_invitations;
CREATE POLICY "Users can view invitations sent to them"
  ON public.family_invitations FOR SELECT
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Family owners can manage invitations" ON public.family_invitations;
CREATE POLICY "Family owners can manage invitations"
  ON public.family_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.families f
      WHERE f.id = family_invitations.family_id
        AND f.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.families f
      WHERE f.id = family_invitations.family_id
        AND f.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- DONE. Run verify-household-foundation.sql next.
-- ============================================================================
