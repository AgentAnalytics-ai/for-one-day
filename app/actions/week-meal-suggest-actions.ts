'use server'

import { getWeekScheduleData } from '@/app/actions/calendar-actions'
import { applyWeekMealSuggestions, getCachedWeekMealsData } from '@/app/actions/meal-actions'
import { getCachedMealIdeas } from '@/app/actions/meal-idea-actions'
import {
  favoriteTitlesFromIdeas,
  generateWeekMealSuggestions,
  type WeekMealDaySuggestion,
  type WeekMealSuggestPlan,
} from '@/lib/week-meal-suggest-ai'
import { HOUSEHOLD_TZ } from '@/lib/household-dates'
import { householdHasSharedPlan, resolveFamilyId } from '@/lib/household'
import { createClient } from '@/lib/supabase/server'

const UPGRADE_MESSAGE = 'Meal ideas for your week are included with Pro for your home.'

async function requireWeekSuggestAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const familyId = await resolveFamilyId(supabase, user.id)
  if (!familyId) throw new Error('No household found')

  const canUse = await householdHasSharedPlan(supabase, user.id)
  return { canUse }
}

export async function runWeekMealSuggest(input: {
  notes?: string
  includeBreakfast?: boolean
  includeLunch?: boolean
  includeDinner?: boolean
}): Promise<{ success: boolean; plan?: WeekMealSuggestPlan; error?: string }> {
  try {
    const { canUse } = await requireWeekSuggestAccess()
    if (!canUse) {
      return { success: false, error: UPGRADE_MESSAGE }
    }

    const [weekData, scheduleData, ideasData] = await Promise.all([
      getCachedWeekMealsData(),
      getWeekScheduleData(),
      getCachedMealIdeas(),
    ])

    if (!weekData.success) {
      return { success: false, error: weekData.error ?? 'Could not load this week.' }
    }

    const eventsByDate = scheduleData.eventsByDate ?? {}

    const existingDays = weekData.days.map((day) => {
      const events = eventsByDate[day.dateKey] ?? []
      return {
        planDate: day.dateKey,
        weekday: day.weekdayShort,
        breakfast: day.meal?.breakfastTitle ?? null,
        lunch: day.meal?.lunchTitle ?? null,
        dinner: day.meal?.title ?? null,
        eventCount: events.length,
        isBusy: events.length >= 3,
      }
    })

    const plan = await generateWeekMealSuggestions({
      timezone: HOUSEHOLD_TZ,
      notes: input.notes,
      includeBreakfast: input.includeBreakfast !== false,
      includeLunch: input.includeLunch !== false,
      includeDinner: input.includeDinner !== false,
      favoriteTitles: favoriteTitlesFromIdeas(ideasData.ideas ?? []),
      existingDays,
    })

    if (!plan) {
      return {
        success: false,
        error: 'Could not line up ideas — try again in a moment.',
      }
    }

    return { success: true, plan }
  } catch (error) {
    console.error('runWeekMealSuggest error:', error)
    return { success: false, error: 'Something went wrong. Try again.' }
  }
}

export async function saveWeekMealSuggestions(
  days: WeekMealDaySuggestion[]
): Promise<{ success: boolean; saved: number; error?: string }> {
  try {
    const { canUse } = await requireWeekSuggestAccess()
    if (!canUse) {
      return { success: false, saved: 0, error: UPGRADE_MESSAGE }
    }

    const payload = days
      .filter((d) => d.dinner || d.breakfast || d.lunch)
      .map((d) => ({
        planDate: d.planDate,
        breakfast: d.breakfast,
        lunch: d.lunch,
        dinner: d.dinner,
      }))
      .filter((d) => d.dinner)

    if (payload.length === 0) {
      return { success: false, saved: 0, error: 'Pick at least one day with a dinner.' }
    }

    return applyWeekMealSuggestions(payload)
  } catch (error) {
    console.error('saveWeekMealSuggestions error:', error)
    return { success: false, saved: 0, error: 'Could not save.' }
  }
}
