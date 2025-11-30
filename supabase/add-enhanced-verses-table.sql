-- Create table to cache enhanced verses (Pro feature)
-- Stores AI-generated verse explanations and prompts

CREATE TABLE IF NOT EXISTS public.enhanced_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  enhancement JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_enhanced_verses_reference 
ON public.enhanced_verses(reference);

-- Add comment
COMMENT ON TABLE public.enhanced_verses IS 
'Cached AI-enhanced verse explanations and prompts for Pro users. Stores verse context, meaning, and psychology-based reflection questions.';

-- Enable RLS (read-only for authenticated users)
ALTER TABLE public.enhanced_verses ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read (cached verses are shared)
CREATE POLICY "Authenticated users can read enhanced verses" 
ON public.enhanced_verses
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only service role can insert/update (via API)
CREATE POLICY "Service role can manage enhanced verses" 
ON public.enhanced_verses
FOR ALL 
USING (auth.role() = 'service_role');

-- ✅ Done! Enhanced verses table ready for Pro feature.

