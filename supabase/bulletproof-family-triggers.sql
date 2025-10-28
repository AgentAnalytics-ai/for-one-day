-- Meta Expert's Bulletproof Family Management
-- Database-level protection against duplicate families and broken limits

-- ============================================================================
-- FAMILY MANAGEMENT TRIGGERS
-- ============================================================================

-- Trigger 1: Ensure every user has exactly one family
CREATE OR REPLACE FUNCTION ensure_user_has_family()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run for new profile insertions
  IF TG_OP = 'INSERT' THEN
    -- Check if user already has a family
    IF NOT EXISTS (SELECT 1 FROM public.family_members WHERE user_id = NEW.user_id) THEN
      -- Create family
      INSERT INTO public.families (name, owner_id)
      VALUES (COALESCE(NEW.full_name, 'User') || '''s Family', NEW.user_id);
      
      -- Add user as owner
      INSERT INTO public.family_members (family_id, user_id, role, invitation_status, joined_at)
      SELECT f.id, NEW.user_id, 'owner', 'accepted', NOW()
      FROM public.families f
      WHERE f.owner_id = NEW.user_id
      AND NOT EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.family_id = f.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS ensure_family_on_profile_create ON public.profiles;
CREATE TRIGGER ensure_family_on_profile_create
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION ensure_user_has_family();

-- ============================================================================
-- LEGACY NOTE LIMIT ENFORCEMENT
-- ============================================================================

-- Function to check legacy note limits before insertion
CREATE OR REPLACE FUNCTION check_legacy_note_limits()
RETURNS TRIGGER AS $$
DECLARE
  user_plan text;
  current_count integer;
  max_allowed integer;
BEGIN
  -- Only check for legacy notes (kind = 'letter')
  IF NEW.kind = 'letter' THEN
    -- Get user's plan
    SELECT plan INTO user_plan
    FROM public.profiles
    WHERE user_id = NEW.owner_id;
    
    -- Set limits based on plan
    IF user_plan = 'free' THEN
      max_allowed := 5;
    ELSE
      max_allowed := -1; -- unlimited
    END IF;
    
    -- If unlimited, allow
    IF max_allowed = -1 THEN
      RETURN NEW;
    END IF;
    
    -- Count current legacy notes for this user
    SELECT COUNT(*) INTO current_count
    FROM public.vault_items
    WHERE owner_id = NEW.owner_id
    AND kind = 'letter';
    
    -- Check if adding this note would exceed limit
    IF current_count >= max_allowed THEN
      RAISE EXCEPTION 'Legacy note limit exceeded. Free users can create up to % notes. Upgrade to Pro for unlimited notes.', max_allowed;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on vault_items table
DROP TRIGGER IF EXISTS check_legacy_limits_before_insert ON public.vault_items;
CREATE TRIGGER check_legacy_limits_before_insert
  BEFORE INSERT ON public.vault_items
  FOR EACH ROW EXECUTE FUNCTION check_legacy_note_limits();

-- ============================================================================
-- FAMILY DUPLICATE PREVENTION
-- ============================================================================

-- Function to prevent duplicate family creation
CREATE OR REPLACE FUNCTION prevent_duplicate_families()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already owns a family
  IF EXISTS (SELECT 1 FROM public.families WHERE owner_id = NEW.owner_id) THEN
    RAISE EXCEPTION 'User already owns a family. Cannot create duplicate families.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on families table
DROP TRIGGER IF EXISTS prevent_duplicate_families_trigger ON public.families;
CREATE TRIGGER prevent_duplicate_families_trigger
  BEFORE INSERT ON public.families
  FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_families();

-- ============================================================================
-- HEALTH CHECK FUNCTIONS
-- ============================================================================

-- Function to check system health
CREATE OR REPLACE FUNCTION check_family_system_health()
RETURNS TABLE (
  check_name text,
  status text,
  details text
) AS $$
BEGIN
  -- Check for users without families
  RETURN QUERY
  SELECT 
    'Users without families' as check_name,
    CASE 
      WHEN COUNT(*) = 0 THEN 'PASS'
      ELSE 'FAIL'
    END as status,
    'Found ' || COUNT(*) || ' users without families' as details
  FROM public.profiles p
  LEFT JOIN public.family_members fm ON fm.user_id = p.user_id
  WHERE fm.user_id IS NULL;
  
  -- Check for duplicate families
  RETURN QUERY
  SELECT 
    'Duplicate families' as check_name,
    CASE 
      WHEN COUNT(*) = 0 THEN 'PASS'
      ELSE 'FAIL'
    END as status,
    'Found ' || COUNT(*) || ' users with multiple families' as details
  FROM (
    SELECT owner_id, COUNT(*) as family_count
    FROM public.families
    GROUP BY owner_id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  -- Check for orphaned family members
  RETURN QUERY
  SELECT 
    'Orphaned family members' as check_name,
    CASE 
      WHEN COUNT(*) = 0 THEN 'PASS'
      ELSE 'FAIL'
    END as status,
    'Found ' || COUNT(*) || ' family members without valid families' as details
  FROM public.family_members fm
  LEFT JOIN public.families f ON f.id = fm.family_id
  WHERE f.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION ensure_user_has_family() IS 'Automatically creates a family for new users';
COMMENT ON FUNCTION check_legacy_note_limits() IS 'Enforces legacy note limits at database level';
COMMENT ON FUNCTION prevent_duplicate_families() IS 'Prevents users from creating multiple families';
COMMENT ON FUNCTION check_family_system_health() IS 'Health check for family management system';
