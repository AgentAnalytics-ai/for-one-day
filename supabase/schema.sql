-- For One Day - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- PROFILES
-- ============================================================================

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.profiles is 'User profiles and subscription status';

-- ============================================================================
-- FAMILIES & MEMBERS
-- ============================================================================

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.families is 'Family groups - each user can have one family';

create table public.family_members (
  family_id uuid references families(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'spouse', 'child', 'viewer')),
  joined_at timestamptz default now(),
  primary key (family_id, user_id)
);

comment on table public.family_members is 'Family membership with roles';

-- ============================================================================
-- DEVOTIONS
-- ============================================================================

create table public.devotion_themes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  scripture jsonb not null, -- {ref: string, text: string}
  day_prompts jsonb not null, -- array of 6 prompts (Mon-Sat)
  week_number int,
  is_active boolean default true,
  created_at timestamptz default now()
);

comment on table public.devotion_themes is 'Weekly devotional themes (curated content)';

create table public.devotion_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  family_id uuid references families(id) on delete cascade,
  theme_id uuid references devotion_themes(id) on delete set null,
  day_index int not null check (day_index between 1 and 6), -- Mon=1..Sat=6
  note text,
  audio_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, theme_id, day_index)
);

comment on table public.devotion_entries is 'Personal devotion journal entries (Mon-Sat)';

create index idx_devotion_entries_user on devotion_entries(user_id, created_at desc);
create index idx_devotion_entries_family on devotion_entries(family_id, created_at desc);

-- ============================================================================
-- TABLE TALK
-- ============================================================================

create table public.table_talk_decks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  theme_id uuid references devotion_themes(id) on delete set null,
  week_start date not null,
  cards jsonb not null, -- array of card objects
  created_by uuid references auth.users(id),
  played_at timestamptz,
  created_at timestamptz default now()
);

comment on table public.table_talk_decks is 'AI-generated Table Talk game decks (Sunday)';

create index idx_table_talk_family on table_talk_decks(family_id, week_start desc);

-- ============================================================================
-- PLANNER (Events & Tasks)
-- ============================================================================

create table public.events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  notes text,
  visibility text default 'family' check (visibility in ('family', 'private')),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.events is 'Family calendar events';

create index idx_events_family_time on events(family_id, starts_at);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status text default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  assigned_to uuid references auth.users(id),
  points int default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.tasks is 'Family task list with assignments';

create index idx_tasks_family on tasks(family_id, status, due_date);
create index idx_tasks_assigned on tasks(assigned_to, status);

-- ============================================================================
-- VAULT (Legacy Storage)
-- ============================================================================

create table public.vault_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('letter', 'video', 'audio', 'document', 'photo')),
  title text not null,
  description text,
  storage_path text, -- Supabase Storage path
  file_size_bytes bigint,
  mime_type text,
  encrypted boolean default false,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.vault_items is 'Secure legacy documents and media';

create index idx_vault_family on vault_items(family_id, created_at desc);
create index idx_vault_owner on vault_items(owner_id, created_at desc);

-- ============================================================================
-- BILLING (Stripe)
-- ============================================================================

create table public.subscriptions (
  id text primary key, -- Stripe subscription ID
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('active', 'canceled', 'incomplete', 'past_due', 'trialing', 'unpaid')),
  price_id text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.subscriptions is 'Stripe subscription tracking';

create index idx_subscriptions_user on subscriptions(user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to relevant tables
create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger families_updated_at before update on families
  for each row execute function update_updated_at();

create trigger devotion_entries_updated_at before update on devotion_entries
  for each row execute function update_updated_at();

create trigger events_updated_at before update on events
  for each row execute function update_updated_at();

create trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at();

create trigger vault_items_updated_at before update on vault_items
  for each row execute function update_updated_at();

-- ============================================================================
-- SEED DATA (Optional - sample devotional theme)
-- ============================================================================

insert into public.devotion_themes (slug, title, description, scripture, day_prompts, week_number)
values (
  'gratitude-week-1',
  'A Week of Gratitude',
  'Learning to see God''s goodness in everyday moments',
  '{
    "ref": "1 Thessalonians 5:18",
    "text": "Give thanks in all circumstances; for this is God''s will for you in Christ Jesus."
  }'::jsonb,
  '[
    "What unexpected blessing did you notice today?",
    "Who has shown you kindness recently, and how can you thank them?",
    "What challenge are you facing that might become a testimony?",
    "Describe a moment today when you felt God''s presence.",
    "What gift or ability do you take for granted?",
    "How has your perspective shifted this week?"
  ]'::jsonb,
  1
);

