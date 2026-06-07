-- ============================================================================
-- verify-household-foundation.sql
-- Run AFTER 001_household_foundation.sql — every gate must pass before Step 3.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- G1 — Every profile has a household (or pending spouse invite)
-- FAIL if orphan_count > 0 (excluding users with pending invite only)
-- ----------------------------------------------------------------------------
SELECT 'G1_orphan_profiles' AS gate,
  COUNT(*) AS fail_count,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.family_members fm WHERE fm.user_id = p.user_id
)
AND NOT EXISTS (
  SELECT 1 FROM auth.users u
  JOIN public.family_invitations fi ON lower(fi.invited_email) = lower(u.email)
  WHERE u.id = p.user_id
    AND fi.status = 'pending'
    AND fi.expires_at > now()
);

-- ----------------------------------------------------------------------------
-- G2 — Every family has exactly one entitlement row
-- ----------------------------------------------------------------------------
SELECT 'G2_families_without_entitlement' AS gate,
  COUNT(*) AS fail_count,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM public.families f
WHERE NOT EXISTS (
  SELECT 1 FROM public.family_entitlements fe WHERE fe.family_id = f.id
);

-- ----------------------------------------------------------------------------
-- G3 — Pro/lifetime owners reflected on household entitlement
-- Lists mismatches (empty = PASS)
-- ----------------------------------------------------------------------------
SELECT 'G3_pro_mismatch' AS gate,
  f.id AS family_id,
  p.user_id AS owner_id,
  p.plan AS profile_plan,
  fe.plan AS household_plan
FROM public.families f
JOIN public.profiles p ON p.user_id = f.owner_id
JOIN public.family_entitlements fe ON fe.family_id = f.id
WHERE p.plan IN ('pro', 'lifetime')
  AND fe.plan NOT IN ('pro', 'lifetime');

-- ----------------------------------------------------------------------------
-- G4 — primary_family_id set for members
-- ----------------------------------------------------------------------------
SELECT 'G4_missing_primary_family_id' AS gate,
  COUNT(*) AS fail_count,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 FROM public.family_members fm WHERE fm.user_id = p.user_id
)
AND p.primary_family_id IS NULL;

-- ----------------------------------------------------------------------------
-- G5 — family_members RLS not recursive (policy uses families table, not self-join)
-- Manual review: qual should NOT reference is_family_member()
-- ----------------------------------------------------------------------------
SELECT 'G5_family_members_policy' AS gate,
  policyname,
  CASE
    WHEN qual::text ILIKE '%is_family_member%' THEN 'FAIL — circular'
    ELSE 'PASS'
  END AS status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'family_members'
  AND policyname = 'Users can view family members';

-- ----------------------------------------------------------------------------
-- G6 — user_has_pro() exists and is callable
-- ----------------------------------------------------------------------------
SELECT 'G6_user_has_pro_function' AS gate,
  proname,
  prosecdef AS security_definer,
  CASE WHEN proname IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname = 'user_has_pro';

-- ----------------------------------------------------------------------------
-- G7 — Bootstrap trigger active on profiles
-- ----------------------------------------------------------------------------
SELECT 'G7_bootstrap_trigger' AS gate,
  tgname,
  CASE WHEN tgname IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'profiles'
  AND t.tgname = 'ensure_family_on_profile_create'
  AND NOT t.tgisinternal;

-- ----------------------------------------------------------------------------
-- Summary roll-up (all numeric gates)
-- ----------------------------------------------------------------------------
SELECT gate, fail_count, status FROM (
  SELECT 'G1' AS gate,
    (SELECT COUNT(*) FROM public.profiles p
     WHERE NOT EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.user_id = p.user_id)
       AND NOT EXISTS (
         SELECT 1 FROM auth.users u
         JOIN public.family_invitations fi ON lower(fi.invited_email) = lower(u.email)
         WHERE u.id = p.user_id AND fi.status = 'pending' AND fi.expires_at > now()
       )
    ) AS fail_count,
    CASE WHEN (
      SELECT COUNT(*) FROM public.profiles p
      WHERE NOT EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.user_id = p.user_id)
        AND NOT EXISTS (
          SELECT 1 FROM auth.users u
          JOIN public.family_invitations fi ON lower(fi.invited_email) = lower(u.email)
          WHERE u.id = p.user_id AND fi.status = 'pending' AND fi.expires_at > now()
        )
    ) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
  UNION ALL
  SELECT 'G2',
    (SELECT COUNT(*) FROM public.families f
     WHERE NOT EXISTS (SELECT 1 FROM public.family_entitlements fe WHERE fe.family_id = f.id)),
    CASE WHEN (
      SELECT COUNT(*) FROM public.families f
      WHERE NOT EXISTS (SELECT 1 FROM public.family_entitlements fe WHERE fe.family_id = f.id)
    ) = 0 THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'G3',
    (SELECT COUNT(*) FROM public.families f
     JOIN public.profiles p ON p.user_id = f.owner_id
     JOIN public.family_entitlements fe ON fe.family_id = f.id
     WHERE p.plan IN ('pro', 'lifetime') AND fe.plan NOT IN ('pro', 'lifetime')),
    CASE WHEN (
      SELECT COUNT(*) FROM public.families f
     JOIN public.profiles p ON p.user_id = f.owner_id
     JOIN public.family_entitlements fe ON fe.family_id = f.id
     WHERE p.plan IN ('pro', 'lifetime') AND fe.plan NOT IN ('pro', 'lifetime')
    ) = 0 THEN 'PASS' ELSE 'FAIL' END
  UNION ALL
  SELECT 'G4',
    (SELECT COUNT(*) FROM public.profiles p
     WHERE EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.user_id = p.user_id)
       AND p.primary_family_id IS NULL),
    CASE WHEN (
      SELECT COUNT(*) FROM public.profiles p
     WHERE EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.user_id = p.user_id)
       AND p.primary_family_id IS NULL
    ) = 0 THEN 'PASS' ELSE 'FAIL' END
) s
ORDER BY gate;
