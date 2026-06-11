-- ============================================================================
-- 007_calendar_connections.sql
-- Step 7A — per-user calendar OAuth (Google first; microsoft in 7D)
-- Tokens read/written server-side only (service role). No client RLS SELECT.
-- Run on prod after 006.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.calendar_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('google', 'microsoft')),
  provider_account_id text,
  account_email text,
  refresh_token text NOT NULL,
  access_token text,
  token_expires_at timestamptz,
  calendar_id text NOT NULL DEFAULT 'primary',
  display_color text NOT NULL DEFAULT '#1e3a5f',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT calendar_connections_user_provider_unique UNIQUE (user_id, provider)
);

COMMENT ON TABLE public.calendar_connections IS
  'OAuth calendar links per user. Refresh tokens — service role access only.';

CREATE INDEX IF NOT EXISTS idx_calendar_connections_user
  ON public.calendar_connections (user_id);

DROP TRIGGER IF EXISTS calendar_connections_updated_at ON public.calendar_connections;
CREATE TRIGGER calendar_connections_updated_at
  BEFORE UPDATE ON public.calendar_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;

-- No authenticated policies — tokens never exposed to the browser client.
