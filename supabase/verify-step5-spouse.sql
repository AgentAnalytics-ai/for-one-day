-- ============================================================================
-- verify-step5-spouse.sql
-- Run AFTER Step 5 deploy + Sara accepts invite.
-- Replace emails below with your test accounts.
-- ============================================================================

-- S5-1 — Grant household has Pro entitlement
SELECT 'S5_1_grant_household_pro' AS gate,
  fe.plan,
  fe.billing_owner_id,
  CASE WHEN fe.plan IN ('pro', 'lifetime') THEN 'PASS' ELSE 'CHECK' END AS status
FROM auth.users u
JOIN public.family_members fm ON fm.user_id = u.id
JOIN public.family_entitlements fe ON fe.family_id = fm.family_id
WHERE lower(u.email) = lower('grantdecker22@hotmail.com')
  AND fm.role = 'owner';

-- S5-2 — Sara in same family_id as Grant (replace email)
SELECT 'S5_2_same_family' AS gate,
  g.family_id AS grant_family,
  s.family_id AS sara_family,
  CASE WHEN g.family_id = s.family_id AND g.family_id IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM (
  SELECT fm.family_id FROM auth.users u
  JOIN public.family_members fm ON fm.user_id = u.id
  WHERE lower(u.email) = lower('grantdecker22@hotmail.com')
) g
CROSS JOIN (
  SELECT fm.family_id FROM auth.users u
  JOIN public.family_members fm ON fm.user_id = u.id
  WHERE lower(u.email) = lower('SARA_EMAIL_HERE')
) s;

-- S5-3 — Both user_has_pro (replace Sara email)
SELECT 'S5_3_both_have_pro' AS gate,
  public.user_has_pro(g.id) AS grant_pro,
  public.user_has_pro(s.id) AS sara_pro,
  CASE
    WHEN public.user_has_pro(g.id) AND public.user_has_pro(s.id) THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM (
  SELECT id FROM auth.users WHERE lower(email) = lower('grantdecker22@hotmail.com')
) g
CROSS JOIN (
  SELECT id FROM auth.users WHERE lower(email) = lower('SARA_EMAIL_HERE')
) s;

-- S5-4 — Exactly one entitlement row for the household
SELECT 'S5_4_one_entitlement' AS gate,
  COUNT(*) AS entitlement_rows,
  CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END AS status
FROM public.family_entitlements fe
WHERE fe.family_id = (
  SELECT fm.family_id FROM auth.users u
  JOIN public.family_members fm ON fm.user_id = u.id
  WHERE lower(u.email) = lower('grantdecker22@hotmail.com')
  LIMIT 1
);

-- S5-5 — Sara is not billing owner; Grant is
SELECT 'S5_5_billing_owner' AS gate,
  fe.billing_owner_id = g.id AS grant_is_biller,
  CASE WHEN fe.billing_owner_id = g.id THEN 'PASS' ELSE 'FAIL' END AS status
FROM public.family_entitlements fe
JOIN auth.users g ON lower(g.email) = lower('grantdecker22@hotmail.com')
WHERE fe.family_id = (
  SELECT fm.family_id FROM public.family_members fm WHERE fm.user_id = g.id LIMIT 1
);

-- S5-6 — Invitation accepted (replace Sara email)
SELECT 'S5_6_invite_accepted' AS gate,
  fi.status,
  CASE WHEN fi.status = 'accepted' THEN 'PASS' ELSE 'FAIL' END AS status
FROM public.family_invitations fi
WHERE lower(fi.invited_email) = lower('SARA_EMAIL_HERE')
ORDER BY fi.created_at DESC
LIMIT 1;

-- S5-7 — No orphan Sara (member row exists)
SELECT 'S5_7_sara_has_membership' AS gate,
  COUNT(*) AS member_rows,
  CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END AS status
FROM auth.users u
JOIN public.family_members fm ON fm.user_id = u.id
WHERE lower(u.email) = lower('SARA_EMAIL_HERE');

-- S5-8 — Sara's solo home abandoned (no longer owner of another family)
SELECT 'S5_8_sara_solo_abandoned' AS gate,
  COUNT(*) AS families_owned,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM public.families f
JOIN auth.users u ON u.id = f.owner_id
WHERE lower(u.email) = lower('SARA_EMAIL_HERE');
