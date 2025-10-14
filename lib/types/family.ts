/**
 * 👨‍👩‍👧‍👦 Enterprise Family Types
 * Professional type definitions for role-based family legacy system
 */

// ============================================================================
// CORE FAMILY TYPES
// ============================================================================

export type FamilyRole = 
  | 'father'           // Primary account holder
  | 'mother'           // Co-equal partner  
  | 'child_adult'      // 18+ children
  | 'child_minor'      // Under 18
  | 'trust_executor'   // Legal executor
  | 'family_advisor'   // Counselor/Pastor
  | 'emergency_contact' // Limited access
  | 'viewer'           // Read-only

export type AccessLevel = 
  | 'full'        // All family data
  | 'standard'    // Most family data
  | 'limited'     // Basic family data  
  | 'emergency'   // Crisis access only
  | 'legal'       // Executor-specific access

export type VaultAccessLevel = 
  | 'none'   // No vault access
  | 'read'   // Can view appropriate items
  | 'write'  // Can add items
  | 'admin'  // Can manage all items
  | 'legal'  // Legal document access only

// ============================================================================
// DATABASE INTERFACES
// ============================================================================

export interface Family {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface FamilyMember {
  family_id: string
  user_id: string
  role: FamilyRole
  access_level: AccessLevel
  relationship?: string
  display_name?: string
  
  // Permission Flags
  emergency_access: boolean
  legal_authority: boolean
  can_invite_members: boolean
  can_manage_vault: boolean
  can_see_financials: boolean
  can_manage_children: boolean
  
  // Vault Access
  vault_access_level: VaultAccessLevel
  
  // Conditional Access
  age_restrictions: Record<string, any>
  content_filters: Record<string, any>
  expires_at?: string
  
  // Audit Trail
  invited_by?: string
  invitation_accepted_at?: string
  last_active_at: string
  joined_at: string
}

export interface VaultItem {
  id: string
  family_id: string
  owner_id: string
  kind: 'letter' | 'video' | 'audio' | 'document' | 'photo'
  title: string
  description?: string
  storage_path?: string
  file_size_bytes?: number
  mime_type?: string
  encrypted: boolean
  metadata: Record<string, any>
  
  // Enterprise Access Control
  visibility: 'private' | 'parents' | 'adults' | 'family' | 'legal' | 'emergency'
  age_gate?: number
  recipient_roles: FamilyRole[]
  release_date?: string
  requires_approval: boolean
  
  created_at: string
  updated_at: string
}

export interface VaultAccessRule {
  id: string
  vault_item_id: string
  rule_type: 'age_gate' | 'role_required' | 'emergency_only' | 'date_release' | 'parent_approval' | 'legal_only'
  conditions: Record<string, any>
  description?: string
  created_by: string
  created_at: string
}

export interface LegalDocument {
  id: string
  family_id: string
  document_type: 'will' | 'trust' | 'power_of_attorney' | 'medical_directive' | 'guardianship' | 'insurance_policy' | 'beneficiary_info' | 'other'
  title: string
  description?: string
  storage_path: string
  
  // Legal Status
  legal_status: 'draft' | 'executed' | 'notarized' | 'filed' | 'revoked'
  
  // Access Control
  executor_access: boolean
  requires_notarization: boolean
  witness_required: boolean
  
  // Important Dates
  execution_date?: string
  expiration_date?: string
  review_date?: string
  
  // Metadata
  attorney_info?: Record<string, any>
  witness_info?: Record<string, any>
  notary_info?: Record<string, any>
  
  created_by: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface EmergencyAccessLog {
  id: string
  family_id: string
  accessed_by: string
  access_reason: string
  emergency_type: 'medical' | 'legal' | 'death' | 'incapacitation' | 'other'
  items_accessed?: Record<string, any>
  actions_taken?: Record<string, any>
  verified_by?: string
  verification_method?: string
  expires_at: string
  resolved_at?: string
  created_at: string
}

export interface FamilyInvitation {
  id: string
  family_id: string
  email: string
  invited_role: FamilyRole
  relationship?: string
  personal_message?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked'
  invitation_token: string
  expires_at: string
  invited_by: string
  accepted_by?: string
  accepted_at?: string
  created_at: string
}

// ============================================================================
// PERMISSION SYSTEM
// ============================================================================

export interface UserPermissions {
  // Core Access
  role: FamilyRole
  access_level: AccessLevel
  vault_access_level: VaultAccessLevel
  
  // Specific Permissions
  devotional: {
    read: boolean
    write: boolean
    admin: boolean
  }
  
  vault: {
    read: boolean
    write: boolean
    admin: boolean
    legal: boolean
  }
  
  family: {
    read: boolean
    write: boolean
    admin: boolean
  }
  
  billing: {
    read: boolean
    write: boolean
    admin: boolean
  }
  
  // Special Permissions
  can_invite_members: boolean
  can_manage_vault: boolean
  can_see_financials: boolean
  can_manage_children: boolean
  emergency_access: boolean
  legal_authority: boolean
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export const ROLE_PERMISSIONS: Record<FamilyRole, Partial<UserPermissions>> = {
  father: {
    access_level: 'full',
    vault_access_level: 'admin',
    devotional: { read: true, write: true, admin: true },
    vault: { read: true, write: true, admin: true, legal: true },
    family: { read: true, write: true, admin: true },
    billing: { read: true, write: true, admin: true },
    can_invite_members: true,
    can_manage_vault: true,
    can_see_financials: true,
    can_manage_children: true,
    emergency_access: true,
    legal_authority: false
  },
  
  mother: {
    access_level: 'full',
    vault_access_level: 'admin',
    devotional: { read: true, write: true, admin: false },
    vault: { read: true, write: true, admin: true, legal: false },
    family: { read: true, write: true, admin: true },
    billing: { read: true, write: false, admin: false },
    can_invite_members: true,
    can_manage_vault: true,
    can_see_financials: false,
    can_manage_children: true,
    emergency_access: true,
    legal_authority: false
  },
  
  child_adult: {
    access_level: 'standard',
    vault_access_level: 'read',
    devotional: { read: true, write: true, admin: false },
    vault: { read: true, write: false, admin: false, legal: false },
    family: { read: true, write: true, admin: false },
    billing: { read: false, write: false, admin: false },
    can_invite_members: false,
    can_manage_vault: false,
    can_see_financials: false,
    can_manage_children: false,
    emergency_access: false,
    legal_authority: false
  },
  
  child_minor: {
    access_level: 'limited',
    vault_access_level: 'none',
    devotional: { read: true, write: true, admin: false },
    vault: { read: false, write: false, admin: false, legal: false },
    family: { read: true, write: false, admin: false },
    billing: { read: false, write: false, admin: false },
    can_invite_members: false,
    can_manage_vault: false,
    can_see_financials: false,
    can_manage_children: false,
    emergency_access: false,
    legal_authority: false
  },
  
  trust_executor: {
    access_level: 'legal',
    vault_access_level: 'legal',
    devotional: { read: false, write: false, admin: false },
    vault: { read: true, write: false, admin: false, legal: true },
    family: { read: true, write: false, admin: false },
    billing: { read: true, write: false, admin: false },
    can_invite_members: false,
    can_manage_vault: false,
    can_see_financials: true,
    can_manage_children: false,
    emergency_access: true,
    legal_authority: true
  },
  
  family_advisor: {
    access_level: 'limited',
    vault_access_level: 'none',
    devotional: { read: true, write: false, admin: false },
    vault: { read: false, write: false, admin: false, legal: false },
    family: { read: true, write: false, admin: false },
    billing: { read: false, write: false, admin: false },
    can_invite_members: false,
    can_manage_vault: false,
    can_see_financials: false,
    can_manage_children: false,
    emergency_access: false,
    legal_authority: false
  },
  
  emergency_contact: {
    access_level: 'emergency',
    vault_access_level: 'none',
    devotional: { read: false, write: false, admin: false },
    vault: { read: false, write: false, admin: false, legal: false },
    family: { read: true, write: false, admin: false },
    billing: { read: false, write: false, admin: false },
    can_invite_members: false,
    can_manage_vault: false,
    can_see_financials: false,
    can_manage_children: false,
    emergency_access: true,
    legal_authority: false
  },
  
  viewer: {
    access_level: 'limited',
    vault_access_level: 'none',
    devotional: { read: true, write: false, admin: false },
    vault: { read: false, write: false, admin: false, legal: false },
    family: { read: true, write: false, admin: false },
    billing: { read: false, write: false, admin: false },
    can_invite_members: false,
    can_manage_vault: false,
    can_see_financials: false,
    can_manage_children: false,
    emergency_access: false,
    legal_authority: false
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getUserPermissions(familyMember: FamilyMember): UserPermissions {
  const basePermissions = ROLE_PERMISSIONS[familyMember.role] || ROLE_PERMISSIONS.viewer
  
  return {
    role: familyMember.role,
    access_level: familyMember.access_level,
    vault_access_level: familyMember.vault_access_level,
    
    devotional: basePermissions.devotional || { read: false, write: false, admin: false },
    vault: basePermissions.vault || { read: false, write: false, admin: false, legal: false },
    family: basePermissions.family || { read: false, write: false, admin: false },
    billing: basePermissions.billing || { read: false, write: false, admin: false },
    
    can_invite_members: familyMember.can_invite_members,
    can_manage_vault: familyMember.can_manage_vault,
    can_see_financials: familyMember.can_see_financials,
    can_manage_children: familyMember.can_manage_children,
    emergency_access: familyMember.emergency_access,
    legal_authority: familyMember.legal_authority
  }
}

export function canAccessVaultItem(
  vaultItem: VaultItem, 
  userRole: FamilyRole, 
  userAge?: number
): boolean {
  // Age gate check
  if (vaultItem.age_gate && userAge && userAge < vaultItem.age_gate) {
    return false
  }
  
  // Role-based visibility
  switch (vaultItem.visibility) {
    case 'private':
      return false // Only creator can see (handled in RLS)
    case 'parents':
      return ['father', 'mother'].includes(userRole)
    case 'adults':
      return ['father', 'mother', 'child_adult', 'trust_executor'].includes(userRole)
    case 'family':
      return !['emergency_contact', 'viewer'].includes(userRole)
    case 'legal':
      return userRole === 'trust_executor'
    case 'emergency':
      return false // Special emergency access only
    default:
      return false
  }
}

export function getRoleDisplayName(role: FamilyRole): string {
  const displayNames: Record<FamilyRole, string> = {
    father: 'Father',
    mother: 'Mother',
    child_adult: 'Adult Child',
    child_minor: 'Child',
    trust_executor: 'Trust Executor',
    family_advisor: 'Family Advisor',
    emergency_contact: 'Emergency Contact',
    viewer: 'Viewer'
  }
  
  return displayNames[role] || 'Unknown'
}

export function getAccessLevelDisplayName(level: AccessLevel): string {
  const displayNames: Record<AccessLevel, string> = {
    full: 'Full Access',
    standard: 'Standard Access',
    limited: 'Limited Access',
    emergency: 'Emergency Only',
    legal: 'Legal Access'
  }
  
  return displayNames[level] || 'Unknown'
}
