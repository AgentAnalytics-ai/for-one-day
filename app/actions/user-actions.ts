'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * 🗄️ User Actions - Database Integration
 * Professional server actions for user content persistence
 */

export async function saveReflection(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const content = formData.get('content') as string
  const bookId = formData.get('bookId') as string
  const chapterNumber = parseInt(formData.get('chapterNumber') as string)

  if (!content?.trim()) {
    return { error: 'Reflection content is required' }
  }

  // Save to devotion_entries table
  const { error } = await supabase
    .from('devotion_entries')
    .insert({
      user_id: user.id,
      book_id: bookId,
      chapter_number: chapterNumber,
      content: content.trim(),
      type: 'reflection',
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error saving reflection:', error)
    return { error: 'Failed to save reflection' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function saveVoiceNote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const title = formData.get('title') as string
  // const audioBlob = formData.get('audioBlob') as File // TODO: Implement audio upload

  if (!title?.trim()) {
    return { error: 'Voice note title is required' }
  }

  // TODO: Upload audio file to Supabase Storage
  // For now, save metadata
  const { error } = await supabase
    .from('vault_items')
    .insert({
      user_id: user.id,
      title: title.trim(),
      type: 'voice_note',
      content: 'Voice note recorded',
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error saving voice note:', error)
    return { error: 'Failed to save voice note' }
  }

  revalidatePath('/one-day')
  return { success: true }
}

export async function saveLegacyNote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const type = formData.get('type') as string
  const recipient = formData.get('recipient') as string

  if (!title?.trim() || !content?.trim()) {
    return { error: 'Title and content are required' }
  }

  const { error } = await supabase
    .from('vault_items')
    .insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      type: type || 'legacy_note',
      recipient: recipient || null,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error saving legacy note:', error)
    return { error: 'Failed to save legacy note' }
  }

  revalidatePath('/one-day')
  return { success: true }
}

export async function setReminder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const time = formData.get('time') as string
  const type = formData.get('type') as string
  const content = formData.get('content') as string

  if (!time) {
    return { error: 'Reminder time is required' }
  }

  // Save reminder to events table
  const { error } = await supabase
    .from('events')
    .insert({
      user_id: user.id,
      title: 'Family Connection Reminder',
      description: content || 'Time for family connection',
      type: type || 'reminder',
      scheduled_for: new Date().toISOString(), // TODO: Parse time properly
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error setting reminder:', error)
    return { error: 'Failed to set reminder' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateUserProgress(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const bookId = formData.get('bookId') as string
  const chapterNumber = parseInt(formData.get('chapterNumber') as string)
  const completed = formData.get('completed') === 'true'

  if (!bookId || !chapterNumber) {
    return { error: 'Book and chapter information required' }
  }

  // Update user progress
  const { error } = await supabase
    .from('devotion_entries')
    .insert({
      user_id: user.id,
      book_id: bookId,
      chapter_number: chapterNumber,
      type: 'completion',
      completed: completed,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error updating progress:', error)
    return { error: 'Failed to update progress' }
  }

  revalidatePath('/devotional/study')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getVaultItems() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('vault_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching vault items:', error)
    return { error: 'Failed to fetch vault items' }
  }

  return { data }
}

export async function getDevotionProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('devotion_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching devotion progress:', error)
    return { error: 'Failed to fetch devotion progress' }
  }

  return { data }
}
