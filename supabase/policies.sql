-- For One Day - Row Level Security Policies
-- Run this AFTER schema.sql

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
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

-- ============================================================================
-- HELPER FUNCTIONS
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
-- PROFILES
-- ============================================================================

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

-- ============================================================================
-- FAMILIES
-- ============================================================================

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

-- ============================================================================
-- FAMILY MEMBERS
-- ============================================================================

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

-- ============================================================================
-- DEVOTION THEMES
-- ============================================================================

-- Themes are public (curated content)
create policy "Anyone can view devotion themes"
  on public.devotion_themes for select
  using (is_active = true);

-- Only service role can manage themes (via admin panel later)

-- ============================================================================
-- DEVOTION ENTRIES
-- ============================================================================

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

-- ============================================================================
-- TABLE TALK DECKS
-- ============================================================================

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

-- ============================================================================
-- EVENTS
-- ============================================================================

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

-- ============================================================================
-- TASKS
-- ============================================================================

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

-- ============================================================================
-- VAULT ITEMS
-- ============================================================================

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

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (user_id = auth.uid());

-- Only service role can manage subscriptions (via Stripe webhook)

