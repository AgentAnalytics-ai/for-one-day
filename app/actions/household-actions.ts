'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getHouseholdEntitlement, householdPlanIsActive } from '@/lib/household-billing'
import { getUserSubscriptionStatus } from '@/lib/subscription-utils'
import { revalidatePath } from 'next/cache'

export type HouseholdMember = {
  userId: string
  fullName: string | null
  role: string
  isYou: boolean
}

export type HouseholdSettings = {
  familyId: string
  name: string
  plan: 'free' | 'pro' | 'lifetime'
  isOwner: boolean
  members: HouseholdMember[]
}

const MAX_HOUSEHOLD_NAME_LENGTH = 80

async function resolveFamilyId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('primary_family_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (profile?.primary_family_id) {
    return profile.primary_family_id
  }

  const { data: membership } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  return membership?.family_id ?? null
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
      .select('id, name, owner_id')
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

    return {
      success: true,
      household: {
        familyId: family.id,
        name: family.name,
        plan,
        isOwner: family.owner_id === user.id,
        members,
      },
    }
  } catch (error) {
    console.error('getHouseholdSettings error:', error)
    return { success: false, error: 'Failed to load household' }
  }
}

/** Per-request cache — safe to call from layout + page in same render */
export const getCachedHouseholdSettings = cache(getHouseholdSettings)

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
