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
  
  // Check for invitation parameters
  const inviteFamilyId = formData.get('invite') as string
  const inviteRole = formData.get('role') as string || 'spouse'
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        full_name: fullName,
        invite_family_id: inviteFamilyId,
        invite_role: inviteRole,
      },
    },
  })

  if (error) {
    redirect('/auth/signup?error=' + encodeURIComponent(error.message))
  }

  // Initialize profile and family
  if (data.user) {
    await initializeUserProfile(data.user.id, fullName, inviteFamilyId, inviteRole)
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
async function initializeUserProfile(userId: string, fullName: string, inviteFamilyId?: string, inviteRole?: string) {
  const supabase = await createClient()

  // Create profile
  await supabase.from('profiles').insert({
    user_id: userId,
    full_name: fullName,
    plan: 'free',
  })

  // Handle family invitation
  if (inviteFamilyId) {
    // Check if invitation exists and is valid
    const { data: invitation } = await supabase
      .from('family_invitations')
      .select('*')
      .eq('family_id', inviteFamilyId)
      .eq('invited_email', (await supabase.auth.getUser()).data.user?.email)
      .eq('status', 'pending')
      .single()

    if (invitation) {
      // Add user to family
      await supabase.from('family_members').insert({
        family_id: inviteFamilyId,
        user_id: userId,
        role: inviteRole || invitation.role,
        invitation_status: 'accepted',
        invited_at: invitation.created_at,
        invited_by: invitation.invited_by,
      })

      // Mark invitation as accepted
      await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)
    } else {
      // No valid invitation found, create new family
      await createNewFamily(userId, fullName)
    }
  } else {
    // No invitation, create new family
    await createNewFamily(userId, fullName)
  }
}

/**
 * Create a new family for the user
 */
async function createNewFamily(userId: string, fullName: string) {
  const supabase = await createClient()

  // Create family
  const { data: family } = await supabase
    .from('families')
    .insert({
      name: `${fullName}'s Family`,
      owner_id: userId,
    })
    .select()
    .single()

  if (family) {
    // Add user as family owner
    await supabase.from('family_members').insert({
      family_id: family.id,
      user_id: userId,
      role: 'owner',
      invitation_status: 'accepted',
    })
  }
}

