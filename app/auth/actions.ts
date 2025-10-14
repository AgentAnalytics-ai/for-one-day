'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const emailSchema = z.string().email()

/**
 * 🔐 Premium Auth Actions - Billion-Dollar Authentication System
 * Professional, secure authentication with multiple options
 */

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    // For form actions, we redirect to an error page instead of returning
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithMagicLink(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  
  // Validate email
  const result = emailSchema.safeParse(email)
  if (!result.success) {
    redirect('/auth/login?error=' + encodeURIComponent('Invalid email address'))
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  redirect('/auth/magic-link-sent?email=' + encodeURIComponent(email))
}

export async function signInWithPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full-name') as string
  
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
    redirect('/auth/signup?error=' + encodeURIComponent(error.message))
  }

  // Initialize profile and family
  if (data.user) {
    await initializeUserProfile(data.user.id, fullName)
  }

  redirect('/auth/check-email?email=' + encodeURIComponent(email))
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

