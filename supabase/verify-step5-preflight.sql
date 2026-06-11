-- ============================================================================
-- verify-step5-preflight.sql
-- Run in Supabase SQL Editor BEFORE testing spouse invite.
-- All gates should PASS before inviting Sara.
-- ============================================================================

-- P1 — accept RPC exists (002 migration)
SELECT 'P1_accept_rpc' AS gate,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'accept_family_invitation'
  ) THEN 'PASS' ELSE 'FAIL — run 002_household_invite_accept.sql' END AS status;

-- P2 — pending accept RPC exists (002)
SELECT 'P2_pending_rpc' AS gate,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'accept_pending_household_invitation'
  ) THEN 'PASS' ELSE 'FAIL — run 002' END AS status;

-- P3 — solo abandon RPC exists (003 migration — needed if invitee already has account)
SELECT 'P3_abandon_solo_rpc' AS gate,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'abandon_solo_household_if_eligible'
  ) THEN 'PASS' ELSE 'FAIL — run 003_household_join_abandon_solo.sql' END AS status;

-- P4 — family_invitations table
SELECT 'P4_invitations_table' AS gate,
  CASE WHEN to_regclass('public.family_invitations') IS NOT NULL
    THEN 'PASS' ELSE 'FAIL — run 001' END AS status;

-- P5 — Grant is household owner (replace email)
SELECT 'P5_grant_is_owner' AS gate,
  f.name,
  fm.role,
  CASE WHEN f.owner_id = u.id AND fm.role = 'owner' THEN 'PASS' ELSE 'FAIL' END AS status
FROM auth.users u
JOIN public.family_members fm ON fm.user_id = u.id
JOIN public.families f ON f.id = fm.family_id
WHERE lower(u.email) = lower('grantdecker22@hotmail.com');

-- P6 — Recent invite for Sara (replace email; run AFTER send attempt)
-- No rows = invite never saved (RLS or UI error). pending = check Resend. accepted = done.
SELECT 'P6_invite_row' AS gate,
  fi.invited_email,
  fi.status,
  fi.expires_at > now() AS not_expired,
  fi.created_at
FROM public.family_invitations fi
WHERE lower(fi.invited_email) = lower('sarawalton278@gmail.com')
ORDER BY fi.created_at DESC
LIMIT 1;
