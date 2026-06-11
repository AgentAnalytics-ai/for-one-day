-- Step 6E — meal_ideas saved recipe inbox
-- Run AFTER 009_meal_ideas.sql on prod

SELECT
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'meal_ideas'
  ) AS meal_ideas_table,
  (
    SELECT COUNT(*)::int FROM public.meal_ideas
  ) AS saved_recipes,
  (
    SELECT COUNT(*)::int
    FROM pg_constraint
    WHERE conname = 'meal_plans_idea_id_fkey'
  ) AS meal_plans_idea_fk;
