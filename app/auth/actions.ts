'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { sendWelcomeEmail } from '@/lib/email'
import { acceptPendingHouseholdInvitation } from '@/app/actions/household-actions'

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
  const next = (formData.get('next') as string)?.trim()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const nextParam = next ? `&next=${encodeURIComponent(next)}` : ''
    redirect('/auth/password?error=' + encodeURIComponent(error.message) + nextParam)
  }

  // Invite accept page handles token explicitly
  if (next?.startsWith('/auth/accept-invite')) {
    redirect(next)
  }

  if (next && next.startsWith('/') && !next.startsWith('//')) {
    const welcome = next.startsWith('/dashboard') ? (next.includes('?') ? '&welcome=1' : '?welcome=1') : ''
    redirect(`${next}${welcome}`)
  }

  // Generic login: accept pending invite by email (Sara path if token was lost)
  const pending = await acceptPendingHouseholdInvitation()
  if (pending.familyId) {
    redirect('/dashboard?joined=household&welcome=1')
  }

  redirect('/dashboard?welcome=1')
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
  
  const inviteToken = (formData.get('invite-token') as string)?.trim() || ''
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.foroneday.app'
  const callbackUrl = inviteToken
    ? `${siteUrl}/auth/callback?invite_token=${encodeURIComponent(inviteToken)}`
    : `${siteUrl}/auth/callback`

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl,
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

  // Send welcome email via Resend (non-blocking for signup success)
  try {
    await sendWelcomeEmail({ to: email, name: fullName })
  } catch (err) {
    console.error('Failed to send welcome email:', err)
    // Don't fail signup if email fails
  }

  // Redirect to check-email page - EMAIL VERIFICATION REQUIRED
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

  // Family/invite flow removed
}


