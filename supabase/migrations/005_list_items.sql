-- ============================================================================
-- 005_list_items.sql
-- Step 6A — shared shopping + todo lists on family_id
-- Writes gated by family_has_pro() (household Stripe plan).
-- Run after 001 on prod. Then run verify-step6-shared-lists.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('shopping', 'todo')),
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  done boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  due_date date,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.list_items IS
  'Household shared lists (shopping, todo). family_id scoped; writes require Pro household.';

CREATE INDEX IF NOT EXISTS idx_list_items_family_kind
  ON public.list_items (family_id, kind, done, sort_order);

CREATE INDEX IF NOT EXISTS idx_list_items_family_todo_due
  ON public.list_items (family_id, due_date)
  WHERE kind = 'todo';

DROP TRIGGER IF EXISTS list_items_updated_at ON public.list_items;
CREATE TRIGGER list_items_updated_at
  BEFORE UPDATE ON public.list_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view household lists" ON public.list_items;
CREATE POLICY "Members can view household lists"
  ON public.list_items FOR SELECT
  USING (public.is_family_member(family_id));

DROP POLICY IF EXISTS "Pro households can add list items" ON public.list_items;
CREATE POLICY "Pro households can add list items"
  ON public.list_items FOR INSERT
  WITH CHECK (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  );

DROP POLICY IF EXISTS "Pro households can update list items" ON public.list_items;
CREATE POLICY "Pro households can update list items"
  ON public.list_items FOR UPDATE
  USING (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  )
  WITH CHECK (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  );

DROP POLICY IF EXISTS "Pro households can delete list items" ON public.list_items;
CREATE POLICY "Pro households can delete list items"
  ON public.list_items FOR DELETE
  USING (
    public.is_family_member(family_id)
    AND public.family_has_pro(family_id)
  );
