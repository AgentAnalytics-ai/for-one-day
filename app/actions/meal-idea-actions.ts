'use server'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { householdHasSharedPlan, resolveFamilyId } from '@/lib/household'

export type MealIdea = {
  id: string
  title: string
  sourceUrl: string | null
  notes: string | null
  createdAt: string
}

async function requireMealIdeaAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const familyId = await resolveFamilyId(supabase, user.id)
  if (!familyId) throw new Error('No household found')

  const canEdit = await householdHasSharedPlan(supabase, user.id)
  return { supabase, userId: user.id, familyId, canEdit }
}

function mapRow(row: {
  id: string
  title: string
  source_url: string | null
  notes: string | null
  created_at: string
}): MealIdea {
  return {
    id: row.id,
    title: row.title,
    sourceUrl: row.source_url,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export async function getMealIdeas(): Promise<{
  success: boolean
  ideas: MealIdea[]
  canEdit: boolean
  error?: string
}> {
  try {
    const { supabase, familyId, canEdit } = await requireMealIdeaAccess()

    const { data, error } = await supabase
      .from('meal_ideas')
      .select('id, title, source_url, notes, created_at')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(24)

    if (error) {
      console.error('getMealIdeas:', error)
      return { success: false, ideas: [], canEdit, error: 'Could not load saved recipes' }
    }

    return {
      success: true,
      ideas: (data ?? []).map(mapRow),
      canEdit,
    }
  } catch (error) {
    console.error('getMealIdeas error:', error)
    return { success: false, ideas: [], canEdit: false, error: 'Could not load saved recipes' }
  }
}

export const getCachedMealIdeas = cache(getMealIdeas)

export async function saveMealIdea(input: {
  title: string
  sourceUrl?: string
  notes?: string
}): Promise<{ success: boolean; idea?: MealIdea; error?: string }> {
  try {
    const { supabase, userId, familyId, canEdit } = await requireMealIdeaAccess()
    if (!canEdit) {
      return { success: false, error: 'Saving recipes is included with Pro for your home.' }
    }

    const title = input.title.trim()
    if (!title) {
      return { success: false, error: 'Give it a name your household will recognize.' }
    }

    const sourceUrl = input.sourceUrl?.trim() || null
    const notes = input.notes?.trim() || null

    const { data, error } = await supabase
      .from('meal_ideas')
      .insert({
        family_id: familyId,
        title,
        source_url: sourceUrl,
        notes,
        created_by: userId,
      })
      .select('id, title, source_url, notes, created_at')
      .single()

    if (error) {
      console.error('saveMealIdea:', error)
      return { success: false, error: 'Could not save recipe' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/week')

    return { success: true, idea: mapRow(data) }
  } catch (error) {
    console.error('saveMealIdea error:', error)
    return { success: false, error: 'Could not save recipe' }
  }
}

export async function deleteMealIdea(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, familyId, canEdit } = await requireMealIdeaAccess()
    if (!canEdit) {
      return { success: false, error: 'Not allowed' }
    }

    const { error } = await supabase
      .from('meal_ideas')
      .delete()
      .eq('id', id)
      .eq('family_id', familyId)

    if (error) {
      console.error('deleteMealIdea:', error)
      return { success: false, error: 'Could not remove recipe' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/week')
    return { success: true }
  } catch (error) {
    console.error('deleteMealIdea error:', error)
    return { success: false, error: 'Could not remove recipe' }
  }
}
