-- ============================================================================
-- 008_calendar_ids.sql
-- Step 7A½ — merge Primary + Birthdays (Contacts) calendars per user
-- Run after 007 on prod.
-- ============================================================================

ALTER TABLE public.calendar_connections
  ADD COLUMN IF NOT EXISTS calendar_ids text[] NOT NULL DEFAULT ARRAY['primary']::text[];

COMMENT ON COLUMN public.calendar_connections.calendar_ids IS
  'Google calendar IDs to merge (primary + birthdays from Contacts).';

UPDATE public.calendar_connections
SET calendar_ids = ARRAY[calendar_id]
WHERE calendar_ids IS NULL OR calendar_ids = '{}'::text[];
