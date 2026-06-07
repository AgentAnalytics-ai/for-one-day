-- ============================================================================
-- 000_preflight_audit.sql
-- Run BEFORE 001_household_foundation.sql — read-only snapshot.
-- Save results; do not proceed if unexpected orphans or broken RLS.
-- ============================================================================

-- A1 — Table inventory
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'families', 'family_members', 'family_entitlements',
    'family_invitations', 'subscriptions', 'referral_entitlements'
  )
ORDER BY table_name;

-- A2 — Profiles without household membership
SELECT p.user_id, p.full_name, p.plan, u.email
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.family_members fm WHERE fm.user_id = p.user_id
)
ORDER BY p.created_at;

-- A3 — family_entitlements does NOT exist yet (expected before 001)
-- A1 will not list it; run verify-household-foundation.sql AFTER 001 for entitlement gates.
SELECT
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'family_entitlements'
  ) AS family_entitlements_exists,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'family_entitlements'
    ) THEN 'Already migrated — re-run verify-household-foundation.sql'
    ELSE 'EXPECTED — proceed to 001_household_foundation.sql'
  END AS next_step;

-- A4 — Pro users on profile vs subscription
SELECT
  p.user_id,
  p.plan AS profile_plan,
  s.status AS subscription_status,
  s.current_period_end
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.user_id
WHERE p.plan IN ('pro', 'lifetime')
   OR s.status IN ('active', 'trialing', 'past_due')
ORDER BY p.plan DESC, s.status;

-- A5 — family_members RLS policy check (circular = blocker)
SELECT policyname, qual::text AS policy_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'family_members';

-- A6 — Existing triggers on profiles
SELECT tgname, tgenabled
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'profiles'
  AND NOT t.tgisinternal;

-- A7 — Counts baseline
SELECT
  (SELECT COUNT(*) FROM public.profiles) AS profiles,
  (SELECT COUNT(*) FROM public.families) AS families,
  (SELECT COUNT(*) FROM public.family_members) AS family_members,
  (SELECT COUNT(*) FROM public.subscriptions WHERE status IN ('active', 'trialing')) AS active_subs;
