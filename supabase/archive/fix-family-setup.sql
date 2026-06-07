-- Meta Expert's Family Setup Fix
-- Safe, idempotent operations to fix family setup

-- Phase 2: Create Grant's family (idempotent)
INSERT INTO public.families (name, owner_id)
SELECT 'Grant''s Family', p.user_id
FROM public.profiles p
WHERE (p.full_name ILIKE '%grant%' OR p.full_name ILIKE '%decker%')
AND NOT EXISTS (SELECT 1 FROM public.families f WHERE f.owner_id = p.user_id)
RETURNING id, name, owner_id;

-- Phase 3: Add Grant as family owner (idempotent)
INSERT INTO public.family_members (family_id, user_id, role, invitation_status, joined_at)
SELECT f.id, f.owner_id, 'owner', 'accepted', NOW()
FROM public.families f
WHERE f.owner_id IN (
  SELECT user_id FROM public.profiles 
  WHERE full_name ILIKE '%grant%' OR full_name ILIKE '%decker%'
)
AND NOT EXISTS (
  SELECT 1 FROM public.family_members fm 
  WHERE fm.family_id = f.id AND fm.user_id = f.owner_id
)
RETURNING family_id, user_id, role, invitation_status;

-- Phase 4: Create invitation for Sara (idempotent)
INSERT INTO public.family_invitations (family_id, invited_email, invited_name, role, invited_by, invitation_token, expires_at, status)
SELECT 
  f.id, 
  'sarawalton278@gmail.com', 
  'Sara Decker', 
  'spouse', 
  f.owner_id, 
  'invite-' || gen_random_uuid(), 
  NOW() + INTERVAL '7 days', 
  'pending'
FROM public.families f
WHERE f.owner_id IN (
  SELECT user_id FROM public.profiles 
  WHERE full_name ILIKE '%grant%' OR full_name ILIKE '%decker%'
)
ON CONFLICT (invited_email, family_id) DO NOTHING
RETURNING id, family_id, invited_email, invited_name, role, status, expires_at;
