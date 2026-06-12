-- ============================================================================
-- 010_meal_day_slots.sql
-- Optional breakfast + lunch titles per day (dinner stays in title).
-- ============================================================================

ALTER TABLE public.meal_plans
  ADD COLUMN IF NOT EXISTS breakfast_title text,
  ADD COLUMN IF NOT EXISTS lunch_title text;

COMMENT ON COLUMN public.meal_plans.breakfast_title IS
  'Optional household breakfast for this day.';
COMMENT ON COLUMN public.meal_plans.lunch_title IS
  'Optional household lunch for this day.';
