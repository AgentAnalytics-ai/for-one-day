-- ============================================================================
-- 009_meal_ideas.sql
-- Step 6E — household saved recipe links (Pinterest, etc.)
-- Picked in dinner walk-through instead of copy-paste every time.
-- Run after 006 on prod.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.meal_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  source_url text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.meal_ideas IS
  'Household saved recipe links — pick in dinner walk-through (6E).';

CREATE INDEX IF NOT EXISTS idx_meal_ideas_family_created
  ON public.meal_ideas (family_id, created_at DESC);

DROP TRIGGER IF EXISTS meal_ideas_updated_at ON public.meal_ideas;
CREATE TRIGGER meal_ideas_updated_at
  BEFORE UPDATE ON public.meal_ideas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.meal_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view household meal ideas" ON public.meal_ideas;
CREATE POLICY "Members can view household meal ideas"
  ON public.meal_ideas FOR SELECT
  USING (public.is_family_member(family_id));

DROP POLICY IF EXISTS "Pro households can add meal ideas" ON public.meal_ideas;
CREATE POLICY "Pro households can add meal ideas"
  ON public.meal_ideas FOR INSERT
  WITH CHECK (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  );

DROP POLICY IF EXISTS "Pro households can update meal ideas" ON public.meal_ideas;
CREATE POLICY "Pro households can update meal ideas"
  ON public.meal_ideas FOR UPDATE
  USING (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  )
  WITH CHECK (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  );

DROP POLICY IF EXISTS "Pro households can delete meal ideas" ON public.meal_ideas;
CREATE POLICY "Pro households can delete meal ideas"
  ON public.meal_ideas FOR DELETE
  USING (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  );

-- meal_plans.idea_id → meal_ideas (optional link when dinner saved from a pick)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meal_plans_idea_id_fkey'
  ) THEN
    ALTER TABLE public.meal_plans
      ADD CONSTRAINT meal_plans_idea_id_fkey
      FOREIGN KEY (idea_id) REFERENCES public.meal_ideas(id) ON DELETE SET NULL;
  END IF;
END $$;
