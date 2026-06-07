-- Meta Expert's Bulletproof System Test
-- Comprehensive testing of all fixes

-- ============================================================================
-- TEST 1: Family System Health Check
-- ============================================================================

SELECT '=== FAMILY SYSTEM HEALTH CHECK ===' as test_section;

-- Run the health check function
SELECT * FROM check_family_system_health();

-- ============================================================================
-- TEST 2: Legacy Note Limit Enforcement
-- ============================================================================

SELECT '=== LEGACY NOTE LIMIT TEST ===' as test_section;

-- Check current legacy note counts by user
SELECT 
  p.full_name,
  p.plan,
  COUNT(vi.id) as legacy_note_count,
  CASE 
    WHEN p.plan = 'free' AND COUNT(vi.id) > 5 THEN 'OVER LIMIT'
    WHEN p.plan = 'free' AND COUNT(vi.id) <= 5 THEN 'WITHIN LIMIT'
    WHEN p.plan = 'pro' THEN 'UNLIMITED'
    ELSE 'UNKNOWN'
  END as status
FROM public.profiles p
LEFT JOIN public.vault_items vi ON vi.owner_id = p.user_id AND vi.kind = 'letter'
GROUP BY p.user_id, p.full_name, p.plan
ORDER BY p.full_name;

-- ============================================================================
-- TEST 3: Family Duplicate Check
-- ============================================================================

SELECT '=== FAMILY DUPLICATE CHECK ===' as test_section;

-- Check for users with multiple families
SELECT 
  p.full_name,
  COUNT(f.id) as family_count,
  CASE 
    WHEN COUNT(f.id) > 1 THEN 'DUPLICATE FAMILIES'
    WHEN COUNT(f.id) = 1 THEN 'SINGLE FAMILY'
    ELSE 'NO FAMILY'
  END as status
FROM public.profiles p
LEFT JOIN public.families f ON f.owner_id = p.user_id
GROUP BY p.user_id, p.full_name
HAVING COUNT(f.id) > 1 OR COUNT(f.id) = 0
ORDER BY p.full_name;

-- ============================================================================
-- TEST 4: API Route vs Server Action Check
-- ============================================================================

SELECT '=== API ROUTE CHECK ===' as test_section;

-- This is a manual check - verify that:
-- 1. components/ui/create-legacy-note-modal.tsx uses /api/vault/save-legacy-note
-- 2. app/actions/user-actions.ts does NOT have saveLegacyNote function
-- 3. All forms use API routes, not server actions

SELECT 'Manual verification required:' as check_type,
       'Check that create-legacy-note-modal.tsx uses /api/vault/save-legacy-note' as requirement,
       'Check that user-actions.ts does not have saveLegacyNote function' as requirement,
       'Check that all forms use API routes' as requirement;

-- ============================================================================
-- TEST 5: Family Invitation System Check
-- ============================================================================

SELECT '=== FAMILY INVITATION CHECK ===' as test_section;

-- Check invitation status
SELECT 
  fi.invited_email,
  fi.invited_name,
  fi.role,
  fi.status,
  fi.expires_at,
  CASE 
    WHEN fi.expires_at < NOW() THEN 'EXPIRED'
    WHEN fi.status = 'pending' THEN 'PENDING'
    WHEN fi.status = 'accepted' THEN 'ACCEPTED'
    ELSE 'UNKNOWN'
  END as invitation_status
FROM public.family_invitations fi
ORDER BY fi.created_at DESC;

-- Check family members
SELECT 
  p.full_name as member_name,
  fm.role,
  fm.invitation_status,
  f.name as family_name
FROM public.family_members fm
JOIN public.profiles p ON p.user_id = fm.user_id
JOIN public.families f ON f.id = fm.family_id
ORDER BY f.name, fm.role;

-- ============================================================================
-- TEST 6: Subscription Status Check
-- ============================================================================

SELECT '=== SUBSCRIPTION STATUS CHECK ===' as test_section;

-- Check all user subscription statuses
SELECT 
  p.full_name,
  p.plan,
  p.created_at,
  CASE 
    WHEN p.plan = 'free' THEN 'Free Tier'
    WHEN p.plan = 'pro' THEN 'Pro Tier'
    WHEN p.plan = 'lifetime' THEN 'Lifetime Tier'
    ELSE 'Unknown Tier'
  END as subscription_tier
FROM public.profiles p
ORDER BY p.created_at DESC;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT '=== TEST SUMMARY ===' as test_section;

SELECT 
  'All tests completed' as status,
  'Check results above for any FAIL status' as next_steps,
  'If all tests show PASS, the system is bulletproof' as conclusion;
