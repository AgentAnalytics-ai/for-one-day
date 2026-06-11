'use server'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { householdHasSharedPlan, resolveFamilyId } from '@/lib/household'

export type ListItemKind = 'shopping' | 'todo'

export type ListItem = {
  id: string
  title: string
  done: boolean
  sortOrder: number
  dueDate: string | null
  createdAt: string
}

const UPGRADE_MESSAGE =
  'Shared lists are part of Pro for your home. Upgrade to add groceries and to-dos your household can see together.'

const GLANCE_PREVIEW_LIMIT = 3

export type TodayListGlance = {
  success: boolean
  canEdit: boolean
  shopping: {
    openCount: number
    previewTitles: string[]
  }
  todo: {
    openCount: number
    previewTitles: string[]
  }
  error?: string
}

function mapListRow(row: {
  id: string
  title: string
  done: boolean
  sort_order: number
  due_date: string | null
  created_at: string
}): ListItem {
  return {
    id: row.id,
    title: row.title,
    done: row.done,
    sortOrder: row.sort_order,
    dueDate: row.due_date,
    createdAt: row.created_at,
  }
}

async function requireListAccess(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  familyId: string
  canEdit: boolean
}> {
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

export async function getListPageData(): Promise<{
  success: boolean
  canEdit: boolean
  shopping: ListItem[]
  todos: ListItem[]
  error?: string
}> {
  try {
    const { supabase, familyId, canEdit } = await requireListAccess()

    const { data, error } = await supabase
      .from('list_items')
      .select('id, title, done, sort_order, due_date, created_at, kind')
      .eq('family_id', familyId)
      .order('done', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return { success: false, canEdit: false, shopping: [], todos: [], error: error.message }
    }

    const rows = data ?? []
    return {
      success: true,
      canEdit,
      shopping: rows.filter((r) => r.kind === 'shopping').map(mapListRow),
      todos: rows.filter((r) => r.kind === 'todo').map(mapListRow),
    }
  } catch (error) {
    console.error('getListPageData error:', error)
    return {
      success: false,
      canEdit: false,
      shopping: [],
      todos: [],
      error: error instanceof Error ? error.message : 'Failed to load lists',
    }
  }
}

export async function getTodayListGlance(): Promise<TodayListGlance> {
  const empty: TodayListGlance = {
    success: true,
    canEdit: false,
    shopping: { openCount: 0, previewTitles: [] },
    todo: { openCount: 0, previewTitles: [] },
  }

  try {
    const { supabase, familyId, canEdit } = await requireListAccess()

    const { data, error } = await supabase
      .from('list_items')
      .select('title, done, kind, sort_order, created_at')
      .eq('family_id', familyId)
      .eq('done', false)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return { ...empty, success: false, error: error.message }
    }

    const rows = data ?? []
    const shoppingOpen = rows.filter((r) => r.kind === 'shopping')
    const todoOpen = rows.filter((r) => r.kind === 'todo')

    return {
      success: true,
      canEdit,
      shopping: {
        openCount: shoppingOpen.length,
        previewTitles: shoppingOpen
          .slice(0, GLANCE_PREVIEW_LIMIT)
          .map((r) => r.title),
      },
      todo: {
        openCount: todoOpen.length,
        previewTitles: todoOpen.slice(0, GLANCE_PREVIEW_LIMIT).map((r) => r.title),
      },
    }
  } catch (error) {
    console.error('getTodayListGlance error:', error)
    return empty
  }
}

export const getCachedTodayListGlance = cache(getTodayListGlance)

export async function addListItem(
  kind: ListItemKind,
  title: string
): Promise<{ success: boolean; item?: ListItem; error?: string }> {
  try {
    const trimmed = title.trim()
    if (!trimmed) {
      return { success: false, error: 'Enter an item name' }
    }

    const { supabase, userId, familyId, canEdit } = await requireListAccess()
    if (!canEdit) {
      return { success: false, error: UPGRADE_MESSAGE }
    }

    const today = new Date().toISOString().slice(0, 10)

    const { data, error } = await supabase
      .from('list_items')
      .insert({
        family_id: familyId,
        kind,
        title: trimmed,
        created_by: userId,
        due_date: kind === 'todo' ? today : null,
      })
      .select('id, title, done, sort_order, due_date, created_at')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lists')
    revalidatePath('/dashboard')

    return {
      success: true,
      item: {
        id: data.id,
        title: data.title,
        done: data.done,
        sortOrder: data.sort_order,
        dueDate: data.due_date,
        createdAt: data.created_at,
      },
    }
  } catch (error) {
    console.error('addListItem error:', error)
    return { success: false, error: 'Failed to add item' }
  }
}

export async function toggleListItem(
  id: string,
  done: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, familyId, canEdit } = await requireListAccess()
    if (!canEdit) {
      return { success: false, error: UPGRADE_MESSAGE }
    }

    const { error } = await supabase
      .from('list_items')
      .update({ done })
      .eq('id', id)
      .eq('family_id', familyId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lists')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('toggleListItem error:', error)
    return { success: false, error: 'Failed to update item' }
  }
}

export async function deleteListItem(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, familyId, canEdit } = await requireListAccess()
    if (!canEdit) {
      return { success: false, error: UPGRADE_MESSAGE }
    }

    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('id', id)
      .eq('family_id', familyId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lists')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('deleteListItem error:', error)
    return { success: false, error: 'Failed to remove item' }
  }
}
