'use server'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  buildHouseholdWeekDays,
  getHouseholdWeekDateKeys,
  toHouseholdDateKey,
  type HouseholdWeekDay,
} from '@/lib/household-dates'
import { householdHasSharedPlan, resolveFamilyId } from '@/lib/household'

const UPGRADE_MESSAGE =
  'Meal planning is part of Pro for your home. Upgrade to plan dinners your household shares.'

export type MealPlanRow = {
  id: string
  planDate: string
  title: string
}

export type TonightMealGlance = {
  success: boolean
  canEdit: boolean
  planDate: string
  title: string | null
  error?: string
}

export type WeekMealsData = {
  success: boolean
  canEdit: boolean
  days: (HouseholdWeekDay & { meal: MealPlanRow | null })[]
  error?: string
}

async function requireMealAccess() {
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

  const canEdit = await householdHasSharedPlan(supabase, user.id)
  return { supabase, userId: user.id, familyId, canEdit }
}

function mapMealRow(row: {
  id: string
  plan_date: string
  title: string
}): MealPlanRow {
  return {
    id: row.id,
    planDate: row.plan_date,
    title: row.title,
  }
}

export async function getTonightMealGlance(): Promise<TonightMealGlance> {
  const planDate = toHouseholdDateKey(new Date())
  const empty: TonightMealGlance = {
    success: true,
    canEdit: false,
    planDate,
    title: null,
  }

  try {
    const { supabase, familyId, canEdit } = await requireMealAccess()

    const { data, error } = await supabase
      .from('meal_plans')
      .select('id, plan_date, title')
      .eq('family_id', familyId)
      .eq('plan_date', planDate)
      .maybeSingle()

    if (error) {
      return { ...empty, success: false, error: error.message }
    }

    return {
      success: true,
      canEdit,
      planDate,
      title: data?.title ?? null,
    }
  } catch (error) {
    console.error('getTonightMealGlance error:', error)
    return empty
  }
}

export const getCachedTonightMealGlance = cache(getTonightMealGlance)

export async function getWeekMealsData(): Promise<WeekMealsData> {
  const weekDays = buildHouseholdWeekDays()
  const empty: WeekMealsData = {
    success: true,
    canEdit: false,
    days: weekDays.map((d) => ({ ...d, meal: null })),
  }

  try {
    const { supabase, familyId, canEdit } = await requireMealAccess()
    const keys = getHouseholdWeekDateKeys()

    const { data, error } = await supabase
      .from('meal_plans')
      .select('id, plan_date, title')
      .eq('family_id', familyId)
      .in('plan_date', keys)
      .order('plan_date', { ascending: true })

    if (error) {
      return { ...empty, success: false, error: error.message }
    }

    const byDate = new Map((data ?? []).map((row) => [row.plan_date, mapMealRow(row)]))

    return {
      success: true,
      canEdit,
      days: weekDays.map((day) => ({
        ...day,
        meal: byDate.get(day.dateKey) ?? null,
      })),
    }
  } catch (error) {
    console.error('getWeekMealsData error:', error)
    return empty
  }
}

export const getCachedWeekMealsData = cache(getWeekMealsData)

export async function setMealPlan(
  planDate: string,
  title: string
): Promise<{ success: boolean; meal?: MealPlanRow; error?: string }> {
  try {
    const trimmed = title.trim()
    if (!trimmed) {
      return clearMealPlan(planDate)
    }

    const { supabase, userId, familyId, canEdit } = await requireMealAccess()
    if (!canEdit) {
      return { success: false, error: UPGRADE_MESSAGE }
    }

    const { data, error } = await supabase
      .from('meal_plans')
      .upsert(
        {
          family_id: familyId,
          plan_date: planDate,
          title: trimmed,
          created_by: userId,
        },
        { onConflict: 'family_id,plan_date' }
      )
      .select('id, plan_date, title')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/week')
    revalidatePath('/dashboard')
    return { success: true, meal: mapMealRow(data) }
  } catch (error) {
    console.error('setMealPlan error:', error)
    return { success: false, error: 'Failed to save meal' }
  }
}

export async function clearMealPlan(
  planDate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, familyId, canEdit } = await requireMealAccess()
    if (!canEdit) {
      return { success: false, error: UPGRADE_MESSAGE }
    }

    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('family_id', familyId)
      .eq('plan_date', planDate)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/week')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('clearMealPlan error:', error)
    return { success: false, error: 'Failed to clear meal' }
  }
}
