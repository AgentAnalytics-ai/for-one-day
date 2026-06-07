/** Household invite constants — Step 5 */

export const MAX_HOUSEHOLD_MEMBERS = 6

export const INVITE_EXPIRY_DAYS = 14

/** Roles owners can invite in v1 (DB supports more; UI starts here) */
export const INVITABLE_HOUSEHOLD_ROLES = ['spouse', 'child', 'viewer'] as const

export type InvitableHouseholdRole = (typeof INVITABLE_HOUSEHOLD_ROLES)[number]

export function isInvitableRole(role: string): role is InvitableHouseholdRole {
  return (INVITABLE_HOUSEHOLD_ROLES as readonly string[]).includes(role)
}

export function inviteRoleLabel(role: string): string {
  switch (role) {
    case 'spouse':
      return 'Partner / spouse'
    case 'child':
      return 'Adult child'
    case 'viewer':
      return 'Viewer (read-only later)'
    default:
      return role.charAt(0).toUpperCase() + role.slice(1)
  }
}

export function inviteRoleDescription(role: string): string {
  switch (role) {
    case 'spouse':
      return 'Shares your home hub and Pro — one bill for the household.'
    case 'child':
      return 'Teen or adult with their own login. Inherits household Pro.'
    case 'viewer':
      return 'Grandparent or helper with login. Glance access when we ship it.'
    default:
      return ''
  }
}
