-- Referral code system for self-serve founder/beta grants.
-- Uses hashed codes and an atomic redeem function.

create extension if not exists pgcrypto;

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  label text,
  grant_type text not null default 'founder_referral',
  months_granted integer not null default 3 check (months_granted >= 1 and months_granted <= 24),
  max_redemptions integer not null default 1 check (max_redemptions >= 1),
  used_count integer not null default 0 check (used_count >= 0),
  active boolean not null default true,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_referral_codes_active_expires
  on public.referral_codes (active, expires_at);

create table if not exists public.referral_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.referral_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (code_id, user_id)
);

create index if not exists idx_referral_redemptions_user
  on public.referral_code_redemptions (user_id, redeemed_at desc);

alter table public.referral_codes enable row level security;
alter table public.referral_code_redemptions enable row level security;

-- Users can inspect only their own redemption history.
create policy "Users can read own code redemptions"
  on public.referral_code_redemptions
  for select
  using (auth.uid() = user_id);

-- Users cannot read code inventory directly.
-- No select policy on referral_codes by design.

create or replace function public.redeem_referral_code(p_code_input text)
returns table (
  success boolean,
  message text,
  access_ends_at timestamptz,
  months_granted integer,
  grant_type text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code_normalized text;
  v_code_hash text;
  v_code public.referral_codes%rowtype;
  v_now timestamptz := now();
  v_months integer;
  v_existing_entitlement_id uuid;
  v_existing_entitlement_end timestamptz;
  v_effective_start timestamptz;
  v_new_end timestamptz;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  v_code_normalized := upper(trim(coalesce(p_code_input, '')));
  if length(v_code_normalized) < 4 then
    return query select false, 'Please enter a valid referral code.', null::timestamptz, null::integer, null::text;
    return;
  end if;

  v_code_hash := encode(digest(v_code_normalized, 'sha256'), 'hex');

  select *
  into v_code
  from public.referral_codes
  where code_hash = v_code_hash
    and active = true
    and (expires_at is null or expires_at > v_now)
  for update;

  if not found then
    return query select false, 'Invalid or expired referral code.', null::timestamptz, null::integer, null::text;
    return;
  end if;

  if exists (
    select 1 from public.referral_code_redemptions r
    where r.code_id = v_code.id
      and r.user_id = v_user_id
  ) then
    return query select false, 'You already redeemed this code.', null::timestamptz, null::integer, null::text;
    return;
  end if;

  if v_code.used_count >= v_code.max_redemptions then
    return query select false, 'This referral code has already been used.', null::timestamptz, null::integer, null::text;
    return;
  end if;

  insert into public.referral_code_redemptions (code_id, user_id)
  values (v_code.id, v_user_id);

  update public.referral_codes
  set used_count = used_count + 1,
      updated_at = v_now
  where id = v_code.id;

  v_months := coalesce(v_code.months_granted, 3);

  select id, ends_at
  into v_existing_entitlement_id, v_existing_entitlement_end
  from public.referral_entitlements
  where user_id = v_user_id
    and grant_type = v_code.grant_type
    and status = 'active'
    and ends_at > v_now
  order by ends_at desc
  limit 1
  for update;

  v_effective_start := greatest(v_now, coalesce(v_existing_entitlement_end, v_now));
  v_new_end := v_effective_start + make_interval(months => v_months);

  if v_existing_entitlement_id is not null then
    update public.referral_entitlements
    set ends_at = v_new_end,
        updated_at = v_now,
        metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
          'last_redeemed_code_label', v_code.label,
          'last_redeemed_at', v_now
        )
    where id = v_existing_entitlement_id;
  else
    insert into public.referral_entitlements (
      user_id,
      source,
      grant_type,
      status,
      starts_at,
      ends_at,
      metadata
    ) values (
      v_user_id,
      'referral_code',
      v_code.grant_type,
      'active',
      v_now,
      v_new_end,
      jsonb_build_object(
        'redeemed_code_label', v_code.label,
        'redeemed_at', v_now
      )
    );
  end if;

  return query
    select true,
           'Referral code applied successfully.',
           v_new_end,
           v_months,
           v_code.grant_type;
end;
$$;

revoke all on function public.redeem_referral_code(text) from public;
grant execute on function public.redeem_referral_code(text) to authenticated;

-- Example helper for creating a code:
-- insert into public.referral_codes (code_hash, label, months_granted, max_redemptions, active)
-- values (encode(digest(upper(trim('FOUNDER-BETA-APRIL')), 'sha256'), 'hex'), 'Founder Beta April', 3, 1, true);

