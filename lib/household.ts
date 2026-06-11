import type { SupabaseClient } from '@supabase/supabase-js'
import { getHouseholdEntitlement, householdPlanIsActive } from '@/lib/household-billing'

/**
 * Active household for shared daily-plan data (lists, meals, events).
 * Matches profiles.primary_family_id, then first membership.
 */
export async function resolveFamilyId(
  supabase: SupabaseClient,
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

/** Pro / lifetime household — shared lists, meals, calendar (Step 6+). */
export async function householdHasSharedPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const entitlement = await getHouseholdEntitlement(supabase, userId)
  if (!entitlement) return false
  return householdPlanIsActive(entitlement)
}
