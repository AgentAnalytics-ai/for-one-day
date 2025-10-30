/**
 * 💳 Subscription & Billing Utilities
 * Handles subscription status checking and feature limits
 */

import { createClient } from '@/lib/supabase/server'

export interface SubscriptionStatus {
  plan: 'free' | 'pro' | 'lifetime'
  isActive: boolean
  limits: {
    legacyNotes: number
    familyConnections: number
    reflections: number
    voiceRecordings: number
  }
}

export interface FeatureLimit {
  current: number
  limit: number
  canCreate: boolean
  message?: string
}

/**
 * Get user's subscription status and limits
 */
export async function getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient()
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', userId)
    .single()

  // Get active subscription (if any)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  const plan = profile?.plan || 'free'
  const isActive = subscription?.status === 'active' || plan === 'lifetime'

  // Define limits based on plan
  const limits = {
    free: {
      legacyNotes: 5,
      familyConnections: 10,
      reflections: -1, // unlimited
      voiceRecordings: 0 // Pro only
    },
    pro: {
      legacyNotes: -1, // unlimited
      familyConnections: -1, // unlimited
      reflections: -1, // unlimited
      voiceRecordings: -1 // unlimited
    },
    lifetime: {
      legacyNotes: -1, // unlimited
      familyConnections: -1, // unlimited
      reflections: -1, // unlimited
      voiceRecordings: -1 // unlimited
    }
  }

  return {
    plan: plan as 'free' | 'pro' | 'lifetime',
    isActive,
    limits: limits[plan as keyof typeof limits] || limits.free
  }
}

/**
 * Check if user can create a new legacy note
 */
export async function checkLegacyNoteLimit(userId: string): Promise<FeatureLimit> {
  const supabase = await createClient()
  const subscription = await getUserSubscriptionStatus(userId)
  
  // If unlimited, always allow
  if (subscription.limits.legacyNotes === -1) {
    return {
      current: 0,
      limit: -1,
      canCreate: true
    }
  }

  // Count current legacy notes by owner only (no family dependency)
  const { count } = await supabase
    .from('vault_items')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)
    .eq('kind', 'letter')

  const current = count || 0
  const limit = subscription.limits.legacyNotes
  const canCreate = current < limit

  return {
    current,
    limit,
    canCreate,
    message: canCreate 
      ? undefined 
      : `You've reached your limit of ${limit} legacy notes. Upgrade to Pro for unlimited notes.`
  }
}

/**
 * Check if user can create a new family connection
 */
export async function checkFamilyConnectionLimit(userId: string): Promise<FeatureLimit> {
  const supabase = await createClient()
  const subscription = await getUserSubscriptionStatus(userId)
  
  // If unlimited, always allow
  if (subscription.limits.familyConnections === -1) {
    return {
      current: 0,
      limit: -1,
      canCreate: true
    }
  }

  // Count current family connections (notes addressed to family members)
  const { data: familyMember } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .single()

  if (!familyMember) {
    return {
      current: 0,
      limit: subscription.limits.familyConnections,
      canCreate: true
    }
  }

  const { count } = await supabase
    .from('vault_items')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyMember.family_id)
    .eq('owner_id', userId)
    .eq('kind', 'letter')
    .in('metadata->recipient', ['wife', 'son', 'daughter', 'children'])

  const current = count || 0
  const limit = subscription.limits.familyConnections
  const canCreate = current < limit

  return {
    current,
    limit,
    canCreate,
    message: canCreate 
      ? undefined 
      : `You've reached your limit of ${limit} family connections. Upgrade to Pro for unlimited connections.`
  }
}

/**
 * Check if user can create a voice recording
 */
export async function checkVoiceRecordingLimit(userId: string): Promise<FeatureLimit> {
  const subscription = await getUserSubscriptionStatus(userId)
  
  // Voice recordings are Pro-only
  if (subscription.limits.voiceRecordings === -1) {
    return {
      current: 0,
      limit: -1,
      canCreate: true
    }
  }

  // Free users can't create voice recordings
  return {
    current: 0,
    limit: 0,
    canCreate: false,
    message: 'Voice recordings are available for Pro members. Upgrade to Pro to record and save voice messages.'
  }
}

/**
 * Get user's current usage stats
 */
export async function getUserUsageStats(userId: string) {
  const supabase = await createClient()
  
  // Get family
  const { data: familyMember } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .single()

  if (!familyMember) {
    return {
      legacyNotes: 0,
      familyConnections: 0,
      reflections: 0
    }
  }

  // Count legacy notes
  const { count: legacyNotes } = await supabase
    .from('vault_items')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyMember.family_id)
    .eq('owner_id', userId)
    .eq('kind', 'letter')

  // Count family connections
  const { count: familyConnections } = await supabase
    .from('vault_items')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyMember.family_id)
    .eq('owner_id', userId)
    .eq('kind', 'letter')
    .in('metadata->recipient', ['wife', 'son', 'daughter', 'children'])

  // Count reflections
  const { count: reflections } = await supabase
    .from('devotion_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    legacyNotes: legacyNotes || 0,
    familyConnections: familyConnections || 0,
    reflections: reflections || 0
  }
}
