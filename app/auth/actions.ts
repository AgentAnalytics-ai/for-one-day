'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const emailSchema = z.string().email()

/**
 * 🔐 Premium Auth Actions - Billion-Dollar Authentication System
 * Professional, secure authentication with multiple options
 */

// Google OAuth removed - using email/password authentication only

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
  
  // Spam protection: Validate display name
  const spamKeywords = [
    '85.000', 'Lira', 'bit.ly', 'tinyurl', 'http://', 'https://',
    'click here', 'free money', 'earn money', 'get rich'
  ]
  const fullNameLower = fullName.toLowerCase()
  const hasSpam = spamKeywords.some(keyword => fullNameLower.includes(keyword.toLowerCase()))
  
  if (hasSpam) {
    redirect('/auth/signup?error=' + encodeURIComponent('Invalid name. Please use your real name.'))
  }
  
  // Spam protection: Block URLs in display name
  if (fullNameLower.includes('http') || fullNameLower.includes('www.') || fullNameLower.includes('.com')) {
    redirect('/auth/signup?error=' + encodeURIComponent('Invalid name. URLs are not allowed.'))
  }
  
  // Family invites removed
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: { full_name: fullName },
    },
  })

  if (error) {
    redirect('/auth/signup?error=' + encodeURIComponent(error.message))
  }

  // Initialize profile only
  if (data.user) {
    await initializeUserProfile(data.user.id, fullName)
  }

  // Send welcome email via Resend (async, don't wait for it)
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: fullName })
    })
  } catch (err) {
    console.error('Failed to send welcome email:', err)
    // Don't fail signup if email fails
  }

  // Redirect directly to dashboard - NO EMAIL VERIFICATION NEEDED
  redirect('/dashboard')
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

  // Family/invite flow removed
}


