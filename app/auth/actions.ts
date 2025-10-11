'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const emailSchema = z.string().email()

/**
 * 🔐 Auth actions (server-side)
 */

export async function signInWithMagicLink(email: string) {
  const supabase = await createClient()
  
  // Validate email
  const result = emailSchema.safeParse(email)
  if (!result.success) {
    return { error: 'Invalid email address' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Initialize profile and family
  if (data.user) {
    await initializeUserProfile(data.user.id, fullName)
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * Initialize user profile and family on first signup
 */
async function initializeUserProfile(userId: string, fullName: string) {
  const supabase = await createClient()

  // Create profile
  await supabase.from('profiles').insert({
    user_id: userId,
    full_name: fullName,
    plan: 'free',
  })

  // Create default family
  const { data: family } = await supabase
    .from('families')
    .insert({
      name: `${fullName}'s Family`,
      owner_id: userId,
    })
    .select()
    .single()

  // Add user as family owner
  if (family) {
    await supabase.from('family_members').insert({
      family_id: family.id,
      user_id: userId,
      role: 'owner',
    })
  }
}

