-- ============================================================================
-- verify-step7-google-calendar.sql
-- Run AFTER 007_calendar_connections.sql + Google OAuth configured
-- ============================================================================

SELECT 'S7_1_table' AS gate,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'calendar_connections'
  ) THEN 'PASS' ELSE 'FAIL — run 007' END AS status;

SELECT 'S7_2_grant_connection' AS gate,
  COUNT(*) AS google_connections,
  CASE WHEN COUNT(*) >= 0 THEN 'CHECK — connect in Settings → Profile' END AS status
FROM public.calendar_connections cc
JOIN auth.users u ON u.id = cc.user_id
WHERE lower(u.email) = lower('grantdecker22@hotmail.com')
  AND cc.provider = 'google';
