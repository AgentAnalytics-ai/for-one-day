'use server'

import { cache } from 'react'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { findUserIdByEmail } from '@/lib/auth-admin'
import { getHouseholdEntitlement, householdPlanIsActive } from '@/lib/household-billing'
import {
  INVITE_EXPIRY_DAYS,
  MAX_HOUSEHOLD_MEMBERS,
  isInvitableRole,
  type InvitableHouseholdRole,
} from '@/lib/household-invite'
import { sendHouseholdInviteEmail } from '@/lib/email'
import { resolveFamilyId } from '@/lib/household'
import {
  isValidIanaTimezone,
  normalizeHouseholdTimezone,
  resolveHouseholdTimezone,
} from '@/lib/household-timezone'
import { getUserSubscriptionStatus } from '@/lib/subscription-utils'
import { revalidatePath } from 'next/cache'

export type HouseholdMember = {
  userId: string
  fullName: string | null
  role: string
  isYou: boolean
}

export type PendingHouseholdInvitation = {
  id: string
  invitedEmail: string
  invitedName: string | null
  role: string
  expiresAt: string
  createdAt: string
}

export type HouseholdSettings = {
  familyId: string
  name: string
  timezone: string | null
  needsTimezoneConfirm: boolean
  plan: 'free' | 'pro' | 'lifetime'
  isOwner: boolean
  members: HouseholdMember[]
  pendingInvitations: PendingHouseholdInvitation[]
  canInvite: boolean
}

export type HouseholdTimeContext = {
  success: boolean
  timezone: string
  needsTimezoneConfirm: boolean
  error?: string
}

const MAX_HOUSEHOLD_NAME_LENGTH = 80

/** Solo free home (sole owner) — can be abandoned when accepting an invite (Step 5b) */
async function isAbandonableSoloHousehold(
  admin: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  userId: string
): Promise<boolean> {
  const { data: family } = await admin
    .from('families')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle()

  if (!family) return false

  const { count: memberCount } = await admin
    .from('family_members')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', family.id)

  if (memberCount !== 1) return false

  const { data: entitlement } = await admin
    .from('family_entitlements')
    .select('plan, stripe_subscription_id')
    .eq('family_id', family.id)
    .maybeSingle()

  if (
    !entitlement ||
    entitlement.plan !== 'free' ||
    entitlement.stripe_subscription_id
  ) {
    return false
  }

  const { data: subscription } = await admin
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .maybeSingle()

  return !subscription
}

export async function getHouseholdSettings(): Promise<{
  success: boolean
  household?: HouseholdSettings
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const familyId = await resolveFamilyId(supabase, user.id)
    if (!familyId) {
      return { success: false, error: 'No household found' }
    }

    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('id, name, owner_id, timezone')
      .eq('id', familyId)
      .single()

    if (familyError || !family) {
      return { success: false, error: 'Household not found' }
    }

    const subscription = await getUserSubscriptionStatus(user.id)
    const entitlement = await getHouseholdEntitlement(supabase, user.id)
    const plan =
      entitlement && householdPlanIsActive(entitlement)
        ? entitlement.plan
        : subscription.plan

    const { data: memberRows, error: membersError } = await supabase
      .from('family_members')
      .select('user_id, role')
      .eq('family_id', familyId)

    if (membersError) {
      return { success: false, error: 'Failed to load members' }
    }

    const memberIds = (memberRows ?? []).map((m) => m.user_id)
    const { data: profiles } = memberIds.length
      ? await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', memberIds)
      : { data: [] as { user_id: string; full_name: string | null }[] }

    const nameByUser = new Map(
      (profiles ?? []).map((p) => [p.user_id, p.full_name])
    )

    const members: HouseholdMember[] = (memberRows ?? []).map((m) => ({
      userId: m.user_id,
      fullName: nameByUser.get(m.user_id) ?? null,
      role: m.role,
      isYou: m.user_id === user.id,
    }))

    members.sort((a, b) => {
      if (a.role === 'owner') return -1
      if (b.role === 'owner') return 1
      return (a.fullName ?? '').localeCompare(b.fullName ?? '')
    })

    let pendingInvitations: PendingHouseholdInvitation[] = []
    if (family.owner_id === user.id) {
      const { data: invites } = await supabase
        .from('family_invitations')
        .select('id, invited_email, invited_name, role, expires_at, created_at')
        .eq('family_id', familyId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      pendingInvitations = (invites ?? []).map((inv) => ({
        id: inv.id,
        invitedEmail: inv.invited_email,
        invitedName: inv.invited_name,
        role: inv.role,
        expiresAt: inv.expires_at,
        createdAt: inv.created_at,
      }))
    }

    const slotCount = members.length + pendingInvitations.length

    return {
      success: true,
      household: {
        familyId: family.id,
        name: family.name,
        timezone: normalizeHouseholdTimezone(family.timezone),
        needsTimezoneConfirm: !normalizeHouseholdTimezone(family.timezone),
        plan,
        isOwner: family.owner_id === user.id,
        members,
        pendingInvitations,
        canInvite: family.owner_id === user.id && slotCount < MAX_HOUSEHOLD_MEMBERS,
      },
    }
  } catch (error) {
    console.error('getHouseholdSettings error:', error)
    return { success: false, error: 'Failed to load household' }
  }
}

/** Per-request cache — safe to call from layout + page in same render */
export const getCachedHouseholdSettings = cache(getHouseholdSettings)

export async function getHouseholdTimeContext(): Promise<HouseholdTimeContext> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        timezone: 'America/Chicago',
        needsTimezoneConfirm: false,
        error: 'Not authenticated',
      }
    }

    const familyId = await resolveFamilyId(supabase, user.id)
    if (!familyId) {
      return {
        success: false,
        timezone: 'America/Chicago',
        needsTimezoneConfirm: false,
        error: 'No household found',
      }
    }

    const { data: family } = await supabase
      .from('families')
      .select('timezone')
      .eq('id', familyId)
      .maybeSingle()

    const stored = normalizeHouseholdTimezone(family?.timezone)
    const timezone = stored ?? (await resolveHouseholdTimezone(supabase, familyId))

    return {
      success: true,
      timezone,
      needsTimezoneConfirm: !stored,
    }
  } catch (error) {
    console.error('getHouseholdTimeContext error:', error)
    return {
      success: false,
      timezone: 'America/Chicago',
      needsTimezoneConfirm: false,
      error: 'Failed to load home timezone',
    }
  }
}

export const getCachedHouseholdTimeContext = cache(getHouseholdTimeContext)

export async function setHouseholdTimezone(timeZone: string): Promise<{
  success: boolean
  timezone?: string
  error?: string
}> {
  try {
    const trimmed = timeZone.trim()
    if (!isValidIanaTimezone(trimmed)) {
      return { success: false, error: 'Invalid timezone' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const familyId = await resolveFamilyId(supabase, user.id)
    if (!familyId) {
      return { success: false, error: 'No household found' }
    }

    const { data: membership } = await supabase
      .from('family_members')
      .select('user_id')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      return { success: false, error: 'Not a member of this household' }
    }

    const { error } = await supabase.rpc('set_family_timezone', {
      p_family_id: familyId,
      p_timezone: trimmed,
    })

    if (error) {
      console.error('setHouseholdTimezone error:', error)
      return { success: false, error: 'Could not save timezone' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/week')
    revalidatePath('/settings')

    return { success: true, timezone: trimmed }
  } catch (error) {
    console.error('setHouseholdTimezone error:', error)
    return { success: false, error: 'Could not save timezone' }
  }
}

export async function updateHouseholdName(name: string): Promise<{
  success: boolean
  name?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const trimmed = name.trim()
    if (!trimmed) {
      return { success: false, error: 'Household name cannot be empty' }
    }
    if (trimmed.length > MAX_HOUSEHOLD_NAME_LENGTH) {
      return {
        success: false,
        error: `Name must be ${MAX_HOUSEHOLD_NAME_LENGTH} characters or fewer`,
      }
    }

    const familyId = await resolveFamilyId(supabase, user.id)
    if (!familyId) {
      return { success: false, error: 'No household found' }
    }

    const { data: family } = await supabase
      .from('families')
      .select('owner_id')
      .eq('id', familyId)
      .single()

    if (!family || family.owner_id !== user.id) {
      return { success: false, error: 'Only the household owner can rename it' }
    }

    const { error } = await supabase
      .from('families')
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq('id', familyId)

    if (error) {
      console.error('updateHouseholdName error:', error)
      return { success: false, error: 'Failed to update household name' }
    }

    revalidatePath('/settings')
    return { success: true, name: trimmed }
  } catch (error) {
    console.error('updateHouseholdName error:', error)
    return { success: false, error: 'Failed to update household name' }
  }
}

export async function inviteHouseholdMember(
  email: string,
  role: InvitableHouseholdRole = 'spouse',
  invitedName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (!isInvitableRole(role)) {
      return { success: false, error: 'Invalid role' }
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: false, error: 'Enter a valid email address' }
    }

    const userEmail = user.email?.trim().toLowerCase()
    if (userEmail && normalizedEmail === userEmail) {
      return { success: false, error: 'You cannot invite yourself' }
    }

    const familyId = await resolveFamilyId(supabase, user.id)
    if (!familyId) {
      return { success: false, error: 'No household found' }
    }

    const { data: family } = await supabase
      .from('families')
      .select('id, name, owner_id')
      .eq('id', familyId)
      .single()

    if (!family || family.owner_id !== user.id) {
      return { success: false, error: 'Only the household owner can send invites' }
    }

    const { count: memberCount } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId)

    const { count: pendingCount } = await supabase
      .from('family_invitations')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())

    if ((memberCount ?? 0) + (pendingCount ?? 0) >= MAX_HOUSEHOLD_MEMBERS) {
      return {
        success: false,
        error: `Households can have up to ${MAX_HOUSEHOLD_MEMBERS} members (including pending invites).`,
      }
    }

    const existingUserId = await findUserIdByEmail(normalizedEmail)
    if (existingUserId) {
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', existingUserId)
        .eq('family_id', familyId)
        .maybeSingle()

      if (existingMember) {
        return { success: false, error: 'This person is already in your household' }
      }

      const admin = createServiceRoleClient()
      if (admin) {
        const { data: otherMembership } = await admin
          .from('family_members')
          .select('family_id, role')
          .eq('user_id', existingUserId)
          .maybeSingle()

        if (otherMembership && otherMembership.family_id !== familyId) {
          const { data: ownedFamily } = await admin
            .from('families')
            .select('id')
            .eq('owner_id', existingUserId)
            .eq('id', otherMembership.family_id)
            .maybeSingle()

          if (ownedFamily) {
            const canAbandon = await isAbandonableSoloHousehold(admin, existingUserId)
            if (!canAbandon) {
              return {
                success: false,
                error:
                  'This person manages a household with Pro, other members, or billing. They need to resolve that first.',
              }
            }
          } else {
            return {
              success: false,
              error: 'This person is already in another household.',
            }
          }
        }
      }
    }

    await supabase
      .from('family_invitations')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('family_id', familyId)
      .eq('invited_email', normalizedEmail)
      .eq('status', 'pending')

    const token = randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS)

    const { error: insertError } = await supabase.from('family_invitations').insert({
      family_id: familyId,
      invited_email: normalizedEmail,
      invited_name: invitedName?.trim() || null,
      role,
      invited_by: user.id,
      invitation_token: token,
      expires_at: expiresAt.toISOString(),
      status: 'pending',
    })

    if (insertError) {
      console.error('inviteHouseholdMember insert:', insertError)
      const hint =
        insertError.code === '42501'
          ? 'Database permission denied — confirm household owner and run migration 001.'
          : insertError.code === '42P01'
            ? 'family_invitations table missing — run migration 001 on prod.'
            : null
      return {
        success: false,
        error: hint ?? `Failed to create invitation (${insertError.message})`,
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.foroneday.app'
    const inviteUrl = `${siteUrl}/auth/accept-invite?token=${encodeURIComponent(token)}`

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle()

    try {
      await sendHouseholdInviteEmail({
        to: normalizedEmail,
        inviterName: profile?.full_name || 'Your household',
        householdName: family.name,
        role,
        inviteUrl,
      })
    } catch (err) {
      console.error('inviteHouseholdMember email:', err)
      const msg = err instanceof Error ? err.message : 'Unknown email error'
      return {
        success: false,
        error: `Invitation saved but email failed: ${msg}. Check Vercel RESEND_API_KEY and FROM_EMAIL.`,
      }
    }

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('inviteHouseholdMember error:', error)
    return { success: false, error: 'Failed to send invitation' }
  }
}

export async function cancelHouseholdInvitation(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const familyId = await resolveFamilyId(supabase, user.id)
    if (!familyId) {
      return { success: false, error: 'No household found' }
    }

    const { data: family } = await supabase
      .from('families')
      .select('owner_id')
      .eq('id', familyId)
      .single()

    if (!family || family.owner_id !== user.id) {
      return { success: false, error: 'Only the household owner can cancel invites' }
    }

    const { error } = await supabase
      .from('family_invitations')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('id', invitationId)
      .eq('family_id', familyId)
      .eq('status', 'pending')

    if (error) {
      return { success: false, error: 'Failed to cancel invitation' }
    }

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('cancelHouseholdInvitation error:', error)
    return { success: false, error: 'Failed to cancel invitation' }
  }
}

export async function acceptHouseholdInvitation(
  token: string
): Promise<{ success: boolean; familyId?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const trimmed = token.trim()
    if (!trimmed) {
      return { success: false, error: 'Invalid invitation' }
    }

    const { data: familyId, error } = await supabase.rpc('accept_family_invitation', {
      p_token: trimmed,
    })

    if (error) {
      const msg = error.message || 'Could not accept invitation'
      return { success: false, error: msg }
    }

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    return { success: true, familyId: familyId as string }
  } catch (error) {
    console.error('acceptHouseholdInvitation error:', error)
    return { success: false, error: 'Failed to accept invitation' }
  }
}

export async function acceptPendingHouseholdInvitation(): Promise<{
  success: boolean
  familyId?: string
  skipped?: boolean
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, skipped: true }
    }

    const { data: familyId, error } = await supabase.rpc(
      'accept_pending_household_invitation'
    )

    if (error) {
      console.error('acceptPendingHouseholdInvitation:', error.message)
      return { success: false }
    }

    if (!familyId) {
      return { success: true, skipped: true }
    }

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    return { success: true, familyId: familyId as string }
  } catch (error) {
    console.error('acceptPendingHouseholdInvitation error:', error)
    return { success: false }
  }
}
