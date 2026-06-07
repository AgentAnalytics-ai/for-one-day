import type { SupabaseClient } from '@supabase/supabase-js'

export type HouseholdPlan = 'free' | 'pro' | 'lifetime'

export interface FamilyEntitlementRow {
  plan: HouseholdPlan
  current_period_end: string | null
  stripe_subscription_id: string | null
}

/**
 * Resolve the household to bill for a user (owner's primary_family_id or owner membership).
 */
export async function resolveBillingFamilyId(
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

  const { data: ownerMembership } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .eq('role', 'owner')
    .limit(1)
    .maybeSingle()

  if (ownerMembership?.family_id) {
    return ownerMembership.family_id
  }

  const { data: anyMembership } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  return anyMembership?.family_id ?? null
}

/**
 * Sync household entitlement after Stripe events. Spouse inherits via family_members + RLS.
 */
export async function syncFamilyEntitlement(
  supabase: SupabaseClient,
  userId: string,
  params: {
    plan: HouseholdPlan
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    currentPeriodEnd?: string | null
  }
): Promise<void> {
  const familyId = await resolveBillingFamilyId(supabase, userId)
  if (!familyId) {
    console.error(`No household found for billing user ${userId}`)
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle()

  const { error } = await supabase.from('family_entitlements').upsert(
    {
      family_id: familyId,
      plan: params.plan,
      billing_owner_id: userId,
      stripe_customer_id: params.stripeCustomerId ?? profile?.stripe_customer_id ?? null,
      stripe_subscription_id: params.stripeSubscriptionId ?? null,
      current_period_end: params.currentPeriodEnd ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'family_id' }
  )

  if (error) {
    console.error('Error syncing family_entitlements:', error)
    throw error
  }
}

/**
 * Read household plan for entitlement checks (server-side).
 */
export async function getHouseholdEntitlement(
  supabase: SupabaseClient,
  userId: string
): Promise<FamilyEntitlementRow | null> {
  const familyId = await resolveBillingFamilyId(supabase, userId)
  if (!familyId) return null

  const { data } = await supabase
    .from('family_entitlements')
    .select('plan, current_period_end, stripe_subscription_id')
    .eq('family_id', familyId)
    .maybeSingle()

  if (!data) return null

  return {
    plan: data.plan as HouseholdPlan,
    current_period_end: data.current_period_end,
    stripe_subscription_id: data.stripe_subscription_id,
  }
}

export function householdPlanIsActive(entitlement: FamilyEntitlementRow): boolean {
  if (entitlement.plan === 'lifetime') return true
  if (entitlement.plan !== 'pro') return false
  if (!entitlement.current_period_end) return true
  return new Date(entitlement.current_period_end) > new Date()
}
