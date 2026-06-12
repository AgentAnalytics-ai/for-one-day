'use server'

import { revalidatePath } from 'next/cache'
import { generateDinnerHelperPlan, type DinnerHelperPlan } from '@/lib/dinner-helper-ai'
import { firstName } from '@/lib/dinner-helper-grounding'
import { toHouseholdDateKey } from '@/lib/household-dates'
import { householdHasSharedPlan, resolveFamilyId } from '@/lib/household'
import { resolveHouseholdTimezone } from '@/lib/household-timezone'
import { createClient } from '@/lib/supabase/server'
import { setMealPlan } from '@/app/actions/meal-actions'
import { addListItem } from '@/app/actions/list-actions'

const UPGRADE_MESSAGE =
  'Dinner walk-throughs are included with Pro for your home.'

function householdNowLabel(timeZone: string): string {
  return new Date().toLocaleString('en-US', {
    timeZone,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

async function getOtherHouseholdFirstNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  familyId: string,
  currentUserId: string
): Promise<string[]> {
  const { data: memberRows } = await supabase
    .from('family_members')
    .select('user_id')
    .eq('family_id', familyId)
    .neq('user_id', currentUserId)

  const ids = (memberRows ?? []).map((m) => m.user_id)
  if (ids.length === 0) return []

  const { data: profiles } = await supabase
    .from('profiles')
    .select('full_name')
    .in('user_id', ids)

  return (profiles ?? [])
    .map((p) => firstName(p.full_name))
    .filter((n): n is string => Boolean(n))
}

async function getOpenShoppingTitles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  familyId: string
): Promise<string[]> {
  const { data } = await supabase
    .from('list_items')
    .select('title')
    .eq('family_id', familyId)
    .eq('kind', 'shopping')
    .eq('done', false)
    .order('sort_order', { ascending: true })
    .limit(24)

  return (data ?? []).map((r) => r.title).filter(Boolean)
}

async function mergeFavoriteNotes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  familyId: string,
  mealHint: string,
  notes?: string
): Promise<string | undefined> {
  const fromInput = notes?.trim()
  if (fromInput) return fromInput

  const { data } = await supabase
    .from('meal_ideas')
    .select('notes')
    .eq('family_id', familyId)
    .ilike('title', mealHint.trim())
    .limit(1)
    .maybeSingle()

  return data?.notes?.trim() || undefined
}

async function requireDinnerHelperAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const familyId = await resolveFamilyId(supabase, user.id)
  if (!familyId) {
    throw new Error('No household found')
  }

  const canUse = await householdHasSharedPlan(supabase, user.id)
  const timezone = await resolveHouseholdTimezone(supabase, familyId)
  const householdNames = await getOtherHouseholdFirstNames(supabase, familyId, user.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .maybeSingle()

  const cookName = firstName(profile?.full_name)
  const shoppingOnList = await getOpenShoppingTitles(supabase, familyId)

  return {
    canUse,
    planDate: toHouseholdDateKey(new Date(), timezone),
    timezone,
    householdNames,
    cookName,
    shoppingOnList,
    supabase,
    familyId,
  }
}

export async function runDinnerHelper(input: {
  mealHint: string
  notes?: string
  servingTime?: string
}): Promise<{ success: boolean; plan?: DinnerHelperPlan; error?: string }> {
  try {
    const { canUse, householdNames, cookName, shoppingOnList, supabase, familyId, timezone } =
      await requireDinnerHelperAccess()
    if (!canUse) {
      return { success: false, error: UPGRADE_MESSAGE }
    }

    const mealHint = input.mealHint.trim()
    if (!mealHint && !input.notes?.trim()) {
      return {
        success: false,
        error: 'What’s for dinner? A meal name or a quick note is enough.',
      }
    }

    const notes = await mergeFavoriteNotes(supabase, familyId, mealHint || 'Dinner tonight', input.notes)

    const plan = await generateDinnerHelperPlan({
      mealHint: mealHint || 'Dinner tonight',
      notes,
      servingTime: input.servingTime,
      nowLabel: householdNowLabel(timezone),
      timezone,
      cookName,
      householdNames,
      shoppingOnList,
    })

    if (!plan) {
      return {
        success: false,
        error: 'Couldn’t pull this together — give it another try in a moment.',
      }
    }

    return { success: true, plan }
  } catch (error) {
    console.error('runDinnerHelper error:', error)
    return { success: false, error: 'Something went wrong. Try again.' }
  }
}

export async function applyDinnerHelperResults(input: {
  planDate: string
  mealTitle?: string
  shoppingItems?: string[]
}): Promise<{
  success: boolean
  mealSaved: boolean
  itemsAdded: number
  error?: string
}> {
  try {
    const { canUse, planDate } = await requireDinnerHelperAccess()
    if (!canUse) {
      return { success: false, mealSaved: false, itemsAdded: 0, error: UPGRADE_MESSAGE }
    }

    const date = input.planDate || planDate
    let mealSaved = false
    let itemsAdded = 0

    if (input.mealTitle?.trim()) {
      const meal = await setMealPlan(date, input.mealTitle.trim())
      mealSaved = meal.success
      if (!meal.success) {
        return { success: false, mealSaved: false, itemsAdded: 0, error: meal.error }
      }
    }

    const items = (input.shoppingItems ?? []).map((s) => s.trim()).filter(Boolean)
    for (const title of items) {
      const result = await addListItem('shopping', title)
      if (result.success) itemsAdded += 1
    }

    revalidatePath('/week')
    revalidatePath('/dashboard')
    revalidatePath('/lists')

    return { success: true, mealSaved, itemsAdded }
  } catch (error) {
    console.error('applyDinnerHelperResults error:', error)
    return { success: false, mealSaved: false, itemsAdded: 0, error: 'Could not save.' }
  }
}
