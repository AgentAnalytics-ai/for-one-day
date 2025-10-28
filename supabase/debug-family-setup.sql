-- Meta Expert's Family Setup Diagnosis
-- Phase 1: Safe read-only health check

-- Step 1.1: Overall health check
SELECT 'families' as table_name, count(*) as count FROM public.families
UNION ALL
SELECT 'family_members', count(*) FROM public.family_members  
UNION ALL
SELECT 'family_invitations', count(*) FROM public.family_invitations
UNION ALL
SELECT 'profiles', count(*) FROM public.profiles;

-- Step 1.2: Find Grant's user details
SELECT 'Grant Profile' as check_type, user_id, full_name, plan, created_at 
FROM public.profiles 
WHERE full_name ILIKE '%grant%' OR full_name ILIKE '%decker%'
ORDER BY created_at DESC;

-- Step 1.3: Check if Grant has a family
SELECT 'Grant Family Check' as check_type, f.id as family_id, f.name, f.owner_id
FROM public.families f 
WHERE f.owner_id IN (
  SELECT user_id FROM public.profiles 
  WHERE full_name ILIKE '%grant%' OR full_name ILIKE '%decker%'
);

-- Step 1.4: Check if Grant is a family member
SELECT 'Grant Family Membership' as check_type, fm.family_id, fm.role, fm.invitation_status
FROM public.family_members fm
WHERE fm.user_id IN (
  SELECT user_id FROM public.profiles 
  WHERE full_name ILIKE '%grant%' OR full_name ILIKE '%decker%'
);

-- Step 1.5: Check for Sara's profile
SELECT 'Sara Profile Check' as check_type, user_id, full_name, plan, created_at
FROM public.profiles 
WHERE full_name ILIKE '%sara%' OR email ILIKE '%sara%';

-- Step 1.6: Check for any existing invitations
SELECT 'Existing Invitations' as check_type, id, family_id, invited_email, invited_name, role, status, created_at
FROM public.family_invitations
ORDER BY created_at DESC
LIMIT 10;
