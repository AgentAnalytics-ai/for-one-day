-- ============================================================================
-- 011_families_timezone.sql
-- V7a — one timezone per household (kitchen wall clock).
-- ============================================================================

ALTER TABLE public.families
  ADD COLUMN IF NOT EXISTS timezone text;

COMMENT ON COLUMN public.families.timezone IS
  'IANA timezone for the home (e.g. America/Chicago). Drives Today clock, week boundaries, meals.';

-- NULL = not confirmed yet; app uses FALLBACK until a member sets it in Settings or Today prompt.

CREATE OR REPLACE FUNCTION public.set_family_timezone(p_family_id uuid, p_timezone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_timezone IS NULL OR char_length(trim(p_timezone)) = 0 THEN
    RAISE EXCEPTION 'timezone required';
  END IF;
  IF NOT public.is_family_member(p_family_id) THEN
    RAISE EXCEPTION 'not a household member';
  END IF;
  UPDATE public.families
  SET timezone = trim(p_timezone), updated_at = now()
  WHERE id = p_family_id;
END;
$$;

COMMENT ON FUNCTION public.set_family_timezone IS
  'Household members set kitchen-wall timezone without widening families UPDATE RLS.';
