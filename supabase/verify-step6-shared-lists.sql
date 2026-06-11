-- ============================================================================
-- verify-step6-shared-lists.sql
-- Run AFTER 005 + deploy. Replace emails if needed.
-- Gate: Grant adds item → Sara sees it; free household cannot write.
-- ============================================================================

-- S6-1 — Table + RLS on
SELECT 'S6_1_list_items' AS gate,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'list_items'
  ) THEN 'PASS' ELSE 'FAIL — run 005' END AS status;

-- S6-2 — Grant household Pro (write gate)
SELECT 'S6_2_household_pro' AS gate,
  public.family_has_pro(fm.family_id) AS has_pro,
  CASE WHEN public.family_has_pro(fm.family_id) THEN 'PASS' ELSE 'FAIL' END AS status
FROM auth.users u
JOIN public.family_members fm ON fm.user_id = u.id
WHERE lower(u.email) = lower('grantdecker22@hotmail.com')
LIMIT 1;

-- S6-3 — Same family (cross-member sync)
SELECT 'S6_3_same_family' AS gate,
  CASE WHEN g.fid = s.fid AND g.fid IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM (
  SELECT fm.family_id AS fid FROM auth.users u
  JOIN public.family_members fm ON fm.user_id = u.id
  WHERE lower(u.email) = lower('grantdecker22@hotmail.com')
) g
CROSS JOIN (
  SELECT fm.family_id AS fid FROM auth.users u
  JOIN public.family_members fm ON fm.user_id = u.id
  WHERE lower(u.email) = lower('sarawalton278@gmail.com')
) s;

-- S6-4 — Sample item visible to both (insert as Grant in app first, or service role)
SELECT 'S6_4_shared_items' AS gate,
  COUNT(*) AS shopping_items,
  CASE WHEN COUNT(*) >= 0 THEN 'CHECK — add Milk in app, re-run COUNT >= 1' END AS status
FROM public.list_items li
WHERE li.family_id = (
  SELECT fm.family_id FROM auth.users u
  JOIN public.family_members fm ON fm.user_id = u.id
  WHERE lower(u.email) = lower('grantdecker22@hotmail.com')
  LIMIT 1
)
AND li.kind = 'shopping'
AND li.done = false;
