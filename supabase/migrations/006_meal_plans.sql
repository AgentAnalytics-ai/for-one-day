-- ============================================================================
-- 006_meal_plans.sql
-- Step 6C — shared dinner plan on family_id (one title per night)
-- Writes gated by family_has_pro(). idea_id reserved for Pinterest inbox (6E).
-- Run after 005 on prod.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  idea_id uuid,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT meal_plans_family_date_unique UNIQUE (family_id, plan_date)
);

COMMENT ON TABLE public.meal_plans IS
  'Household dinner plan — one row per night. Title only in 6C; idea_id for link saves in 6E.';

CREATE INDEX IF NOT EXISTS idx_meal_plans_family_date
  ON public.meal_plans (family_id, plan_date);

DROP TRIGGER IF EXISTS meal_plans_updated_at ON public.meal_plans;
CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view household meals" ON public.meal_plans;
CREATE POLICY "Members can view household meals"
  ON public.meal_plans FOR SELECT
  USING (public.is_family_member(family_id));

DROP POLICY IF EXISTS "Pro households can add meals" ON public.meal_plans;
CREATE POLICY "Pro households can add meals"
  ON public.meal_plans FOR INSERT
  WITH CHECK (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  );

DROP POLICY IF EXISTS "Pro households can update meals" ON public.meal_plans;
CREATE POLICY "Pro households can update meals"
  ON public.meal_plans FOR UPDATE
  USING (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  )
  WITH CHECK (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  );

DROP POLICY IF EXISTS "Pro households can delete meals" ON public.meal_plans;
CREATE POLICY "Pro households can delete meals"
  ON public.meal_plans FOR DELETE
  USING (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  );
