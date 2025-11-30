-- Add reflection_style column to profiles table
-- Supports personalized reflection experiences while staying Christian-focused

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS reflection_style TEXT 
DEFAULT 'auto' 
CHECK (reflection_style IN ('auto', 'scholar', 'contemplative', 'practical', 'creative', 'quick'));

COMMENT ON COLUMN public.profiles.reflection_style IS 
'User preferred reflection style: auto (detected from behavior), scholar (deep study), contemplative (meditative), practical (action-oriented), creative (visual/artistic), quick (brief check-in). All styles use Christian verses, just different approaches.';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_reflection_style 
ON public.profiles(reflection_style) 
WHERE reflection_style IS NOT NULL;

-- ✅ Done! Users can now have personalized reflection experiences.

