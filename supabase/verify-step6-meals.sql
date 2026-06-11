-- ============================================================================
-- verify-step6-meals.sql
-- Run AFTER 006_meal_plans.sql on prod
-- ============================================================================

SELECT 'S6C_1_table' AS gate,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'meal_plans'
  ) THEN 'PASS' ELSE 'FAIL — run 006' END AS status;

SELECT 'S6C_2_household_pro' AS gate,
  public.family_has_pro(fm.family_id) AS has_pro,
  CASE WHEN public.family_has_pro(fm.family_id) THEN 'PASS' ELSE 'FAIL' END AS status
FROM auth.users u
JOIN public.family_members fm ON fm.user_id = u.id
WHERE lower(u.email) = lower('grantdecker22@hotmail.com')
LIMIT 1;

SELECT 'S6C_3_meals_this_week' AS gate,
  COUNT(*) AS meal_rows,
  CASE WHEN COUNT(*) >= 0 THEN 'CHECK — set Wed dinner in app' END AS status
FROM public.meal_plans mp
WHERE mp.family_id = (
  SELECT fm.family_id FROM auth.users u
  JOIN public.family_members fm ON fm.user_id = u.id
  WHERE lower(u.email) = lower('grantdecker22@hotmail.com')
  LIMIT 1
);
