/**
 * 🛡️ Enterprise Family Validation Schemas
 * Type-safe validation with Zod for family legacy system
 */

import { z } from 'zod'

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const FamilyRoleSchema = z.enum([
  'father',
  'mother', 
  'child_adult',
  'child_minor',
  'trust_executor',
  'family_advisor',
  'emergency_contact',
  'viewer'
])

export const AccessLevelSchema = z.enum([
  'full',
  'standard',
  'limited',
  'emergency',
  'legal'
])

export const VaultAccessLevelSchema = z.enum([
  'none',
  'read',
  'write',
  'admin',
  'legal'
])

export const VaultVisibilitySchema = z.enum([
  'private',
  'parents',
  'adults',
  'family',
  'legal',
  'emergency'
])

export const VaultKindSchema = z.enum([
  'letter',
  'video',
  'audio',
  'document',
  'photo'
])

export const LegalDocumentTypeSchema = z.enum([
  'will',
  'trust',
  'power_of_attorney',
  'medical_directive',
  'guardianship',
  'insurance_policy',
  'beneficiary_info',
  'other'
])

export const LegalStatusSchema = z.enum([
  'draft',
  'executed',
  'notarized',
  'filed',
  'revoked'
])

export const EmergencyTypeSchema = z.enum([
  'medical',
  'legal',
  'death',
  'incapacitation',
  'other'
])

export const InvitationStatusSchema = z.enum([
  'pending',
  'accepted',
  'declined',
  'expired',
  'revoked'
])

// ============================================================================
// CORE ENTITY SCHEMAS
// ============================================================================

export const FamilySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Family name is required').max(100),
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const FamilyMemberSchema = z.object({
  family_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: FamilyRoleSchema,
  access_level: AccessLevelSchema.default('standard'),
  relationship: z.string().max(50).optional(),
  display_name: z.string().max(100).optional(),
  
  // Permission Flags
  emergency_access: z.boolean().default(false),
  legal_authority: z.boolean().default(false),
  can_invite_members: z.boolean().default(false),
  can_manage_vault: z.boolean().default(false),
  can_see_financials: z.boolean().default(false),
  can_manage_children: z.boolean().default(false),
  
  // Vault Access
  vault_access_level: VaultAccessLevelSchema.default('none'),
  
  // Conditional Access
  age_restrictions: z.record(z.any()).default({}),
  content_filters: z.record(z.any()).default({}),
  expires_at: z.string().datetime().optional(),
  
  // Audit Trail
  invited_by: z.string().uuid().optional(),
  invitation_accepted_at: z.string().datetime().optional(),
  last_active_at: z.string().datetime(),
  joined_at: z.string().datetime()
})

export const VaultItemSchema = z.object({
  id: z.string().uuid(),
  family_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  kind: VaultKindSchema,
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  storage_path: z.string().optional(),
  file_size_bytes: z.number().int().positive().optional(),
  mime_type: z.string().optional(),
  encrypted: z.boolean().default(false),
  metadata: z.record(z.any()).default({}),
  
  // Enterprise Access Control
  visibility: VaultVisibilitySchema.default('family'),
  age_gate: z.number().int().min(0).max(100).optional(),
  recipient_roles: z.array(FamilyRoleSchema).default([]),
  release_date: z.string().date().optional(),
  requires_approval: z.boolean().default(false),
  
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const VaultAccessRuleSchema = z.object({
  id: z.string().uuid(),
  vault_item_id: z.string().uuid(),
  rule_type: z.enum(['age_gate', 'role_required', 'emergency_only', 'date_release', 'parent_approval', 'legal_only']),
  conditions: z.record(z.any()),
  description: z.string().max(500).optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime()
})

export const LegalDocumentSchema = z.object({
  id: z.string().uuid(),
  family_id: z.string().uuid(),
  document_type: LegalDocumentTypeSchema,
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  storage_path: z.string().min(1, 'Storage path is required'),
  
  // Legal Status
  legal_status: LegalStatusSchema.default('draft'),
  
  // Access Control
  executor_access: z.boolean().default(true),
  requires_notarization: z.boolean().default(false),
  witness_required: z.boolean().default(false),
  
  // Important Dates
  execution_date: z.string().date().optional(),
  expiration_date: z.string().date().optional(),
  review_date: z.string().date().optional(),
  
  // Metadata
  attorney_info: z.record(z.any()).optional(),
  witness_info: z.record(z.any()).optional(),
  notary_info: z.record(z.any()).optional(),
  
  created_by: z.string().uuid(),
  updated_by: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const EmergencyAccessLogSchema = z.object({
  id: z.string().uuid(),
  family_id: z.string().uuid(),
  accessed_by: z.string().uuid(),
  access_reason: z.string().min(1, 'Access reason is required').max(500),
  emergency_type: EmergencyTypeSchema,
  items_accessed: z.record(z.any()).optional(),
  actions_taken: z.record(z.any()).optional(),
  verified_by: z.string().uuid().optional(),
  verification_method: z.string().max(200).optional(),
  expires_at: z.string().datetime(),
  resolved_at: z.string().datetime().optional(),
  created_at: z.string().datetime()
})

export const FamilyInvitationSchema = z.object({
  id: z.string().uuid(),
  family_id: z.string().uuid(),
  email: z.string().email('Valid email is required'),
  invited_role: FamilyRoleSchema,
  relationship: z.string().max(50).optional(),
  personal_message: z.string().max(1000).optional(),
  status: InvitationStatusSchema.default('pending'),
  invitation_token: z.string().min(1),
  expires_at: z.string().datetime(),
  invited_by: z.string().uuid(),
  accepted_by: z.string().uuid().optional(),
  accepted_at: z.string().datetime().optional(),
  created_at: z.string().datetime()
})

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

export const CreateFamilySchema = z.object({
  name: z.string().min(1, 'Family name is required').max(100, 'Family name too long')
})

export const InviteFamilyMemberSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: FamilyRoleSchema,
  relationship: z.string().min(1, 'Relationship is required').max(50),
  personal_message: z.string().max(1000, 'Message too long').optional()
})

export const CreateVaultItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  kind: VaultKindSchema,
  visibility: VaultVisibilitySchema.default('family'),
  age_gate: z.number().int().min(0).max(100).optional(),
  recipient_roles: z.array(FamilyRoleSchema).default([]),
  release_date: z.string().date().optional(),
  requires_approval: z.boolean().default(false)
})

export const CreateLegalDocumentSchema = z.object({
  document_type: LegalDocumentTypeSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  requires_notarization: z.boolean().default(false),
  witness_required: z.boolean().default(false),
  execution_date: z.string().date().optional(),
  expiration_date: z.string().date().optional(),
  review_date: z.string().date().optional()
})

export const UpdateFamilyMemberPermissionsSchema = z.object({
  role: FamilyRoleSchema.optional(),
  access_level: AccessLevelSchema.optional(),
  vault_access_level: VaultAccessLevelSchema.optional(),
  emergency_access: z.boolean().optional(),
  legal_authority: z.boolean().optional(),
  can_invite_members: z.boolean().optional(),
  can_manage_vault: z.boolean().optional(),
  can_see_financials: z.boolean().optional(),
  can_manage_children: z.boolean().optional(),
  expires_at: z.string().datetime().optional()
})

export const CreateEmergencyAccessSchema = z.object({
  access_reason: z.string().min(1, 'Access reason is required').max(500),
  emergency_type: EmergencyTypeSchema,
  verification_method: z.string().max(200).optional()
})

// ============================================================================
// DEVOTION & REFLECTION SCHEMAS (Fixed)
// ============================================================================

export const DevotionEntrySchema = z.object({
  content: z.string().min(1, 'Reflection content is required').max(5000),
  theme_id: z.string().uuid().optional(),
  day_index: z.number().int().min(1).max(6).optional(),
  reflection_type: z.enum(['daily', 'weekly', 'special', 'milestone']).default('daily')
})

export const SaveReflectionSchema = z.object({
  content: z.string().min(1, 'Reflection content is required').max(5000, 'Reflection too long'),
  theme_id: z.string().uuid().optional(),
  day_index: z.number().int().min(1).max(6).optional()
})

export const SaveVoiceNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional()
})

export const SaveLegacyNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  type: z.string().default('legacy_note'),
  recipient: z.string().max(100).optional(),
  visibility: VaultVisibilitySchema.default('family'),
  age_gate: z.number().int().min(0).max(100).optional()
})

export const SetReminderSchema = z.object({
  time: z.string().min(1, 'Time is required'),
  type: z.string().default('family_connection'),
  content: z.string().max(500, 'Content too long').optional()
})

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Family = z.infer<typeof FamilySchema>
export type FamilyMember = z.infer<typeof FamilyMemberSchema>
export type VaultItem = z.infer<typeof VaultItemSchema>
export type VaultAccessRule = z.infer<typeof VaultAccessRuleSchema>
export type LegalDocument = z.infer<typeof LegalDocumentSchema>
export type EmergencyAccessLog = z.infer<typeof EmergencyAccessLogSchema>
export type FamilyInvitation = z.infer<typeof FamilyInvitationSchema>

export type CreateFamily = z.infer<typeof CreateFamilySchema>
export type InviteFamilyMember = z.infer<typeof InviteFamilyMemberSchema>
export type CreateVaultItem = z.infer<typeof CreateVaultItemSchema>
export type CreateLegalDocument = z.infer<typeof CreateLegalDocumentSchema>
export type UpdateFamilyMemberPermissions = z.infer<typeof UpdateFamilyMemberPermissionsSchema>
export type CreateEmergencyAccess = z.infer<typeof CreateEmergencyAccessSchema>

export type SaveReflection = z.infer<typeof SaveReflectionSchema>
export type SaveVoiceNote = z.infer<typeof SaveVoiceNoteSchema>
export type SaveLegacyNote = z.infer<typeof SaveLegacyNoteSchema>
export type SetReminder = z.infer<typeof SetReminderSchema>
