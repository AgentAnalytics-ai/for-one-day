-- ============================================================================
-- verify-step6-preflight.sql
-- Run BEFORE 005_list_items.sql on prod
-- ============================================================================

-- P6-1 — Step 5 household intact (use your prod emails)
SELECT 'P6_1_same_household' AS gate,
  g.email AS grant_email,
  g.family_id AS grant_family,
  s.family_id AS sara_family,
  CASE WHEN g.family_id = s.family_id AND g.family_id IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM (
  SELECT u.email, fm.family_id
  FROM auth.users u
  JOIN public.family_members fm ON fm.user_id = u.id
  WHERE lower(u.email) = lower('grantdecker22@hotmail.com')
) g
CROSS JOIN (
  SELECT fm.family_id
  FROM auth.users u
  JOIN public.family_members fm ON fm.user_id = u.id
  WHERE lower(u.email) = lower('sarawalton278@gmail.com')
) s;

-- P6-2 — Entitlement helpers exist (from 001)
SELECT 'P6_2_family_has_pro' AS gate,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'family_has_pro'
  ) THEN 'PASS' ELSE 'FAIL — run 001_household_foundation.sql' END AS status;

-- P6-3 — Grant household is Pro (lists write gate)
SELECT 'P6_3_grant_household_pro' AS gate,
  fe.plan,
  public.family_has_pro(fe.family_id) AS has_pro,
  CASE WHEN public.family_has_pro(fe.family_id) THEN 'PASS' ELSE 'FAIL — upgrade household' END AS status
FROM auth.users u
JOIN public.family_members fm ON fm.user_id = u.id
JOIN public.family_entitlements fe ON fe.family_id = fm.family_id
WHERE lower(u.email) = lower('grantdecker22@hotmail.com')
  AND fm.role = 'owner';

-- P6-4 — list_items not yet applied (run 005 if FAIL here means table missing — expected pre-migration)
SELECT 'P6_4_list_items_table' AS gate,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'list_items'
  ) THEN 'EXISTS — 005 applied' ELSE 'READY — run 005_list_items.sql' END AS status;
