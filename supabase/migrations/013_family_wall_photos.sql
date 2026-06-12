-- Household kitchen tablet gallery — one row per photo (not bundled memories).

CREATE TABLE IF NOT EXISTS public.family_wall_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, storage_path)
);

COMMENT ON TABLE public.family_wall_photos IS
  'Photos that rotate on the household kitchen tablet. One row per image.';

CREATE INDEX IF NOT EXISTS idx_family_wall_photos_family_created
  ON public.family_wall_photos (family_id, created_at DESC);

ALTER TABLE public.family_wall_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view household wall photos" ON public.family_wall_photos;
CREATE POLICY "Members can view household wall photos"
  ON public.family_wall_photos FOR SELECT
  USING (public.is_family_member(family_id));

DROP POLICY IF EXISTS "Members can add household wall photos" ON public.family_wall_photos;
CREATE POLICY "Members can add household wall photos"
  ON public.family_wall_photos FOR INSERT
  WITH CHECK (
    public.is_family_member(family_id)
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Members can remove household wall photos" ON public.family_wall_photos;
CREATE POLICY "Members can remove household wall photos"
  ON public.family_wall_photos FOR DELETE
  USING (public.is_family_member(family_id));
