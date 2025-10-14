-- For One Day - Enterprise Schema Upgrade
-- Professional family legacy platform with enterprise-grade roles
-- Run this AFTER your existing schema.sql

-- ============================================================================
-- ENTERPRISE ROLE SYSTEM
-- ============================================================================

-- Drop existing family_members table and recreate with enterprise features
DROP TABLE IF EXISTS public.family_members CASCADE;

create table public.family_members (
  family_id uuid references families(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  
  -- Enterprise Role System
  role text not null check (role in (
    'father',           -- Primary account holder
    'mother',           -- Co-equal partner
    'child_adult',      -- 18+ children (full access)
    'child_minor',      -- Under 18 (restricted access)
    'trust_executor',   -- Legal executor
    'family_advisor',   -- Counselor/Pastor/Therapist
    'emergency_contact', -- Limited crisis access
    'viewer'            -- Read-only observer
  )),
  
  -- Granular Access Control
  access_level text not null default 'standard' check (access_level in (
    'full',        -- All family data
    'standard',    -- Most family data  
    'limited',     -- Basic family data
    'emergency',   -- Crisis access only
    'legal'        -- Executor-specific access
  )),
  
  -- Relationship & Context
  relationship text, -- "Wife", "Son", "Daughter", "Executor", "Pastor"
  display_name text, -- How they appear to family
  
  -- Permission Flags
  emergency_access boolean default false,
  legal_authority boolean default false, -- For trust executors
  can_invite_members boolean default false,
  can_manage_vault boolean default false,
  can_see_financials boolean default false,
  can_manage_children boolean default false,
  
  -- Vault Access Levels
  vault_access_level text default 'none' check (vault_access_level in (
    'none',     -- No vault access
    'read',     -- Can view appropriate items
    'write',    -- Can add items
    'admin',    -- Can manage all items
    'legal'     -- Legal document access only
  )),
  
  -- Conditional Access
  age_restrictions jsonb default '{}', -- Age-based content filtering
  content_filters jsonb default '{}', -- What content they can see
  expires_at timestamptz, -- For temporary access (advisors, etc.)
  
  -- Audit Trail
  invited_by uuid references auth.users(id),
  invitation_accepted_at timestamptz,
  last_active_at timestamptz default now(),
  joined_at timestamptz default now(),
  
  primary key (family_id, user_id)
);

comment on table public.family_members is 'Enterprise family membership with granular role-based access control';

-- ============================================================================
-- VAULT ACCESS RULES (Age Gates & Conditional Access)
-- ============================================================================

create table public.vault_access_rules (
  id uuid primary key default gen_random_uuid(),
  vault_item_id uuid references vault_items(id) on delete cascade,
  
  rule_type text not null check (rule_type in (
    'age_gate',        -- Minimum age requirement
    'role_required',   -- Specific role needed
    'emergency_only',  -- Only during emergencies
    'date_release',    -- Release on specific date
    'parent_approval', -- Requires parent approval
    'legal_only'       -- Trust executor only
  )),
  
  conditions jsonb not null, -- {min_age: 18, roles: ['child_adult'], release_date: '2030-01-01'}
  description text, -- Human readable rule description
  
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

comment on table public.vault_access_rules is 'Conditional access rules for vault items';

-- ============================================================================
-- EMERGENCY ACCESS SYSTEM
-- ============================================================================

create table public.emergency_access_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  
  accessed_by uuid references auth.users(id),
  access_reason text not null,
  emergency_type text check (emergency_type in (
    'medical', 'legal', 'death', 'incapacitation', 'other'
  )),
  
  items_accessed jsonb, -- List of vault items accessed
  actions_taken jsonb, -- What they did during emergency access
  
  verified_by uuid references auth.users(id), -- Another family member who verified
  verification_method text, -- How it was verified
  
  expires_at timestamptz not null,
  resolved_at timestamptz,
  
  created_at timestamptz default now()
);

comment on table public.emergency_access_logs is 'Audit trail for emergency family access';

-- ============================================================================
-- LEGAL DOCUMENT SYSTEM
-- ============================================================================

create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  
  document_type text not null check (document_type in (
    'will', 'trust', 'power_of_attorney', 'medical_directive', 
    'guardianship', 'insurance_policy', 'beneficiary_info', 'other'
  )),
  
  title text not null,
  description text,
  storage_path text not null, -- Supabase Storage path
  
  -- Legal Status
  legal_status text default 'draft' check (legal_status in (
    'draft', 'executed', 'notarized', 'filed', 'revoked'
  )),
  
  -- Access Control
  executor_access boolean default true,
  requires_notarization boolean default false,
  witness_required boolean default false,
  
  -- Important Dates
  execution_date date,
  expiration_date date,
  review_date date, -- When to review/update
  
  -- Metadata
  attorney_info jsonb, -- {name, firm, contact}
  witness_info jsonb,  -- Witness details
  notary_info jsonb,   -- Notarization details
  
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.legal_documents is 'Legal document management for estate planning';

-- ============================================================================
-- FAMILY INVITATIONS SYSTEM
-- ============================================================================

create table public.family_invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  
  email text not null,
  invited_role text not null,
  relationship text,
  personal_message text,
  
  -- Invitation Status
  status text default 'pending' check (status in (
    'pending', 'accepted', 'declined', 'expired', 'revoked'
  )),
  
  -- Security
  invitation_token text unique not null,
  expires_at timestamptz not null,
  
  -- Audit
  invited_by uuid references auth.users(id),
  accepted_by uuid references auth.users(id),
  accepted_at timestamptz,
  
  created_at timestamptz default now()
);

comment on table public.family_invitations is 'Family member invitation system';

-- ============================================================================
-- ENHANCED VAULT ITEMS
-- ============================================================================

-- Add new columns to existing vault_items table
ALTER TABLE public.vault_items 
ADD COLUMN IF NOT EXISTS visibility text default 'family' check (visibility in (
  'private',     -- Only creator can see
  'parents',     -- Parents only
  'adults',      -- Adult family members only
  'family',      -- All family members
  'legal',       -- Legal documents (executor access)
  'emergency'    -- Emergency access only
));

ALTER TABLE public.vault_items 
ADD COLUMN IF NOT EXISTS age_gate integer; -- Minimum age to access

ALTER TABLE public.vault_items 
ADD COLUMN IF NOT EXISTS recipient_roles jsonb default '[]'; -- Which roles can access

ALTER TABLE public.vault_items 
ADD COLUMN IF NOT EXISTS release_date date; -- When to make available

ALTER TABLE public.vault_items 
ADD COLUMN IF NOT EXISTS requires_approval boolean default false; -- Parent approval needed

-- ============================================================================
-- ENHANCED DEVOTION ENTRIES
-- ============================================================================

-- Fix devotion_entries to match actual usage
ALTER TABLE public.devotion_entries 
ADD COLUMN IF NOT EXISTS content text; -- Add the missing content column

ALTER TABLE public.devotion_entries 
ADD COLUMN IF NOT EXISTS reflection_type text default 'daily' check (reflection_type in (
  'daily', 'weekly', 'special', 'milestone'
));

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Family member indexes
create index idx_family_members_role on family_members(family_id, role);
create index idx_family_members_access on family_members(family_id, access_level);
create index idx_family_members_active on family_members(family_id, last_active_at desc);

-- Vault access rules indexes
create index idx_vault_rules_item on vault_access_rules(vault_item_id);
create index idx_vault_rules_type on vault_access_rules(rule_type);

-- Emergency access indexes
create index idx_emergency_family on emergency_access_logs(family_id, created_at desc);
create index idx_emergency_user on emergency_access_logs(accessed_by, created_at desc);

-- Legal document indexes
create index idx_legal_docs_family on legal_documents(family_id, document_type);
create index idx_legal_docs_status on legal_documents(family_id, legal_status);

-- Family invitation indexes
create index idx_invitations_family on family_invitations(family_id, status);
create index idx_invitations_email on family_invitations(email, status);
create index idx_invitations_token on family_invitations(invitation_token);

-- ============================================================================
-- HELPER FUNCTIONS FOR ROLE-BASED ACCESS
-- ============================================================================

-- Check if user has specific role in family
create or replace function has_family_role(fid uuid, required_role text)
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
      and fm.role = required_role
  );
$$;

-- Check if user has any of the specified roles
create or replace function has_any_family_role(fid uuid, roles text[])
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
      and fm.role = any(roles)
  );
$$;

-- Check if user can access vault item based on rules
create or replace function can_access_vault_item(item_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select not exists(
    select 1
    from public.vault_access_rules var
    where var.vault_item_id = item_id
      and (
        -- Age gate check (would need user's age from profile)
        (var.rule_type = 'age_gate' and var.conditions->>'min_age' > '0')
        or
        -- Role requirement check
        (var.rule_type = 'role_required' and not exists(
          select 1
          from public.family_members fm
          where fm.user_id = auth.uid()
            and fm.role = any(array(select jsonb_array_elements_text(var.conditions->'roles')))
        ))
        or
        -- Date release check
        (var.rule_type = 'date_release' and (var.conditions->>'release_date')::date > current_date)
      )
  );
$$;

-- Get user's family role
create or replace function get_user_family_role(fid uuid)
returns text
language sql
security definer
stable
as $$
  select fm.role
  from public.family_members fm
  where fm.family_id = fid
    and fm.user_id = auth.uid()
  limit 1;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at for legal documents
create trigger update_legal_documents_updated_at
  before update on public.legal_documents
  for each row
  execute function update_updated_at();

-- Auto-expire old invitations
create or replace function expire_old_invitations()
returns trigger as $$
begin
  update public.family_invitations
  set status = 'expired'
  where expires_at < now()
    and status = 'pending';
  return null;
end;
$$ language plpgsql;

-- Run invitation cleanup daily
-- (This would typically be a cron job, but we'll handle it in the app)
