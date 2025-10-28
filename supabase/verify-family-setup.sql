-- Meta Expert's Family Setup Verification
-- Phase 5: Verify everything is working correctly

-- Step 5.1: Verify Grant's family setup
SELECT 'Grant Family' as check_type, f.id, f.name, f.owner_id, f.created_at
FROM public.families f 
WHERE f.owner_id IN (
  SELECT user_id FROM public.profiles 
  WHERE full_name ILIKE '%grant%' OR full_name ILIKE '%decker%'
);

-- Step 5.2: Verify Grant's family membership
SELECT 'Grant Membership' as check_type, fm.family_id, fm.user_id, fm.role, fm.invitation_status, fm.joined_at
FROM public.family_members fm
WHERE fm.user_id IN (
  SELECT user_id FROM public.profiles 
  WHERE full_name ILIKE '%grant%' OR full_name ILIKE '%decker%'
);

-- Step 5.3: Verify Sara's invitation
SELECT 'Sara Invitation' as check_type, fi.id, fi.family_id, fi.invited_email, fi.invited_name, fi.role, fi.status, fi.expires_at
FROM public.family_invitations fi
WHERE fi.invited_email = 'sarawalton278@gmail.com'
ORDER BY fi.created_at DESC;

-- Step 5.4: Final health check
SELECT 'Final Counts' as check_type, 'families' as table_name, count(*) as count FROM public.families
UNION ALL
SELECT 'Final Counts', 'family_members', count(*) FROM public.family_members  
UNION ALL
SELECT 'Final Counts', 'family_invitations', count(*) FROM public.family_invitations;

-- Step 5.5: Test invitation link generation
SELECT 'Invitation Link' as check_type, 
  'https://foroneday.app/auth/signup?invite=' || fi.family_id || '&role=' || fi.role as invitation_url,
  fi.invited_email,
  fi.expires_at
FROM public.family_invitations fi
WHERE fi.invited_email = 'sarawalton278@gmail.com'
ORDER BY fi.created_at DESC
LIMIT 1;
