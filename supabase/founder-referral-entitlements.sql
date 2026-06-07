-- Founder referral entitlements (time-boxed premium grants).
-- Use this for beta access that auto-expires (e.g. 3 months).

create table if not exists public.referral_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'founder',
  grant_type text not null default 'founder_referral',
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referral_entitlements_ends_after_start check (ends_at > starts_at)
);

create index if not exists idx_referral_entitlements_user_status_end
  on public.referral_entitlements (user_id, status, ends_at desc);

alter table public.referral_entitlements enable row level security;

-- Users can read their own grants (for account/status display).
create policy "Users can read own referral entitlements"
  on public.referral_entitlements
  for select
  using (auth.uid() = user_id);

-- Service role / admin API manages inserts/updates.
-- No user-facing insert/update policies are created intentionally.

