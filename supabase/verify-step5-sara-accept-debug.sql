-- ============================================================================
-- verify-step5-sara-accept-debug.sql
-- Run when accept fails with "Couldn't join household"
-- Sara: sarawalton278@gmail.com
-- ============================================================================

-- D1 — Which accept function version is live? (003 replaces 002 logic)
SELECT 'D1_abandon_rpc' AS check,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'abandon_solo_household_if_eligible'
  ) THEN 'PASS — 003 applied' ELSE 'FAIL — run 003_household_join_abandon_solo.sql' END AS status;

-- D2 — Sara auth email vs invite email (must match)
SELECT 'D2_email_match' AS check,
  u.email AS auth_email,
  fi.invited_email,
  CASE WHEN lower(trim(u.email)) = lower(trim(fi.invited_email))
    THEN 'PASS' ELSE 'FAIL — sign in with invited email only' END AS status
FROM auth.users u
CROSS JOIN (
  SELECT invited_email FROM public.family_invitations
  WHERE lower(invited_email) = lower('sarawalton278@gmail.com')
  ORDER BY created_at DESC LIMIT 1
) fi
WHERE lower(u.email) = lower('sarawalton278@gmail.com');

-- D3 — Pending invite still valid?
SELECT 'D3_invite_status' AS check,
  status,
  expires_at > now() AS not_expired,
  created_at
FROM public.family_invitations
WHERE lower(invited_email) = lower('sarawalton278@gmail.com')
ORDER BY created_at DESC
LIMIT 1;

-- D4 — Sara household state (why accept blocks)
SELECT 'D4_sara_membership' AS check,
  f.name AS family_name,
  fm.role,
  fe.plan,
  fe.stripe_subscription_id IS NOT NULL AS has_stripe,
  f.owner_id = u.id AS sara_is_owner
FROM auth.users u
LEFT JOIN public.family_members fm ON fm.user_id = u.id
LEFT JOIN public.families f ON f.id = fm.family_id
LEFT JOIN public.family_entitlements fe ON fe.family_id = f.id
WHERE lower(u.email) = lower('sarawalton278@gmail.com');

-- D4b — WHY blocked? (run if D5 = BLOCKED)
SELECT 'D4b_block_reasons' AS check,
  u.email,
  f.id AS sara_family_id,
  f.name AS family_name,
  fm.role,
  (SELECT COUNT(*) FROM public.family_members x WHERE x.family_id = f.id) AS members_in_home,
  fe.plan AS family_plan,
  fe.stripe_subscription_id,
  p.plan AS profile_plan,
  (SELECT COUNT(*) FROM public.subscriptions s
   WHERE s.user_id = u.id AND s.status IN ('active', 'trialing')) AS active_stripe_subs,
  (SELECT COUNT(*) FROM public.referral_entitlements re
   WHERE re.user_id = u.id AND re.status = 'active' AND re.ends_at > now()) AS active_referrals
FROM auth.users u
JOIN public.family_members fm ON fm.user_id = u.id
JOIN public.families f ON f.id = fm.family_id
LEFT JOIN public.family_entitlements fe ON fe.family_id = f.id
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE lower(u.email) = lower('sarawalton278@gmail.com');

-- D5 — Can solo home be abandoned? (003 rules)
SELECT 'D5_solo_abandon_eligible' AS check,
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower('sarawalton278@gmail.com'))
      THEN 'NO USER'
    WHEN (SELECT COUNT(*) FROM public.family_members fm
          JOIN auth.users u ON u.id = fm.user_id
          WHERE lower(u.email) = lower('sarawalton278@gmail.com')) = 0
      THEN 'ELIGIBLE — no household yet'
    WHEN (SELECT COUNT(*) FROM public.family_members fm
          JOIN public.families f ON f.id = fm.family_id
          JOIN auth.users u ON u.id = fm.user_id AND f.owner_id = u.id
          WHERE lower(u.email) = lower('sarawalton278@gmail.com')) = 1
      AND (SELECT fe.stripe_subscription_id FROM public.family_entitlements fe
           JOIN public.families f ON f.id = fe.family_id
           JOIN auth.users u ON u.id = f.owner_id
           WHERE lower(u.email) = lower('sarawalton278@gmail.com') LIMIT 1) IS NULL
      AND (SELECT COUNT(*) FROM public.subscriptions s
           JOIN auth.users u ON u.id = s.user_id
           WHERE lower(u.email) = lower('sarawalton278@gmail.com')
             AND s.status IN ('active', 'trialing')) = 0
      AND (SELECT COUNT(*) FROM public.family_members fm
           JOIN public.families f ON f.id = fm.family_id
           JOIN auth.users u ON u.id = f.owner_id
           WHERE lower(u.email) = lower('sarawalton278@gmail.com')) = 1
      THEN 'ELIGIBLE — solo home can abandon (003/004, no family Stripe)'
    ELSE 'BLOCKED — multiple members, family Stripe, or active personal subscription'
  END AS status;

-- D6 — Manual accept test (run as Sara logged in via SQL editor won't work — use app)
-- Grant: resend invite link from:
SELECT 'D6_invite_link' AS check,
  'https://foroneday.app/auth/accept-invite?token=' || invitation_token AS invite_link
FROM public.family_invitations
WHERE lower(invited_email) = lower('sarawalton278@gmail.com')
  AND status = 'pending'
  AND expires_at > now()
ORDER BY created_at DESC
LIMIT 1;
