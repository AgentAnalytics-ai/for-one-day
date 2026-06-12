-- Tablet slideshow: tag memories to rotate on the household kitchen wall.

ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS wall_slideshow BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_memories_wall_slideshow
  ON public.memories (created_at DESC)
  WHERE wall_slideshow = true;

COMMENT ON COLUMN public.memories.wall_slideshow IS
  'When true and photos exist, rotates on the household kitchen tablet (wall mode).';
