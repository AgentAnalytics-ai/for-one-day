'use server'

import { createClient } from '@/lib/supabase/server'
import { firstName } from '@/lib/dinner-helper-grounding'
import { cleanMealTitleList } from '@/lib/meal-ai-shared'
import { getHouseholdWeekDateKeys, toHouseholdDateKey } from '@/lib/household-dates'
import { householdHasSharedPlan, resolveFamilyId } from '@/lib/household'

export type MealPickerContext = {
  success: boolean
  householdNames: string[]
  favoriteTitles: string[]
  recentDinners: string[]
  tonightTitle: string | null
  error?: string
}

export async function getMealPickerContext(): Promise<MealPickerContext> {
  const empty: MealPickerContext = {
    success: true,
    householdNames: [],
    favoriteTitles: [],
    recentDinners: [],
    tonightTitle: null,
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ...empty, success: false, error: 'Not authenticated' }

    const familyId = await resolveFamilyId(supabase, user.id)
    if (!familyId) return { ...empty, success: false, error: 'No household found' }

    const tonight = toHouseholdDateKey(new Date())
    const weekKeys = getHouseholdWeekDateKeys()
    const lookback = new Date()
    lookback.setDate(lookback.getDate() - 28)
    const lookbackKey = toHouseholdDateKey(lookback)

    const [membersRes, ideasRes, plansRes, tonightRes] = await Promise.all([
      supabase
        .from('family_members')
        .select('user_id')
        .eq('family_id', familyId)
        .neq('user_id', user.id),
      supabase
        .from('meal_ideas')
        .select('title')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(24),
      supabase
        .from('meal_plans')
        .select('title, plan_date')
        .eq('family_id', familyId)
        .gte('plan_date', lookbackKey)
        .lte('plan_date', weekKeys[6])
        .order('plan_date', { ascending: false }),
      supabase
        .from('meal_plans')
        .select('title')
        .eq('family_id', familyId)
        .eq('plan_date', tonight)
        .maybeSingle(),
    ])

    const memberIds = (membersRes.data ?? []).map((m) => m.user_id)
    let householdNames: string[] = []
    if (memberIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('full_name')
        .in('user_id', memberIds)
      householdNames = (profiles ?? [])
        .map((p) => firstName(p.full_name))
        .filter((n): n is string => Boolean(n))
    }

    const favoriteTitles = cleanMealTitleList((ideasRes.data ?? []).map((r) => r.title))
    const recentDinners = cleanMealTitleList(
      (plansRes.data ?? [])
        .filter((r) => r.plan_date !== tonight)
        .map((r) => r.title)
    )

    return {
      success: true,
      householdNames,
      favoriteTitles,
      recentDinners,
      tonightTitle: tonightRes.data?.title?.trim() || null,
    }
  } catch (error) {
    console.error('getMealPickerContext error:', error)
    return { ...empty, success: false, error: 'Could not load meal picks' }
  }
}

export async function getMealPickerAccess(): Promise<{ canUse: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { canUse: false }
  const canUse = await householdHasSharedPlan(supabase, user.id)
  return { canUse }
}
