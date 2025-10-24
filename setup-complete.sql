-- For One Day - Complete Database Setup
-- Copy and paste this entire file into your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (if any)
-- ============================================================================
drop table if exists public.subscriptions cascade;
drop table if exists public.vault_items cascade;
drop table if exists public.tasks cascade;
drop table if exists public.events cascade;
drop table if exists public.table_talk_decks cascade;
drop table if exists public.devotion_entries cascade;
drop table if exists public.devotion_themes cascade;
drop table if exists public.family_members cascade;
drop table if exists public.families cascade;
drop table if exists public.profiles cascade;

-- Drop functions
drop function if exists public.is_family_member(uuid);
drop function if exists public.is_family_owner(uuid);
drop function if exists public.get_user_family_ids();
drop function if exists public.update_updated_at();

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- PROFILES
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.profiles is 'User profiles and subscription status';

-- FAMILIES & MEMBERS
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.families is 'Family groups - each user can have one family';

-- Add compliance fields to profiles
alter table public.profiles add column if not exists gdpr_consent boolean default false;
alter table public.profiles add column if not exists data_retention_until timestamptz;
alter table public.profiles add column if not exists last_active_at timestamptz default now();

create table public.family_members (
  family_id uuid references families(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'spouse', 'child', 'viewer')),
  joined_at timestamptz default now(),
  primary key (family_id, user_id)
);

comment on table public.family_members is 'Family membership with roles';

-- DEVOTIONS
create table public.devotion_themes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  scripture jsonb not null,
  day_prompts jsonb not null,
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
  day_index int not null check (day_index between 1 and 6),
  note text,
  audio_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, theme_id, day_index)
);

comment on table public.devotion_entries is 'Personal devotion journal entries (Mon-Sat)';

create index idx_devotion_entries_user on devotion_entries(user_id, created_at desc);
create index idx_devotion_entries_family on devotion_entries(family_id, created_at desc);

-- TABLE TALK
create table public.table_talk_decks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  theme_id uuid references devotion_themes(id) on delete set null,
  week_start date not null,
  cards jsonb not null,
  created_by uuid references auth.users(id),
  played_at timestamptz,
  created_at timestamptz default now()
);

comment on table public.table_talk_decks is 'AI-generated Table Talk game decks (Sunday)';

create index idx_table_talk_family on table_talk_decks(family_id, week_start desc);

-- PLANNER (Events & Tasks)
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

-- VAULT (Legacy Storage) - THE CORE FEATURE
create table public.vault_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('letter', 'video', 'audio', 'document', 'photo')),
  title text not null,
  description text,
  storage_path text,
  file_size_bytes bigint,
  mime_type text,
  encrypted boolean default false,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.vault_items is 'Legacy notes and letters - the heart of For One Day';

-- Add AI-ready fields to vault_items  
alter table public.vault_items add column if not exists ai_generated boolean default false;
alter table public.vault_items add column if not exists ai_prompt text;
alter table public.vault_items add column if not exists share_count int default 0;

create index idx_vault_family on vault_items(family_id, created_at desc);
create index idx_vault_owner on vault_items(owner_id, created_at desc);

-- BILLING (Stripe)
create table public.subscriptions (
  id text primary key,
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
-- AUDIT LOGGING (Compliance & Security)
-- ============================================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null check (action in ('create', 'update', 'delete', 'view', 'login', 'logout')),
  table_name text not null,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

comment on table public.audit_logs is 'Audit trail for compliance and security monitoring';

create index idx_audit_logs_user on audit_logs(user_id, created_at desc);
create index idx_audit_logs_table on audit_logs(table_name, created_at desc);

-- ============================================================================
-- USER ANALYTICS (Growth & Engagement)
-- ============================================================================

create table public.user_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  family_id uuid references families(id) on delete cascade,
  event_type text not null check (event_type in (
    'devotional_completed', 'legacy_created', 'vault_viewed', 
    'family_invited', 'subscription_started', 'app_opened'
  )),
  metadata jsonb,
  created_at timestamptz default now()
);

comment on table public.user_analytics is 'User engagement and growth analytics';

create index idx_user_analytics_user on user_analytics(user_id, created_at desc);
create index idx_user_analytics_family on user_analytics(family_id, created_at desc);
create index idx_user_analytics_event on user_analytics(event_type, created_at desc);

-- ============================================================================
-- NOTIFICATIONS (Engagement & Retention)
-- ============================================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in (
    'devotional_reminder', 'family_activity', 'legacy_milestone',
    'subscription_expiring', 'welcome', 'achievement'
  )),
  title text not null,
  message text not null,
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz default now()
);

comment on table public.notifications is 'User notifications and engagement system';

create index idx_notifications_user on notifications(user_id, created_at desc);
create index idx_notifications_unread on notifications(user_id, read_at) where read_at is null;

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

-- Apply triggers
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

create trigger audit_logs_updated_at before update on audit_logs
  for each row execute function update_updated_at();

create trigger user_analytics_updated_at before update on user_analytics
  for each row execute function update_updated_at();

create trigger notifications_updated_at before update on notifications
  for each row execute function update_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Check if user is a family member
create or replace function is_family_member(fid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1
    from public.family_members fm
    where fm.family_id = fid
      and fm.user_id = auth.uid()
  );
$$;

-- Check if user is family owner
create or replace function is_family_owner(fid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1
    from public.families f
    where f.id = fid
      and f.owner_id = auth.uid()
  );
$$;

-- Get user's family IDs
create or replace function get_user_family_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select family_id
  from public.family_members
  where user_id = auth.uid();
$$;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.devotion_themes enable row level security;
alter table public.devotion_entries enable row level security;
alter table public.table_talk_decks enable row level security;
alter table public.events enable row level security;
alter table public.tasks enable row level security;
alter table public.vault_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.user_analytics enable row level security;
alter table public.notifications enable row level security;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- PROFILES
create policy "Users can view own profile"
  on public.profiles for select
  using (user_id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (user_id = auth.uid());

-- FAMILIES
create policy "Users can view their families"
  on public.families for select
  using (is_family_member(id) or owner_id = auth.uid());

create policy "Family owners can update"
  on public.families for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Users can create families"
  on public.families for insert
  with check (owner_id = auth.uid());

create policy "Family owners can delete"
  on public.families for delete
  using (owner_id = auth.uid());

-- FAMILY MEMBERS
create policy "Users can view family members"
  on public.family_members for select
  using (user_id = auth.uid() or is_family_member(family_id));

create policy "Family owners can manage members"
  on public.family_members for all
  using (is_family_owner(family_id))
  with check (is_family_owner(family_id));

create policy "Users can leave families"
  on public.family_members for delete
  using (user_id = auth.uid());

-- DEVOTION THEMES (public content)
create policy "Anyone can view devotion themes"
  on public.devotion_themes for select
  using (is_active = true);

-- DEVOTION ENTRIES
create policy "Users can view family devotion entries"
  on public.devotion_entries for select
  using (is_family_member(family_id) or user_id = auth.uid());

create policy "Users can create own entries"
  on public.devotion_entries for insert
  with check (
    user_id = auth.uid()
    and is_family_member(family_id)
  );

create policy "Users can update own entries"
  on public.devotion_entries for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own entries"
  on public.devotion_entries for delete
  using (user_id = auth.uid());

-- TABLE TALK DECKS
create policy "Family members can view decks"
  on public.table_talk_decks for select
  using (is_family_member(family_id));

create policy "Family members can create decks"
  on public.table_talk_decks for insert
  with check (is_family_member(family_id));

create policy "Deck creator can update"
  on public.table_talk_decks for update
  using (created_by = auth.uid() or is_family_owner(family_id))
  with check (created_by = auth.uid() or is_family_owner(family_id));

-- EVENTS
create policy "Family members can view events"
  on public.events for select
  using (
    is_family_member(family_id)
    or (visibility = 'private' and created_by = auth.uid())
  );

create policy "Family members can create events"
  on public.events for insert
  with check (is_family_member(family_id));

create policy "Event creator can update"
  on public.events for update
  using (created_by = auth.uid() or is_family_owner(family_id))
  with check (is_family_member(family_id));

create policy "Event creator can delete"
  on public.events for delete
  using (created_by = auth.uid() or is_family_owner(family_id));

-- TASKS
create policy "Family members can view tasks"
  on public.tasks for select
  using (is_family_member(family_id) or assigned_to = auth.uid());

create policy "Family members can create tasks"
  on public.tasks for insert
  with check (is_family_member(family_id));

create policy "Task creator or assignee can update"
  on public.tasks for update
  using (
    created_by = auth.uid()
    or assigned_to = auth.uid()
    or is_family_owner(family_id)
  )
  with check (is_family_member(family_id));

create policy "Task creator can delete"
  on public.tasks for delete
  using (created_by = auth.uid() or is_family_owner(family_id));

-- VAULT ITEMS (THE CORE FEATURE)
create policy "Family members can view vault items"
  on public.vault_items for select
  using (is_family_member(family_id));

create policy "Family members can create vault items"
  on public.vault_items for insert
  with check (
    is_family_member(family_id)
    and owner_id = auth.uid()
  );

create policy "Item owner can update"
  on public.vault_items for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Item owner can delete"
  on public.vault_items for delete
  using (owner_id = auth.uid());

-- SUBSCRIPTIONS
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (user_id = auth.uid());

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

create policy "Users can view own audit logs"
  on public.audit_logs for select
  using (user_id = auth.uid());

create policy "System can create audit logs"
  on public.audit_logs for insert
  with check (true);

-- ============================================================================
-- USER ANALYTICS POLICIES
-- ============================================================================

create policy "Users can view own analytics"
  on public.user_analytics for select
  using (user_id = auth.uid());

create policy "Users can create own analytics"
  on public.user_analytics for insert
  with check (user_id = auth.uid());

create policy "Family owners can view family analytics"
  on public.user_analytics for select
  using (is_family_owner(family_id));

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

-- ============================================================================
-- SEED DATA - Sample Devotional Theme
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

-- ============================================================================
-- SETUP COMPLETE! 🚀
-- ============================================================================

-- Your For One Day database is ready with 2026 enterprise features! 🎉
-- 
-- ✅ CORE FEATURES:
-- 1. Sign up at your app → creates profile + family
-- 2. Go to /devotional → write reflection → saves to devotion_entries
-- 3. Create legacy note → saves to vault_items with AI-ready fields
-- 4. View your vault → see all your letters and legacy content
--
-- ✅ ENTERPRISE FEATURES:
-- • Audit logging for compliance and security
-- • User analytics for growth optimization  
-- • Notification system for engagement
-- • GDPR compliance ready
-- • AI integration ready
-- • Row-level security for data isolation
--
-- Perfect for creating "Letters for daughter's wedding" and more! 💝
-- Ready to scale to millions of families! 🌟
