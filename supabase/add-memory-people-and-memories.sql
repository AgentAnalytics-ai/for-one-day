-- Memory People & Memories — capture moments for someone you love (photo + note + person)
-- Run in Supabase SQL Editor after existing migrations.

-- ============================================================================
-- MEMORY PEOPLE (e.g. "Jamie", "Mom")
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.memory_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  relationship TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_people_user ON public.memory_people(user_id, sort_order, display_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_people_user_display_name_unique
  ON public.memory_people (user_id, lower(display_name));

COMMENT ON TABLE public.memory_people IS 'People the user captures memories for (kids, partner, parents, etc.)';

-- ============================================================================
-- MEMORIES (many per person; optional polished text from AI)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.memory_people(id) ON DELETE CASCADE,
  body_text TEXT NOT NULL DEFAULT '',
  polished_text TEXT,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_user_created ON public.memories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_person_created ON public.memories(person_id, created_at DESC);

COMMENT ON TABLE public.memories IS 'Photo + note memories scoped to a memory_person';
COMMENT ON COLUMN public.memories.polished_text IS 'Optional AI-polished or expanded version; body_text is source of truth from user';

-- Keep updated_at fresh on edits.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_memory_people_updated_at ON public.memory_people;
CREATE TRIGGER trg_memory_people_updated_at
  BEFORE UPDATE ON public.memory_people
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_memories_updated_at ON public.memories;
CREATE TRIGGER trg_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE public.memory_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own memory people" ON public.memory_people;
CREATE POLICY "Users manage own memory people" ON public.memory_people
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own memories" ON public.memories;
CREATE POLICY "Users manage own memories" ON public.memories
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
