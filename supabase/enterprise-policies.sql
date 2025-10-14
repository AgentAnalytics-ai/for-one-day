-- For One Day - Enterprise RLS Policies
-- Run this AFTER enterprise-schema.sql

-- ============================================================================
-- ENABLE RLS ON NEW TABLES
-- ============================================================================

alter table public.vault_access_rules enable row level security;
alter table public.emergency_access_logs enable row level security;
alter table public.legal_documents enable row level security;
alter table public.family_invitations enable row level security;

-- ============================================================================
-- ENTERPRISE FAMILY MEMBERS POLICIES
-- ============================================================================

-- Users can view family members (enhanced with role-based visibility)
create policy "Users can view family members with role context"
  on public.family_members for select
  using (
    user_id = auth.uid() 
    or is_family_member(family_id)
    or (
      -- Trust executors can see basic family structure
      exists(
        select 1 from public.family_members fm2
        where fm2.family_id = family_members.family_id
          and fm2.user_id = auth.uid()
          and fm2.role = 'trust_executor'
      )
    )
  );

-- Family owners and mothers can manage members
create policy "Parents can manage family members"
  on public.family_members for all
  using (
    exists(
      select 1 from public.family_members fm
      where fm.family_id = family_members.family_id
        and fm.user_id = auth.uid()
        and fm.role in ('father', 'mother')
        and fm.can_invite_members = true
    )
  )
  with check (
    exists(
      select 1 from public.family_members fm
      where fm.family_id = family_members.family_id
        and fm.user_id = auth.uid()
        and fm.role in ('father', 'mother')
        and fm.can_invite_members = true
    )
  );

-- Users can leave families (but not if they're the only parent)
create policy "Users can leave families with safeguards"
  on public.family_members for delete
  using (
    user_id = auth.uid()
    and (
      -- Not the only parent
      role not in ('father', 'mother')
      or exists(
        select 1 from public.family_members fm
        where fm.family_id = family_members.family_id
          and fm.role in ('father', 'mother')
          and fm.user_id != auth.uid()
      )
    )
  );

-- ============================================================================
-- VAULT ACCESS RULES POLICIES
-- ============================================================================

create policy "Family members can view vault access rules"
  on public.vault_access_rules for select
  using (
    exists(
      select 1 from public.vault_items vi
      join public.family_members fm on vi.family_id = fm.family_id
      where vi.id = vault_access_rules.vault_item_id
        and fm.user_id = auth.uid()
    )
  );

create policy "Vault admins can manage access rules"
  on public.vault_access_rules for all
  using (
    exists(
      select 1 from public.vault_items vi
      join public.family_members fm on vi.family_id = fm.family_id
      where vi.id = vault_access_rules.vault_item_id
        and fm.user_id = auth.uid()
        and (fm.vault_access_level in ('admin', 'legal') or fm.role in ('father', 'mother'))
    )
  )
  with check (
    exists(
      select 1 from public.vault_items vi
      join public.family_members fm on vi.family_id = fm.family_id
      where vi.id = vault_access_rules.vault_item_id
        and fm.user_id = auth.uid()
        and (fm.vault_access_level in ('admin', 'legal') or fm.role in ('father', 'mother'))
    )
  );

-- ============================================================================
-- EMERGENCY ACCESS POLICIES
-- ============================================================================

create policy "Family members can view emergency access logs"
  on public.emergency_access_logs for select
  using (
    is_family_member(family_id)
    or accessed_by = auth.uid()
    or verified_by = auth.uid()
  );

create policy "Emergency contacts can create access logs"
  on public.emergency_access_logs for insert
  with check (
    exists(
      select 1 from public.family_members fm
      where fm.family_id = emergency_access_logs.family_id
        and fm.user_id = auth.uid()
        and (fm.emergency_access = true or fm.role = 'trust_executor')
    )
    and accessed_by = auth.uid()
  );

create policy "Family admins can manage emergency logs"
  on public.emergency_access_logs for update
  using (
    exists(
      select 1 from public.family_members fm
      where fm.family_id = emergency_access_logs.family_id
        and fm.user_id = auth.uid()
        and fm.role in ('father', 'mother', 'trust_executor')
    )
  );

-- ============================================================================
-- LEGAL DOCUMENTS POLICIES
-- ============================================================================

create policy "Family members can view appropriate legal documents"
  on public.legal_documents for select
  using (
    -- Family members can see family legal docs
    is_family_member(family_id)
    or
    -- Trust executors can see all legal docs they have authority over
    (
      exists(
        select 1 from public.family_members fm
        where fm.family_id = legal_documents.family_id
          and fm.user_id = auth.uid()
          and fm.role = 'trust_executor'
          and fm.legal_authority = true
      )
      and executor_access = true
    )
  );

create policy "Parents and executors can create legal documents"
  on public.legal_documents for insert
  with check (
    exists(
      select 1 from public.family_members fm
      where fm.family_id = legal_documents.family_id
        and fm.user_id = auth.uid()
        and (
          fm.role in ('father', 'mother')
          or (fm.role = 'trust_executor' and fm.legal_authority = true)
        )
    )
    and created_by = auth.uid()
  );

create policy "Document creators and executors can update"
  on public.legal_documents for update
  using (
    created_by = auth.uid()
    or exists(
      select 1 from public.family_members fm
      where fm.family_id = legal_documents.family_id
        and fm.user_id = auth.uid()
        and fm.role = 'trust_executor'
        and fm.legal_authority = true
    )
  )
  with check (updated_by = auth.uid());

-- ============================================================================
-- FAMILY INVITATIONS POLICIES
-- ============================================================================

create policy "Family members can view invitations"
  on public.family_invitations for select
  using (
    is_family_member(family_id)
    or email = (select email from auth.users where id = auth.uid())
  );

create policy "Parents can create invitations"
  on public.family_invitations for insert
  with check (
    exists(
      select 1 from public.family_members fm
      where fm.family_id = family_invitations.family_id
        and fm.user_id = auth.uid()
        and fm.role in ('father', 'mother')
        and fm.can_invite_members = true
    )
    and invited_by = auth.uid()
  );

create policy "Invitation creators can manage their invitations"
  on public.family_invitations for update
  using (invited_by = auth.uid())
  with check (invited_by = auth.uid());

create policy "Invitees can accept their own invitations"
  on public.family_invitations for update
  using (
    email = (select email from auth.users where id = auth.uid())
    and status = 'pending'
  )
  with check (accepted_by = auth.uid());

-- ============================================================================
-- ENHANCED VAULT ITEMS POLICIES
-- ============================================================================

-- Replace existing vault policies with role-based access
drop policy if exists "Family members can view vault items" on public.vault_items;
drop policy if exists "Family members can create vault items" on public.vault_items;
drop policy if exists "Item owner can update" on public.vault_items;

create policy "Role-based vault item access"
  on public.vault_items for select
  using (
    -- Family members with appropriate access level
    exists(
      select 1 from public.family_members fm
      where fm.family_id = vault_items.family_id
        and fm.user_id = auth.uid()
        and (
          -- Full access users
          fm.vault_access_level in ('admin', 'write', 'read')
          or
          -- Legal access for legal documents
          (fm.vault_access_level = 'legal' and vault_items.visibility = 'legal')
          or
          -- Parents can see most things
          (fm.role in ('father', 'mother') and vault_items.visibility != 'private')
          or
          -- Adults can see adult content
          (fm.role = 'child_adult' and vault_items.visibility in ('family', 'adults'))
          or
          -- Minors can see family content (age-gated)
          (fm.role = 'child_minor' and vault_items.visibility = 'family' and (vault_items.age_gate is null or vault_items.age_gate <= 13))
        )
    )
    -- Check vault access rules
    and can_access_vault_item(vault_items.id)
    -- Owner can always see their own items
    or owner_id = auth.uid()
  );

create policy "Family members can create vault items with role restrictions"
  on public.vault_items for insert
  with check (
    exists(
      select 1 from public.family_members fm
      where fm.family_id = vault_items.family_id
        and fm.user_id = auth.uid()
        and fm.vault_access_level in ('admin', 'write')
    )
    and owner_id = auth.uid()
  );

create policy "Vault item management based on role"
  on public.vault_items for update
  using (
    -- Item owner can update
    owner_id = auth.uid()
    or
    -- Vault admins can update
    exists(
      select 1 from public.family_members fm
      where fm.family_id = vault_items.family_id
        and fm.user_id = auth.uid()
        and fm.vault_access_level = 'admin'
    )
    or
    -- Parents can update family items
    exists(
      select 1 from public.family_members fm
      where fm.family_id = vault_items.family_id
        and fm.user_id = auth.uid()
        and fm.role in ('father', 'mother')
        and vault_items.visibility != 'legal'
    )
  );

create policy "Vault item deletion with safeguards"
  on public.vault_items for delete
  using (
    -- Item owner can delete (unless it's a legal document)
    (owner_id = auth.uid() and visibility != 'legal')
    or
    -- Vault admins can delete non-legal items
    (
      exists(
        select 1 from public.family_members fm
        where fm.family_id = vault_items.family_id
          and fm.user_id = auth.uid()
          and fm.vault_access_level = 'admin'
      )
      and visibility != 'legal'
    )
    or
    -- Trust executors can delete legal documents
    (
      exists(
        select 1 from public.family_members fm
        where fm.family_id = vault_items.family_id
          and fm.user_id = auth.uid()
          and fm.role = 'trust_executor'
          and fm.legal_authority = true
      )
      and visibility = 'legal'
    )
  );

-- ============================================================================
-- ENHANCED DEVOTION ENTRIES POLICIES
-- ============================================================================

-- Replace existing devotion policies with family role awareness
drop policy if exists "Users can view family devotion entries" on public.devotion_entries;
drop policy if exists "Users can create own entries" on public.devotion_entries;
drop policy if exists "Users can update own entries" on public.devotion_entries;
drop policy if exists "Users can delete own entries" on public.devotion_entries;

create policy "Family devotion entries with role-based visibility"
  on public.devotion_entries for select
  using (
    -- Own entries
    user_id = auth.uid()
    or
    -- Family members can see each other's entries based on role
    exists(
      select 1 from public.family_members fm1, public.family_members fm2
      where fm1.family_id = fm2.family_id
        and fm1.user_id = auth.uid()
        and fm2.user_id = devotion_entries.user_id
        and (
          -- Parents can see all family devotions
          fm1.role in ('father', 'mother')
          or
          -- Adults can see other adults and parents
          (fm1.role = 'child_adult' and fm2.role in ('father', 'mother', 'child_adult'))
          or
          -- Minors can see parents and siblings
          (fm1.role = 'child_minor' and fm2.role in ('father', 'mother'))
        )
    )
  );

create policy "Users can create devotion entries in their family"
  on public.devotion_entries for insert
  with check (
    user_id = auth.uid()
    and (
      family_id is null
      or exists(
        select 1 from public.family_members fm
        where fm.family_id = devotion_entries.family_id
          and fm.user_id = auth.uid()
      )
    )
  );

create policy "Users can update own devotion entries"
  on public.devotion_entries for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own devotion entries"
  on public.devotion_entries for delete
  using (user_id = auth.uid());

-- ============================================================================
-- SECURITY FUNCTIONS FOR APPLICATION USE
-- ============================================================================

-- Function to safely get user's family role and permissions
create or replace function get_user_family_context(fid uuid)
returns jsonb
language sql
security definer
stable
as $$
  select jsonb_build_object(
    'role', fm.role,
    'access_level', fm.access_level,
    'vault_access_level', fm.vault_access_level,
    'can_invite_members', fm.can_invite_members,
    'can_manage_vault', fm.can_manage_vault,
    'can_see_financials', fm.can_see_financials,
    'emergency_access', fm.emergency_access,
    'legal_authority', fm.legal_authority,
    'relationship', fm.relationship,
    'display_name', fm.display_name
  )
  from public.family_members fm
  where fm.family_id = fid
    and fm.user_id = auth.uid()
  limit 1;
$$;

-- Function to check if user can perform specific action
create or replace function can_user_perform_action(fid uuid, action_type text)
returns boolean
language sql
security definer
stable
as $$
  select case action_type
    when 'invite_members' then exists(
      select 1 from public.family_members fm
      where fm.family_id = fid and fm.user_id = auth.uid()
        and (fm.can_invite_members = true or fm.role in ('father', 'mother'))
    )
    when 'manage_vault' then exists(
      select 1 from public.family_members fm
      where fm.family_id = fid and fm.user_id = auth.uid()
        and (fm.can_manage_vault = true or fm.vault_access_level in ('admin', 'legal'))
    )
    when 'see_financials' then exists(
      select 1 from public.family_members fm
      where fm.family_id = fid and fm.user_id = auth.uid()
        and (fm.can_see_financials = true or fm.role in ('father', 'mother'))
    )
    when 'emergency_access' then exists(
      select 1 from public.family_members fm
      where fm.family_id = fid and fm.user_id = auth.uid()
        and (fm.emergency_access = true or fm.role = 'trust_executor')
    )
    else false
  end;
$$;
